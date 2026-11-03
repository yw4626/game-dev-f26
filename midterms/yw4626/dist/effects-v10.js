(function(root){
'use strict';
const balance=typeof module!=='undefined'&&module.exports?require('./wild-balance-v20.js'):root.WildBalanceV20;
const effects=(def,settings={})=>balance.effects(def,settings),scaled=(effect,mult)=>(effect.amount||0)*(effect.fixed?1:mult);
const stats={luck:['运气','Luck'],growth:['成长','Growth'],greed:['贪婪','Greed'],maxHealth:['生命上限','Max HP'],recovery:['战后回血','After-victory heal'],duration:['持续次数','Duration'],area:['攻击范围','Area'],curse:['诅咒','Curse'],mana:['法力','Mana'],armor:['护甲','Armor'],might:['力量','Might'],amount:['投射数量','Projectiles'],dealCount:['每回合抽牌','Cards per turn'],revival:['复活充能','Revival']};
function multiplier(b,def,chain){return def.receivesComboMultiplier||(b.settings.attackRulesVersion>=10&&b.settings.wildStrength&&def.isPickup)?chain:1;}
function supported(def){
 if(def.sourceDisabled)return false;
 if(def.kind==='character')return !!def.firstEffect&&!!def.reaction;
 if(def.kind==='wild')return true;
 if(def.introducedVersion<10)return true;
 if(def.kind==='attack')return def.key!=='viciousHunger'&&['DamageEffect','PhieraggiEffect'].includes(def.damageEffectType)&&(def.effectDescriptors||[]).every(e=>['damage','keyword'].includes(e.kind)||['HealEffect','RemoveIntentEffect','BouncyEffect'].includes(e.sourceType));
 return (def.effectDescriptors||[]).length>0&&def.effectDescriptors.every(e=>['stat','draw','destroy','keyword'].includes(e.kind)&&e.stat!=='charm');
}
function heal(b,amount,card){const before=b.player.health;b.player.health=Math.min(b.player.maxHealth,Math.max(0,before+amount));b.log('heal',`恢复 ${b.player.health-before} 生命`,{cardId:card.id,amount:b.player.health-before,before,after:b.player.health});}
function stat(b,card,key,amount){
 if(!Number.isFinite(amount))throw Error('Invalid effect amount');
 if(key==='dealCount'){
  b.settings.dealCount+=amount;const ceiling=b.settings.handLimitCeiling||7;if(b.settings.handLimit<ceiling)b.settings.handLimit=Math.min(ceiling,b.settings.handLimit+amount);
  b.log('deal_gain',`每回合抽牌 +${amount}`,{cardId:card.id,amount,dealCount:b.settings.dealCount,handLimit:b.settings.handLimit});return;
 }
 if(key==='revival'){
  b.player.revival=(b.player.revival||0)+amount;b.player.revivalStacks??=0;
  while(b.player.revival>=100&&b.player.revivalStacks<3){b.player.revival-=100;b.player.revivalStacks++;}
  if(b.player.revivalStacks>=3)b.player.revival=0;
 }
 else if(key==='maxHealth'){b.player.maxHealth+=amount;}
 else if(key==='mana')b.player.mana=Math.fround(Math.max(0,Math.min(1000000,b.player.mana+amount)));
 else b.player[key]=(b.player[key]||0)+amount;
 b.log(key+'_gain',`${stats[key]?.[0]||key} +${amount}`,{cardId:card.id,stat:key,amount,total:b.player[key]});
}
function execute(b,card,def,chain,snapshot){
 const mult=multiplier(b,def,chain);
 if(def.kind==='wild'){
  for(const e of effects(def,b.settings)){
   if(e.type==='luck'||e.type==='armor'||e.type==='greed')stat(b,card,e.type,scaled(e,mult));
   else if(e.type==='manaGain')stat(b,card,'mana',scaled(e,mult));
   else if(e.type==='drawCount')b.draw(scaled(e,mult)+Math.trunc(snapshot.magnet||0));
   else if(e.type==='heal')heal(b,scaled(e,mult),card);
   else if(e.type==='coins'){const amount=Math.ceil(scaled(e,mult)*(1+(snapshot.greed||0)/100));b.log('coins_gain',`金币 +${amount}`,{cardId:card.id,amount});}
   else if(e.type==='damage'&&e.freezeStacks){for(let wave=0;wave<e.baseAmount*mult;wave++)freezeFront(b,card,e.freezeStacks);}
   else if(e.type==='kill'){eraseRows(b,card,e.count*mult);}
   else if(e.type==='damage'&&e.damagePerHit){b.resolvePatternAttack(card,{...def,attackPattern:'random',pierce:1},{damage:e.damagePerHit*(1+(snapshot.might||0)/100),hits:e.baseAmount*mult+(snapshot.amount||0)});}
   else if(e.type==='wings'){
    let count=0;for(const c of b.piles.hand)if(!c.wingDiscount){c.wingDiscount=e.reduceAmount;count++;}
    b.log('wings',`当前手牌下次打出费用 -${e.reduceAmount}`,{cardId:card.id,count});
   }
   // Ordinary ComboEffect supplies the W bridge. Its extra increment requires
   // the native return-to-hand gem, which this prototype does not expose.
   // The authored Friendship buff is applied separately by Battle.play.
  }
  return true;
 }
 if(def.kind==='character'||def.kind==='attack'||!def.effectDescriptors)return false;
 for(const e of def.effectDescriptors){
  if(e.kind==='stat')stat(b,card,e.stat,e.amount*mult);
  else if(e.kind==='draw')b.draw(e.count*mult+Math.trunc(snapshot.magnet||0));
 }
 return true;
}
function afterAttack(b,card,def,chain,snapshot){
 const mult=multiplier(b,def,chain);
 for(const e of def.effectDescriptors||[]){
  if(e.sourceType==='HealEffect')heal(b,e.raw._healAmount*mult,card);
  if(e.sourceType==='RemoveIntentEffect'){
   let candidates=front(b).filter(n=>n.intent&&(e.raw._removeAllIntents||n.intent.actions.some(a=>a.kind==='attack')));
   while(candidates.length>e.raw._count)candidates.splice(Math.floor(b.effectRandom()*candidates.length),1);
   for(const enemy of candidates)if(b.effectRandom()*100>=(enemy.disarmResistance||0)){
    enemy.intent=null;b.log('disarm',`${enemy.name}的意图被移除`,{enemyId:enemy.id,cardId:card.id});
   }
  } }
}

function front(b){const cols=new Map();for(const [i,e]of b.enemies.entries()){if(e.health<=0||e.finalBoss&&b.enemies.some(n=>n.health>0&&!n.finalBoss))continue;const col=e.slot?.column??i,old=cols.get(col);if(!old||(e.slot?.row||0)<(old.slot?.row||0))cols.set(col,e);}return [...cols.values()];}
function freezeTarget(b,card,enemy,stacks,extra={}){
 if(enemy.health<=0||stacks<=0)return false;
 if(b.effectRandom()*100<(enemy.freezeResistance||0)){
  b.log('freeze_resisted',enemy.name+'抵抗了冻结',{...extra,enemyId:enemy.id,cardId:card.id});return false;
 }
 enemy.freezeStacks=(enemy.freezeStacks||0)+stacks;if(enemy.intent)enemy.frozenIntent=enemy.intent;enemy.intent=null;
 b.log('freeze',enemy.name+'被冻结，本轮意图暂停',{...extra,enemyId:enemy.id,cardId:card.id,stacks:enemy.freezeStacks});return true;
}
function freezeFront(b,card,stacks){for(const enemy of front(b))freezeTarget(b,card,enemy,stacks);}
function eraseRows(b,card,count){
 const rows=[...new Set(b.living().map(e=>e.slot?.row||0))].sort((a,b)=>a-b).slice(0,Math.max(0,Math.trunc(count)));
 for(const enemy of b.living().filter(e=>rows.includes(e.slot?.row||0))){
  const damage=enemy.armor+Math.min(enemy.health,(1-(enemy.instakillResist||0))*enemy.maxHealth);
  b.applyDamage(card,enemy,damage,{pattern:'erase',wave:1,hit:1});
 }
}
function hit(b,card,def,target,damage,extra,areaTargets){
 // Zero-damage freezing projectiles apply status without consuming existing freeze.
 if(def.freezeStacks>0&&damage<=0){
  const raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
  const mult=raw?._freezeStacksScaleWithCombo?b.comboPreview(card).multiplier:1;
  freezeTarget(b,card,target,def.freezeStacks*mult,extra);return false;
 }
 const nativeAreaTargets=b.settings.attackRulesVersion>=13?(areaTargets||front(b)):null;
 const initialFront=b.settings.attackRulesVersion===12?new Set(front(b).map(e=>e.id)):null;
 const initialRear=initialFront?b.living().filter(e=>!initialFront.has(e.id)):null;
 const critical=!!def.canCrit&&b.effectRandom()<Math.min(1,(1+(b.player.luck||0)/100)*(def.critChance||0));
 const frozen=target.freezeStacks>0,raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
 let amount=damage*(critical?(def.critMultiplier||1):1)*(frozen?2:1);
 if(b.settings.attackRulesVersion>=12){
  // Native GetDamageToDo (freeze) precedes GetEnemyDamage (critical + ToEven).
  const value=(frozen?Math.ceil(damage*2):damage)*(critical?(def.critMultiplier||1):1),low=Math.floor(value);
  amount=value-low===.5?(low%2===0?low:low+1):Math.round(value);
 }
 const hadAttack=target.intent?.actions.some(a=>a.kind==='attack');
 b.applyDamage(card,target,amount,{...extra,critical,frozen});
 if(frozen){target.freezeStacks--;if(!target.freezeStacks){if(target.health>0)target.intent=target.frozenIntent||null;delete target.frozenIntent;}b.log('freeze_consumed','冰冻层消耗，伤害 ×2',{cardId:card.id,enemyId:target.id,stacks:target.freezeStacks});}
 if(critical){b.log('critical','暴击！',{cardId:card.id,enemyId:target.id,multiplier:def.critMultiplier});const mode=raw?._critEffectType??3,trigger=mode===2||mode===0&&!card.criticalTriggered||mode===1&&card.criticalWave!==extra.wave;if(trigger){for(const e of def.criticalEffects||[])if(e.type==='HealEffect')heal(b,e._healAmount,card);card.criticalTriggered=true;card.criticalWave=extra.wave;}}
 const area=raw?raw._ignoreArea?0:((def.area||0)+(b.player.area||0))/100:0;
 if(b.settings.attackRulesVersion>=13&&!extra.suppressArea)b.applyNativeArea(card,def,damage,extra,nativeAreaTargets);
 else if(area>0&&!extra.suppressArea){const targets=initialRear||front(b);for(const enemy of targets)b.applyDamage(card,enemy,damage*area*.2,{...extra,pattern:initialRear?'rear-splash':'splash',source:initialRear?'rear_splash':undefined,splash:true,rearSplash:!!initialRear});}
 if(target.health>0&&hadAttack&&raw?._canKnockback&&extra.allowKnockback){
  const chance=(100-(target.knockbackResistance||0))*(def.knockback||0)/100;
  if(b.effectRandom()*100<chance){target.intent=target.intent?{...target.intent,actions:target.intent.actions.filter(a=>a.kind!=='attack')}:null;if(!target.intent?.actions.length)target.intent=null;b.log('knockback',`${target.name}被击退，攻击意图取消`,{cardId:card.id,enemyId:target.id});}return true;
 }return false;
}

function revive(b){if((b.player.revivalStacks||0)<1)return false;b.player.revivalStacks--;b.player.health=Math.ceil(b.player.maxHealth);b.log('revive','复活！恢复至生命上限',{health:b.player.health,remaining:b.player.revivalStacks});return true;}
// Shared numerical preview for card faces and the engine; no mutation or RNG.
function wildPreview(def,mult=1,{settings={},player={},enemies=[],hand=[],cardId}={}){
 const p={draw:0,armor:0,manaGain:0,luckGain:0,greedGain:0,healGain:0,coinsGain:0};
 for(const e of effects(def,settings)){
  const value=scaled(e,mult);
  if(['armor','luck','greed'].includes(e.type))p[e.type==='armor'?'armor':e.type+'Gain']+=value;
  else if(e.type==='manaGain')p.manaGain+=value;
  else if(e.type==='drawCount')p.draw+=value+Math.trunc(player.magnet||0);
  else if(e.type==='heal')p.healGain+=value;
  else if(e.type==='coins')p.coinsGain+=Math.ceil(value*(1+(player.greed||0)/100));
  else if(e.type==='damage'&&e.freezeStacks){p.freezeWaves=e.baseAmount*mult;p.freezeStacks=e.freezeStacks;}
  else if(e.type==='damage'){
   const raw=e.damagePerHit*(1+(player.might||0)/100),lo=Math.floor(raw);
   p.wildDamage=settings.attackRulesVersion>=12?(raw-lo===.5?(lo%2===0?lo:lo+1):Math.round(raw)):raw;
   p.wildHits=e.baseAmount*mult+(player.amount||0);
  }
  else if(e.type==='kill')p.eraseRows=e.count*mult;
  else if(e.type==='wings'){p.wingDiscount=e.reduceAmount;p.wingCards=hand.filter(c=>c.id!==cardId&&!c.wingDiscount).length;}
 }
 p.actualHealGain=Math.min(p.healGain,Math.max(0,(player.maxHealth??p.healGain)-(player.health||0)));
 p.availableRows=new Set(enemies.filter(e=>e.health>0).map(e=>e.slot?.row||0)).size;
 p.wildRole=balance.cards[def.key]?.role;
 return p;
}
function wildNotes(def,p,en=false){
 const out=[];
 if(p.healGain)out.push(en?`Actual heal ${p.actualHealGain}; capped by missing HP`:`实际恢复 ${p.actualHealGain}，最多恢复至生命上限`);
 if(p.draw)out.push(en?'Draw is limited by hand capacity and available cards':'抽牌受手牌容量和可用牌数量限制');
 if(p.luckGain)out.push(en?'Luck persists for this run; improves eligible critical hits and bonus gem choices':'运气在本局持续，影响可暴击攻击和额外宝石选项概率');
 if(p.greedGain)out.push(en?'Greed is fixed, lasts this run, and boosts later coin cards; not this payout':'贪婪固定增加，持续本局，只加成后续金币牌；本次金币不享受新加成');
 if(def.key==='coinCard'&&p.manaGain)out.push(en?'Mana +1 is fixed; only gold scales with combo':'法力固定 +1，仅金币随连击增幅');
 if(p.wingDiscount)out.push(en?'Current hand only; no stacking or combo scaling; expires on play or turn end':'仅当前手牌；减费不叠加、不受连击放大；打出或回合结束清除');
 if(p.freezeWaves)out.push(en?'Front row only; resistance can prevent freeze; remaining freeze skips the next enemy action; hits consume freeze for double damage':'仅前排，受冰冻抗性影响；冻结未消耗时跳过下一次敌人行动；受到攻击会消耗冻结并承受双倍伤害');
 if(p.eraseRows)out.push(en?'Existing rows at cast time; instant-kill resistance reduces damage, so bosses are not guaranteed kills':'按打出时已有排选择；秒杀抗性降低伤害，不能保证秒杀Boss');
 if(p.wildHits)out.push(en?'Might and projectiles included; random front targets, before armor/freeze':'已计入力量与投射数量；随机前排目标，未计护甲和冰冻');
 return out;
}
function descriptions(def,mult=1,en=false,{friendshipBonus=0,settings={},preview}={}){
 const lang=en?1:0,lines=[];
 if(def.kind==='wild')for(const e of effects(def,settings)){
  const value=scaled(e,mult),fixed=e.fixed?(en?' fixed':' 固定'):'',p=preview||wildPreview(def,mult,{settings});
  if(stats[e.type])lines.push(`${stats[e.type][lang]} +${value}${e.type==='greed'?'%':''}${fixed}`);
  else if(e.type==='manaGain')lines.push(`${stats.mana[lang]} +${p.manaGain}${fixed}`);
  else if(e.type==='drawCount')lines.push(en?`Draw ${p.draw-(p.gemDraw||0)}`:`抽牌 ${p.draw-(p.gemDraw||0)}`);
  else if(e.type==='coins')lines.push(en?`Gold +${p.coinsGain}`:`金币 +${p.coinsGain}`);
  else if(e.type==='heal')lines.push(en?`Heal ${p.healGain}`:`治疗 ${p.healGain}`);
  else if(e.type==='damage')lines.push(e.freezeStacks?(en?`Freeze front ×${p.freezeWaves}`:`冰冻前排 · ${p.freezeWaves}次`):`${p.wildDamage} × ${p.wildHits}`);
  else if(e.type==='kill')lines.push(en?`Erase first ${e.count*mult} rows`:`抹除前 ${e.count*mult} 排`);
  else if(e.type==='wings')lines.push(en?'Hand cost −1':'手牌费用 −1');
  else if(e.type==='combo'){if(friendshipBonus)lines.push(en?`Extra combo +${friendshipBonus}`:`额外连击 +${friendshipBonus}`);else lines.push(en?'Continue any combo':'任意费用接续连击');}
 }
 else for(const e of def.effectDescriptors||[]){if(e.kind==='stat'&&e.stat==='recovery'){lines.push(en?`Victory heal +${e.amount*mult}`:`战后回血 +${e.amount*mult}`);continue;}if(e.kind==='stat')lines.push(`${stats[e.stat]?.[lang]||e.stat} +${e.amount*mult}`);else if(e.kind==='draw')lines.push(en?`Draw ${e.count*mult}`:`抽牌 ${e.count*mult}`);}
 return lines;
}
const api={stats,multiplier,supported,execute,afterAttack,heal,stat,descriptions,hit,front,freezeFront,eraseRows,revive,balance,effects,wildPreview,wildNotes};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EffectsV10=api;
})(typeof globalThis!=='undefined'?globalThis:this);
