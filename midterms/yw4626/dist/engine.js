(function (root) {
  'use strict';
  const commonJS=typeof module !== 'undefined' && module.exports;
  const roster=commonJS?require('./battle-roster.js'):root.BattleRoster;
  const bossRules=commonJS?require('./boss-rules.js'):root.BossRules;
  const baseCatalog=commonJS?require('./catalog.js'):root.GameCatalog;
  const extraCatalog=commonJS?require('./extra-cards.js'):root.ExtraCardCatalog;
  const supportCatalog=commonJS?require('./extra-cards-v7.js'):(root.ExtraCardCatalogV7||{cards:{},sources:[]});
  const characterData=commonJS?require('./characters-evolution.js'):root.CharacterEvolutionCatalog;
  const newCharacters=commonJS?require('./characters-v14.js'):root.CharactersV14;
  const attackPatterns=commonJS?require('./attack-patterns.js'):root.CrawlerAttackPatterns;
  const wildCards=commonJS?require('./wild-cards.js'):root.CrawlerWildCards;
  const evolutionData=commonJS?require('./evolution-v10.js'):root.EvolutionV10;
  const wildV10=commonJS?require('./wild-v10.js'):root.WildV10;
  const effectsV10=commonJS?require('./effects-v10.js'):root.EffectsV10;
  const specials=commonJS?require('./combat-specials.js'):root.CombatSpecials;
  const characters={...characterData.characters,...newCharacters.characters};
  Object.assign(characterData.cards,newCharacters.cards);
  const gems=commonJS?require('./gems.js'):root.CrawlerGems;
  gems.catalog.gems.evolve=characterData.evolutionGem;
  Object.assign(gems.catalog.cardSlots,evolutionData.cardSlots,wildV10.cardSlots);
  for(const [key,card] of Object.entries({...supportCatalog.cards,...characterData.cards,...wildCards.cards})){
    const slots=gems.catalog.cardSlots[card.assetId];if(slots)gems.catalog.cardSlots[key]=slots;
  }
  const catalog={...baseCatalog,cards:{...evolutionData.cards,...wildV10.cards,...baseCatalog.cards,...extraCatalog.cards,...supportCatalog.cards,...characterData.cards,...wildCards.cards},sources:[...(baseCatalog.sources||[]),...(extraCatalog.sources||[]),...(supportCatalog.sources||[]),...(gems.catalog.sources||[]),...characterData.sources,...newCharacters.sources,...wildCards.sources,...attackPatterns.sources,...evolutionData.sources,...wildV10.sources]};
  for(const [key,card] of Object.entries(catalog.cards)){
    const extra=evolutionData.cards[key],wild=wildV10.cards[key];
    catalog.cards[key]={...card,...characterData.cardMetadata[card.assetId],...(extra?{effectDescriptors:extra.effectDescriptors,sourceDisabled:extra.sourceDisabled,group:extra.group,cardType:extra.cardType,color:extra.color,canCrit:extra.canCrit,critChance:extra.critChance,critMultiplier:extra.critMultiplier,criticalEffects:extra.criticalEffects,knockback:extra.knockback,freezeStacks:extra.freezeStacks,weaponDirection:extra.weaponDirection,damageEffectType:extra.damageEffectType,unlock:extra.unlock}:{}),...(wild?{...wild,group:extra?.group||card.group}:{}),
      introducedVersion:baseCatalog.cards[key]||extraCatalog.cards[key]||supportCatalog.cards[key]||characterData.cards[key]||wildCards.cards[key]?8:10};
    const d=catalog.cards[key];if(d.effectDescriptors?.some(e=>e.kind==='destroy'))d.destroyOnPlay=true;
    // The legacy draw card predates this field; retain the extracted flag so
    // the generic DrawEffect consumer agrees with the card's combo preview.
    if(d.kind==='draw'&&extra?.receivesComboMultiplier!==undefined)d.receivesComboMultiplier=extra.receivesComboMultiplier;
    d.runtimeEnabled=effectsV10.supported(d);
  }
  const evolutionRecipes=evolutionData.recipes.map(r=>({...r,runtimeEnabled:!r.sourceDisabled&&catalog.cards[r.resultKey]?.runtimeEnabled}));
  // Authored balance change, separate from the unmodified extracted ComboEffect.
  const friendship={version:19,key:'combo',extraCombo:2};
  catalog.cards.combo.prototypeBuff={...friendship,source:'user-requested balance',scope:'extra combo after this card resolves'};
  function friendshipBonus(def,settings={}){return def.key===friendship.key&&settings.friendshipRulesVersion===friendship.version?friendship.extraCombo:0;}
  const EPSILON = 0.000009999999747378752;
  const profiles = {
    demo: {name:'演示配置 · 全支持卡池', health:50, startingMana:3, startingArmor:0, dealCount:5, handLimit:7, magnet:0, might:0, amount:0},
    base: {name:'资源基础配置 · 默认解锁池', health:50, startingMana:2, startingArmor:0, dealCount:3, handLimit:4, magnet:0, might:0, amount:0}
  };
  function hash(text) { let h=2166136261; for(const c of String(text)) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
  function rng(seed) { let a=hash(seed); const next=()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; next.state=()=>a; next.restore=value=>{a=value|0;return next;};return next; }
  function shuffle(items, random) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
  function roundEven(n) { const lo=Math.floor(n), fraction=n-lo; return fraction===0.5 ? (lo%2===0?lo:lo+1) : Math.round(n); }
  function definition(card) {
    const base=catalog.cards[card.key], level=Math.max(0,Math.min(base?.maxLevel??2,card.level||0));
    if(!base)throw Error('Unknown card');
    // Attack upgrades use extracted levels. Support upgrades are prototype design.
    const targeting=attackPatterns.cards[card.key]||evolutionData.attackPatterns[card.key];
    return {...base,...(base.levels?.[level]||{}),...(targeting?{attackPattern:targeting.attackPattern,targetingMode:targeting.targetingMode,pierceType:targeting.pierceType,priority:targeting.priority,...targeting.levels[Math.min(level,targeting.levels.length-1)]}:{}),level,name:base.name+(level?` +${level}`:''),
      ...(base.kind==='draw'?{drawCount:base.drawCount+level}:{}),...(base.kind==='armor'?{armor:base.armor+3*level}:{})};
  }
  function cost(card, mana, combo=false) {
    const gem=gems.modifiers(card);
    if(!combo && (card.free || card.temporaryFree || gem.free)) return 0;
    const modifier=(card.modifiers || []).reduce((a,b)=>a+b,0)+gem.cost, def=catalog.cards[card.key];
    if(def.costType==='wild') return 0;
    return (def.costType==='x'?Math.trunc(Math.fround(mana)):def.cost)+modifier-(card.wingDiscount||0);
  }
  function damageProfile(def, player, multiplier, gemMultiplier=1) {
    const might=def.ignoreMight?1:Math.fround(1+Math.fround(Math.fround(player.might)/100));
    const c=def.damageScalesWithCombo&&!def.ignoreCombo?multiplier:1;
    const a=def.damageScalesWithAmount&&!def.ignoreAmount?player.amount:0;
    const hits=def.baseAmount*(def.amountScalesWithCombo&&!def.ignoreCombo?multiplier:1)+(def.ignoreAmount||def.damageScalesWithAmount?0:player.amount);
    return {damage:roundEven(def.baseDamage*might*gemMultiplier*Math.fround(c+a)), hits:Math.max(0, Math.trunc(hits))+(def.damageEffectType==='PhieraggiEffect'?Math.min(10,Math.floor(((player.revivalStacks||0)*100+(player.revival||0))*.01)):0)};
  }
  function resolveEnemyHit(enemy, damage) {
    if(!Number.isFinite(damage)||damage<0) throw Error('Damage must be finite and nonnegative');
    const healthBefore=enemy.health, armorBefore=enemy.armor;
    const healthDamage=Math.max(damage-armorBefore,0), armorDamage=damage-healthDamage;
    enemy.armor=Math.max(armorBefore-damage,0); enemy.health=Math.max(healthBefore-healthDamage,0);
    // Native defeat uses an epsilon. Canonicalize tiny fractional splash
    // remainders so UI, XP and run kill totals share that same dead state.
    if(enemy.health<EPSILON)enemy.health=0;
    return {healthBefore, armorBefore, healthAfter:enemy.health, armorAfter:enemy.armor, armorDamage, healthDamage, overkill:Math.max(healthDamage-healthBefore,0), actualLoss:healthBefore-enemy.health};
  }
  function attackSummary(def,player={},multiplier=1,enemies,gemMultiplier=1,rulesVersion=9){
    const areaAttack=rulesVersion===12&&specials.isAreaAttack(def);
    const effect=damageProfile(def,{might:0,amount:0,...player},multiplier,gemMultiplier),pierce=areaAttack?5:Math.max(1,Math.trunc(def.pierce||1));
    const alive=enemies?.length?roster.active(enemies):undefined,targetCount=alive?(areaAttack?frontEnemies(alive).length:Math.min(pierce,alive.length)):pierce;
    const perWave=alive?(def.pierceType===1&&alive.length?pierce:targetCount):pierce;
    const maxImpactCount=effect.hits*perWave;
    return {...effect,areaSplashDamage:rulesVersion>=13?specials.areaInfo(def,player,effect.damage).damage:undefined,areaAttack,rearSplashDamage:areaAttack?specials.rearSplashDamage(effect.damage,(def.area||0)+(player.area||0)):0,special:specials.describe(def,{player,multiplier,damage:effect.damage,rulesVersion}),waves:effect.hits,attackPattern:areaAttack?'front-row':def.attackPattern||'selected',targetingMode:def.targetingMode||'SelectedTarget',
      targetMode:pierce>1?(def.attackPattern==='whip'?'sweep':'piercing'):'single',pierce,effectivePierce:pierce,configuredPierce:def.configuredPierce??pierce,area:def.area||0,targetCount,maxImpactCount,totalDamage:effect.damage*maxImpactCount};
  }
  function frontEnemies(enemies){
    const columns=new Map();
    for(const [i,e]of enemies.entries()){
      if(e.health<EPSILON||roster.waiting(e,enemies))continue;
      const slot=e.slot||{row:0,column:i},old=columns.get(slot.column);
      if(!old||slot.row<(old.enemy.slot?.row||0))columns.set(slot.column,{enemy:e,column:slot.column});
    }
    return [...columns.values()].sort((a,b)=>a.column-b.column);
  }
  function selectIntent(options, previous, random, phaseStart=false) {
    let eligible=options.filter(i=>i.weight>0&&(i.consecutive||i.id!==previous));
    if(phaseStart&&eligible.some(i=>i.priority)) eligible=eligible.filter(i=>i.priority);
    const total=eligible.reduce((sum,i)=>sum+i.weight,0);
    if(!total) return null;
    let roll=random()*total;
    for(const i of eligible){roll-=i.weight;if(roll<0)return i;}
    return eligible[eligible.length-1];
  }
  class Battle {
    constructor({seed='CRAWL-01', profile='demo', deck:customDeck, enemies:customEnemies, player:customPlayer, settings:customSettings}={}) {
      this.seed=String(seed).slice(0,200)||'CRAWL-01'; this.profile=profiles[profile]?profile:'demo'; this.settings={...profiles[this.profile]};
      if(customSettings)Object.assign(this.settings,customSettings);
      this.deckRandom=rng(this.seed+':deck'); this.intentRandom=rng(this.seed+':intent');this.targetRandom=rng(this.seed+':target');this.effectRandom=rng(this.seed+':effects');
      this.phase='setup'; this.turn=0; this.combo=0; this.previousCost=null;this.previousWild=false; this.reverseCombo=false;this.resolvingCard=null; this.enemyQueue=[];
      this.events=[]; this.actions=[]; this.eventId=0;
      this.player={area:this.settings.area||0,recovery:0,greed:0,revival:0,health:this.settings.health,maxHealth:this.settings.health,armor:0,mana:0,might:this.settings.might,amount:this.settings.amount,magnet:this.settings.magnet,growth:this.settings.growth||0,curse:this.settings.curse||0,duration:this.settings.duration||0,luck:this.settings.luck??wildCards.luckStat.base,greed:this.settings.greed||0,revival:this.settings.revival||0,revivalStacks:this.settings.revivalStacks||0};
      if(customPlayer)Object.assign(this.player,customPlayer);
      let id=0;
      const deck=customDeck?JSON.parse(JSON.stringify(customDeck)):['whip','whip','wand','wand','fire','fire','axe','axe','cross','cross','draw','draw','armor','armor'].map(key=>({id:++id,key,free:false,temporaryFree:false,modifiers:[0,0,0,0]}));
      for(const card of deck){const valid=gems.validate(card);if(!valid.ok)throw Error('Invalid card gems: '+valid.reason);}
      this.cardCount=deck.length;
      this.piles={draw:shuffle(deck,this.deckRandom),hand:[],discard:[],combo:[],fcc:[],destroyed:[]};this.activeFCC=[];
      this.enemies=['ghost','zombie','lion'].map((key,i)=>({id:i+1,key,...catalog.enemies[key],health:catalog.enemies[key].health,maxHealth:catalog.enemies[key].health,armor:0,intent:null,previousIntent:null}));
      if(customEnemies)this.enemies=customEnemies.map((e,i)=>({...JSON.parse(JSON.stringify(e)),id:i+1,maxHealth:e.health,armor:e.armor||0,intent:null,previousIntent:null}));
      if(this.settings.attackRulesVersion>=12)this.compactFormation(false);
      this.target=1;
      this.log('start',`进入暮影地窖 · ${this.settings.name}`,{seed:this.seed,profile:this.profile});
      bossRules.init(this);this.beginPlayerTurn();
    }
    log(type,text,data={}) {this.events.push({id:++this.eventId,turn:this.turn,type,text,...data});}
    living() {return roster.active(this.enemies);}
    compactFormation(animate=true){
      const columns=new Map();
      this.enemies.forEach((enemy,i)=>{if(enemy.health<EPSILON||roster.waiting(enemy,this.enemies))return;const column=enemy.slot?.column??i;if(!columns.has(column))columns.set(column,[]);columns.get(column).push(enemy);});
      for(const [column,enemies] of columns){
        enemies.sort((a,b)=>(a.slot?.row||0)-(b.slot?.row||0)||a.id-b.id);
        enemies.forEach((enemy,row)=>{const fromRow=enemy.slot?.row||0;enemy.slot={row,column};
          if(animate&&fromRow!==row)this.log('enemy_advance',`${enemy.name}向前补位`,{enemyId:enemy.id,column,fromRow,toRow:row});
          if(row>0)enemy.intent=null;
        });
      }
    }
    decideIntent(enemy){
      if(enemy.health<EPSILON||enemy.freezeStacks>0)return;
      enemy.intent=bossRules.intent(this,enemy)||selectIntent(enemy.intents,enemy.previousIntent,this.intentRandom,this.turn===1);enemy.previousIntent=enemy.intent?.id??null;
      this.log('intent',`${enemy.name}准备${enemy.intent?.actions.map(a=>a.kind==='attack'?`攻击 ${a.value}`:a.kind==='armor'?`获得 ${a.value} 护甲`:'等待').join('、')||'等待'}`,{enemyId:enemy.id,intentId:enemy.intent?.id,weight:enemy.intent?.weight});
    }
    enableCombatV12(){
      if(this.settings.attackRulesVersion<10||this.settings.attackRulesVersion>=12)return false;
      this.settings.attackRulesVersion=12;this.compactFormation(false);
      return true;
    }
    chooseTarget(id) {if(this.phase!=='player')return false; const e=this.living().find(e=>e.id===id);if(!e)return false;this.target=id;return true;}
    recycle() {
      if(!this.piles.discard.length)return false;
      const n=this.piles.discard.length;
      // pop() is the top. Recycled ordinary cards go below remaining draw cards.
      this.piles.draw=[...shuffle(this.piles.discard,this.deckRandom),...this.piles.draw];this.piles.discard=[];
      this.log('recycle',`将 ${n} 张弃牌洗回抽牌堆底部`,{count:n});return true;
    }
    releaseCombo(reset=false) {
      this.destroyPendingCards();
      const n=this.piles.combo.length;this.piles.discard.push(...this.piles.combo);this.piles.combo=[];
      if(n)this.log('discard_combo',`${n} 张连击牌移入弃牌堆`,{count:n});
      if(reset){this.combo=0;this.previousCost=null;this.previousWild=false;}
    }
    destroyPendingCards(){
      const consumed=this.piles.combo.filter(c=>c.pendingDestroy);
      if(!consumed.length)return;
      this.piles.destroyed??=[];
      for(const card of consumed){delete card.pendingDestroy;this.piles.destroyed.push(card);this.log('card_destroy',`「${definition(card).name}」已销毁`,{cardId:card.id,key:card.key});}
      this.piles.combo=this.piles.combo.filter(c=>!consumed.includes(c));
    }
    draw(count, initial=false) {
      count=Math.max(0,Math.trunc(count));this.log('draw_request',`请求抽 ${count} 张牌${initial?'（回合开始）':''}`,{count,initial});
      if(this.piles.draw.length<count){const moved=this.recycle();if(!moved||this.piles.draw.length<count){this.releaseCombo(false);this.recycle();}}
      let drawn=0;
      for(let i=0;i<count;i++) {
        const occupied=this.piles.hand.length-(this.resolvingCard&&this.piles.hand.some(c=>c.id===this.resolvingCard)?1:0);
        if(occupied>=this.settings.handLimit){this.log('draw_limit','手牌已满，未抽的牌留在抽牌堆');break;}
        const card=this.piles.draw.pop();if(!card){this.log('draw_empty','可用牌不足，本次抽牌提前结束');break;}
        this.piles.hand.push(card);drawn++;this.log('draw',`抽到「${definition(card).name}」`,{cardId:card.id,key:card.key});
      }
      return drawn;
    }
    comboPreview(card) {
      const value=cost(card,this.player.mana,true);
      const continues=this.combo===0||definition(card).costType==='wild'||this.previousWild||value===this.previousCost+1||(this.reverseCombo&&value===this.previousCost-1);
      const multiplier=continues?this.combo+1:1,comboBonus=friendshipBonus(definition(card),this.settings);
      return {cost:value,continues,multiplier,comboBonus,resultCombo:multiplier+comboBonus,comboBefore:this.combo};
    }
    cardPreview(card) {
      const def=definition(card), chain=this.comboPreview(card), gem=gems.modifiers(card);
      const supportMultiplier=effectsV10.multiplier(this,def,chain.multiplier);
      const wildPreview=def.kind==='wild'?effectsV10.wildPreview(def,supportMultiplier,{settings:this.settings,player:this.player,enemies:this.living(),hand:this.piles.hand,cardId:card.id}):null;
      const gemDraw=gems.installed(card).filter(k=>gems.catalog.gems[k]?.effect==='draw').reduce((n,k)=>n+gems.catalog.gems[k].value+Math.trunc(this.player.magnet),0);
      return {cost:cost(card,this.player.mana),...chain,payment:cost(card,this.player.mana),
        ...(def.kind==='attack'?(this.settings.attackRulesVersion>=9?attackSummary(def,this.player,chain.multiplier,this.enemies,gem.damageMultiplier,this.settings.attackRulesVersion):{...damageProfile(def,this.player,chain.multiplier,gem.damageMultiplier),attackPattern:'selected',targetMode:'single',targetCount:Math.min(1,this.living().length),pierce:1,area:0}):{}),
        draw:(def.kind==='draw'?def.drawCount*chain.multiplier+Math.trunc(this.player.magnet):def.kind==='wild'&&def.drawCount?def.drawCount*supportMultiplier+Math.trunc(this.player.magnet):0)+gemDraw,
        effectMultiplier:supportMultiplier,wildStrength:!!(def.isPickup&&this.settings.wildStrength),freeReward:card.rewardFreeTurn!==undefined,coinsGain:Math.ceil((def.coins||0)*supportMultiplier*(1+(this.player.greed||0)/100)),healGain:(def.heal||0)*supportMultiplier,
        wildcard:def.costType==='wild',followsWild:!!this.previousWild,destroyOnPlay:!!def.destroyOnPlay,luckGain:(def.luck||0)*supportMultiplier,
        armor:(def.armor||0)*supportMultiplier+gem.armor,
        manaGain:(def.mana||0)*supportMultiplier,mightGain:(def.might||0)*supportMultiplier,amountGain:(def.amount||0)*supportMultiplier,dealGain:(def.dealCountBoost||0)*supportMultiplier,
        ...(def.kind==='character'?{character:def.character,duration:def.duration+this.player.duration,manaGain:def.firstEffect.effect==='mana'?def.firstEffect.amount*supportMultiplier:0,areaGain:def.firstEffect.effect==='area'?def.firstEffect.amount*supportMultiplier:0,firstEffect:def.firstEffect,reaction:def.reaction,
          armor:def.firstEffect.effect==='armor'?def.firstEffect.amount*supportMultiplier+gem.armor:gem.armor,
          experience:def.firstEffect.effect==='experience'?Math.ceil(def.firstEffect.amount*supportMultiplier*(1+(this.player.growth||0)/100)):0}:{}),
        ...(wildPreview?{...wildPreview,draw:wildPreview.draw+gemDraw,armor:wildPreview.armor+gem.armor,
          actualDraw:Math.min(wildPreview.draw+gemDraw,Math.max(0,this.settings.handLimit-this.piles.hand.length+1),this.piles.draw.length+this.piles.discard.length+this.piles.combo.filter(c=>!c.pendingDestroy).length)}:{}),
        gemDraw,gemArmor:gem.armor,damageMultiplier:gem.damageMultiplier,reverseNext:gem.reverse};
    }
    triggerCharacters(playedCard){
      const type=definition(playedCard).cardType;
      for(const active of [...this.activeFCC]){
        const card=this.piles.fcc.find(c=>c.id===active.cardId);if(!card)continue;
        const def=definition(card),reaction=def.reaction;if(reaction.cardType!==type||active.remaining<=0)continue;
        active.remaining--;
        if(reaction.effect==='draw')this.draw(reaction.amount+Math.trunc(this.player.magnet||0));
        else effectsV10.stat(this,card,reaction.effect,reaction.amount);
        this.log('character_trigger',`${def.name}：${effectsV10.stats[reaction.effect]?.[0]||'抽牌'} +${reaction.amount} · 剩余 ${active.remaining} 次`,{cardId:active.cardId,triggerCardId:playedCard.id,character:def.character,stat:reaction.effect,amount:reaction.amount,remaining:active.remaining});
        if(active.remaining===0){
          this.activeFCC=this.activeFCC.filter(x=>x.cardId!==active.cardId);this.piles.fcc=this.piles.fcc.filter(c=>c.id!==active.cardId);this.piles.discard.push(card);
          this.log('character_expire',`${def.name}的持续效果结束，角色卡进入弃牌堆`,{cardId:card.id,character:def.character});
        }
      }
    }
    canPlay(id) {
      if(this.phase!=='player')return {ok:false,reason:'请等待当前阶段结束'};
      const card=this.piles.hand.find(c=>c.id===id);if(!card)return {ok:false,reason:'这张牌不在手牌中'};
      const valid=gems.validate(card);if(!valid.ok)return valid;
      const payment=cost(card,this.player.mana);
      if(this.player.mana<payment)return {ok:false,reason:`法力不足：需要 ${payment}，当前 ${this.player.mana}`};
      if(catalog.cards[card.key].kind==='attack'&&(this.settings.attackRulesVersion>=9?!this.living().length:!this.living().some(e=>e.id===this.target)))return {ok:false,reason:'请先选择存活的敌人'};
      return {ok:true};
    }
    play(id) {
      const legal=this.canPlay(id);if(!legal.ok)return legal;
      const card=this.piles.hand.find(c=>c.id===id), def=definition(card), snapshot={...this.player}, gem=gems.modifiers(card);
      const payment=cost(card,this.player.mana), chain=this.comboPreview(card);
      this.actions.push({type:'play',cardId:id,target:this.target});
      this.phase='resolving';this.resolvingCard=id;delete card.criticalTriggered;delete card.criticalWave;
      if(!chain.continues){this.releaseCombo(true);this.log('combo_break','费用未衔接连击阶梯，重新开始连击');}
      const before=this.player.mana;this.player.mana=Math.fround(Math.max(0,Math.min(1000000,before-payment)));
      this.log('payment',`打出「${def.name}」· 法力 ${before} → ${this.player.mana}`,{cardId:id,key:card.key,payment,before,after:this.player.mana});
      if(def.kind==='attack'){
        const effect=damageProfile(def,snapshot,chain.multiplier,gem.damageMultiplier);
        if(this.settings.attackRulesVersion>=9)this.resolvePatternAttack(card,def,effect);
        else for(let hit=0;hit<effect.hits;hit++) {
          const target=this.living().find(e=>e.id===this.target)||this.living()[0];if(!target)break;
          this.target=target.id;
          const result=resolveEnemyHit(target,effect.damage);
          this.log('enemy_damage',`${target.name}受到 ${effect.damage} 点伤害${result.armorDamage?`（护甲抵消 ${result.armorDamage}）`:''}${result.overkill?` · 溢出 ${result.overkill}`:''}`,{enemyId:target.id,cardId:id,hit:hit+1,...result});
          if(target.health<EPSILON){target.intent=null;this.log('kill',`${target.name}被击败`,{enemyId:target.id});}
        }
      } else if(this.settings.attackRulesVersion>=10&&effectsV10.execute(this,card,def,chain.multiplier,snapshot)){}
      else if(def.kind==='draw') this.draw(def.drawCount*chain.multiplier+Math.trunc(snapshot.magnet));
      else if(def.kind==='armor'){const amount=def.armor*(def.receivesComboMultiplier?chain.multiplier:1);this.player.armor+=amount;this.log('armor',`获得 ${amount} 点护甲`,{amount});}
      else if(['mana','might','amount','deal'].includes(def.kind)){
        const multiplier=def.receivesComboMultiplier?chain.multiplier:1;
        if(def.kind==='mana'){
          const before=this.player.mana;this.player.mana=Math.fround(Math.min(1000000,before+def.mana*multiplier));
          this.log('mana_gain',`获得 ${this.player.mana-before} 法力`,{cardId:id,amount:this.player.mana-before,before,after:this.player.mana});
        }else if(def.kind==='might'){
          const amount=def.might*multiplier;this.player.might+=amount;this.log('might_gain',`本场战斗威力 +${amount}`,{cardId:id,amount,total:this.player.might});
        }else if(def.kind==='amount'){
          const amount=def.amount*multiplier;this.player.amount+=amount;this.log('amount_gain',`本场战斗发射数量 +${amount}`,{cardId:id,amount,total:this.player.amount});
        }else{
          const amount=def.dealCountBoost*multiplier;this.settings.dealCount+=amount;
          const ceiling=this.settings.handLimitCeiling||7;
          if(Number.isFinite(this.settings.handLimit)&&this.settings.handLimit>=0&&this.settings.handLimit<ceiling)this.settings.handLimit=Math.min(ceiling,this.settings.handLimit+amount);
          this.log('deal_gain',`本场战斗每回合发牌 +${amount}，手牌上限 ${this.settings.handLimit}`,{cardId:id,amount,dealCount:this.settings.dealCount,handLimit:this.settings.handLimit});
        }
      }
      else if(def.kind==='character'){
        const multiplier=def.receivesComboMultiplier?chain.multiplier:1,amount=def.firstEffect.amount*multiplier;
        if(def.firstEffect.effect==='armor'){this.player.armor+=amount;this.log('armor',`获得 ${amount} 点护甲`,{cardId:id,amount});}
        else if(def.firstEffect.effect==='experience'){const gain=Math.ceil(amount*(1+(snapshot.growth||0)/100));this.log('experience_gain',`${def.name}获得 ${gain} 点经验`,{cardId:id,amount:gain});}
        else effectsV10.stat(this,card,def.firstEffect.effect,amount);
      }
      else if(def.kind==='wild'){
        const multiplier=def.receivesComboMultiplier?chain.multiplier:1,gain=def.luck*multiplier;
        this.player.luck+=gain;this.log('luck_gain',`幸运 +${gain}`,{cardId:id,amount:gain,total:this.player.luck});
        this.draw(def.drawCount*multiplier+Math.trunc(snapshot.magnet));
      }
      if(this.settings.attackRulesVersion>=10&&def.kind==='attack')effectsV10.afterAttack(this,card,def,chain.multiplier,snapshot);
      for(const key of gems.installed(card)){
        const effect=gems.catalog.gems[key];
        if(effect.effect==='draw'){
          const count=effect.value+Math.trunc(snapshot.magnet);
          this.log('gem_effect',`「${effect.name}」追加抽 ${count} 张牌`,{cardId:id,gem:key,amount:count});this.draw(count);
        }else if(effect.effect==='armor'){
          this.player.armor+=effect.value;this.log('gem_effect',`「${effect.name}」追加 ${effect.value} 护甲`,{cardId:id,gem:key,amount:effect.value});
        }
      }
      this.triggerCharacters(card);
      delete card.wingDiscount;delete card.criticalTriggered;delete card.criticalWave;
      if(card.rewardFreeTurn!==undefined){card.free=false;delete card.rewardFreeTurn;}
      this.piles.hand=this.piles.hand.filter(c=>c.id!==id);
      if(def.destroyOnPlay){card.pendingDestroy=true;this.piles.combo.push(card);this.log('card_destroy_pending',`「${def.name}」离开连击堆时销毁`,{cardId:id,key:card.key});}
      else if(def.kind==='character'){
        const duration=Math.max(0,Math.trunc(def.duration+(snapshot.duration||0)));this.player.duration=Math.max(0,this.player.duration-(snapshot.duration||0));
        if(duration){this.piles.fcc.push(card);this.activeFCC.push({cardId:id,character:def.character,remaining:duration});this.log('character_active',`${def.name}进入角色栏，可触发 ${duration} 次`,{cardId:id,character:def.character,duration});}
        else this.piles.discard.push(card);
      }else this.piles.combo.push(card);
      this.combo=chain.resultCombo;this.previousCost=chain.cost;this.previousWild=def.costType==='wild';this.reverseCombo=gem.reverse;this.resolvingCard=null;
      if(chain.comboBonus)this.log('friendship_boost',`友情护符：额外连击 +${chain.comboBonus} · ×${chain.comboBefore} → ×${this.combo}`,{cardId:id,bonus:chain.comboBonus,before:chain.comboBefore,after:this.combo});
      this.log('combo',this.previousWild?`连击 ×${this.combo} · 下一张任意费用可接续`:`连击 ×${this.combo} · 下一张 ${chain.cost+1}${this.reverseCombo?` 或 ${chain.cost-1}`:''} 费可接续`,{combo:this.combo,nextCost:this.previousWild?null:chain.cost+1,wildcard:this.previousWild,reverse:this.reverseCombo,nextCosts:this.previousWild?[]:this.reverseCombo?[chain.cost+1,chain.cost-1]:[chain.cost+1]});
      bossRules.afterCard(this,def,snapshot.health);
      if(!this.living().length){this.destroyPendingCards();this.phase='victory';this.log('victory','地窖已清空。你赢得了这场战斗。');}
      else {this.phase='player';if(!this.living().some(e=>e.id===this.target))this.target=this.living()[0].id;}
      return {ok:true};
    }
    applyDamage(card,target,damage,extra={}){
      if(!target||target.health<EPSILON)return null;
      const previousFront=this.settings.attackRulesVersion>=12?new Set(frontEnemies(this.enemies).map(x=>x.enemy.id)):null;
      damage=bossRules.scaleDamage(this,target,Math.max(0,damage));
      const result=resolveEnemyHit(target,damage);
      this.log('enemy_damage',`${target.name}受到 ${Math.round(damage*100)/100} 点伤害`,{enemyId:target.id,cardId:card.id,...extra,...result});
      if(target.health<EPSILON){
        target.intent=null;this.log('kill',`${target.name}被击败`,{enemyId:target.id});bossRules.killed(this,target);
        if(previousFront){this.compactFormation();for(const {enemy} of frontEnemies(this.enemies))if(!previousFront.has(enemy.id))this.decideIntent(enemy);}
      }return result;
    }
    resolvePatternAttack(card,def,effect){
      if(this.settings.attackRulesVersion>=12&&['noFuture','runetracer'].includes(def.key))return this.resolveBouncingProjectile(card,def,effect);
      if(this.settings.attackRulesVersion===12&&specials.isAreaAttack(def))return this.resolveAreaAttack(card,def,effect);
      const pattern=def.attackPattern||'left-right',pierce=Math.max(1,Math.trunc(def.pierce||1));
      // Native FrontRowTargeting keeps one simulated row for this DamageEffect.
      // Global formation may advance, but replacements belong to later effects.
      const fixedFront=this.settings.attackRulesVersion>=13&&def.targetingMode==='FrontRowTargeting'?frontEnemies(this.enemies):null;
      const attackFront=()=>fixedFront?fixedFront.filter(x=>x.enemy.health>=EPSILON&&x.enemy.targetable!==false):frontEnemies(this.enemies);
      const width=Math.max(5,...this.enemies.map((e,i)=>(e.slot?.column??i)+1)),columns=Array.from({length:width},(_,i)=>i);
      let direction=pattern==='right-left'?-1:1,cursor=direction<0?columns.length-1:0,bag=[],impact=0;
      const nextColumn=()=>{
        if(pattern==='random'){
          if(!bag.length)bag=shuffle(columns,this.targetRandom);
          return bag.pop();
        }
        const column=columns[cursor];cursor=(cursor+direction+columns.length)%columns.length;return column;
      };
      for(let wave=1;wave<=effect.hits&&this.living().length;wave++){
        const hitIds=new Set();let knockbackUsed=false;
        let bounces=0;if(this.settings.attackRulesVersion>=10&&def.key==='heavenSword')while(bounces<100&&this.effectRandom()<.2*(1+(this.player.luck||0)/100)*Math.pow(.8,bounces))bounces++;
        for(let bounce=0;bounce<pierce+bounces;bounce++){
          const candidates=attackFront().filter(x=>def.pierceType===1||!hitIds.has(x.enemy.id));
          if(!candidates.length)break;
          const attacking=candidates.filter(x=>x.enemy.intent?.actions.some(a=>a.kind==='attack'));
          const eligible=def.priority===1&&attacking.length?attacking:candidates,ids=new Set(eligible.map(x=>x.enemy.id));
          let chosen;
          // Empty columns and priority-skipped columns do not spend a hit.
          for(let attempt=0;attempt<columns.length*3&&!chosen;attempt++){
            const column=nextColumn();chosen=attackFront().find(x=>x.column===column&&ids.has(x.enemy.id));
          }
          if(!chosen)break;
          const target=chosen.enemy;hitIds.add(target.id);this.target=target.id;impact++;
          const extra={hit:impact,wave,pattern,pierceIndex:bounce+1,slot:target.slot||{row:0,column:chosen.column}};
          if(this.settings.attackRulesVersion>=10){
            const used=effectsV10.hit(this,card,def,target,effect.damage,{...extra,allowKnockback:!knockbackUsed},fixedFront?.map(x=>x.enemy));knockbackUsed=knockbackUsed||used;
          }else this.applyDamage(card,target,effect.damage,extra);
        }
      }
    }
    applyNativeArea(card,def,damage,extra={},targets=frontEnemies(this.enemies).map(x=>x.enemy)){
      const amount=specials.areaInfo(def,this.player,damage).damage;if(amount<=0)return;
      for(const enemy of targets)this.applyDamage(card,enemy,amount,{...extra,pattern:"splash",source:"area_splash",splash:true,rearSplash:false});
    }
    resolveAreaAttack(card,def,effect){
      let hit=0;
      for(let wave=1;wave<=effect.hits&&this.living().length;wave++){
        const front=frontEnemies(this.enemies).map(x=>x.enemy),frontIds=new Set(front.map(e=>e.id));
        const rear=this.living().filter(e=>!frontIds.has(e.id));let knockbackUsed=false;
        for(const target of front){
          if(target.health<EPSILON||target.targetable===false)continue;
          this.target=target.id;
          knockbackUsed=effectsV10.hit(this,card,def,target,effect.damage,{hit:++hit,wave,pattern:'front-row',suppressArea:true,allowKnockback:!knockbackUsed})||knockbackUsed;
        }
        const splash=specials.rearSplashDamage(effect.damage,(def.area||0)+(this.player.area||0),this.settings.rearSplashRatio??.2);
        for(const target of rear)if(target.health>=EPSILON&&target.targetable!==false)this.applyDamage(card,target,splash,{hit:++hit,wave,pattern:'rear-splash',source:'rear_splash',splash:true,rearSplash:true});
      }
    }
    resolveBouncingProjectile(card,def,effect){
      const timeline=specials.projectileTimeline({...effect,area:(def.area||0)+(this.player.area||0)},def,this.targetRandom,frontEnemies(this.enemies).map(x=>x.column));
      let hit=0;
      this.log('projectile_flight',`${def.name}持续飞行并在边缘反弹`,{cardId:card.id,projectiles:effect.hits,lifetime:specials.projectileConfig(def).maxLifetime,geometry:'browser-arena-v12'});
      for(const event of timeline){
        if(!this.living().length)break;
        if(event.type==='boundary'){this.log('projectile_bounce','弹体碰边反弹',{cardId:card.id,...event,type:'projectile_bounce'});continue;}
        const front=frontEnemies(this.enemies).filter(x=>x.enemy.targetable!==false);
        let target;
        if(event.type==='contact')target=front.find(x=>x.column===event.column)?.enemy;
        else {
          target=front.map(x=>({enemy:x.enemy,p:specials.columnPosition(x.column)})).sort((a,b)=>Math.hypot(a.p.x-event.position.x,a.p.y-event.position.y)-Math.hypot(b.p.x-event.position.x,b.p.y-event.position.y))[0]?.enemy;
        }
        if(!target)continue;
        const explosion=event.type==='explosion',base=explosion?specials.explosionDamage(effect.damage):effect.damage;
        const frozen=target.freezeStacks>0,amount=frozen?Math.ceil(base*2):base;
        if(explosion)this.log('boundary_explosion',`碰边爆炸：${target.name}受到 ${amount} 点伤害`,{cardId:card.id,enemyId:target.id,wave:event.wave,time:event.time,boundary:event.boundary,position:event.position,damage:amount,baseDamage:base});
        // RunetracerCollision and NoFutureProjectile bypass generic critical
        // effects. Both consume freeze; only physical contacts can area-splash.
        const frontIds=new Set(front.map(x=>x.enemy.id)),rear=this.living().filter(e=>!frontIds.has(e.id));
        if(frozen){target.freezeStacks--;if(!target.freezeStacks){target.intent=target.frozenIntent||null;delete target.frozenIntent;}}
        this.target=target.id;
        const extra={source:explosion?'boundary_explosion':'projectile_contact',boundary:explosion,pattern:explosion?'explosion':'random',wave:event.wave,hit:++hit,time:event.time,position:event.position,frozen};
        this.applyDamage(card,target,amount,extra);
        if(frozen)this.log('freeze_consumed','冰冻层消耗，伤害 ×2',{cardId:card.id,enemyId:target.id,stacks:target.freezeStacks});
        const raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
        const area=raw?._ignoreArea?0:((def.area||0)+(this.player.area||0))/100;
        if(!explosion&&this.settings.attackRulesVersion>=13)this.applyNativeArea(card,def,amount,extra);
        else if(!explosion&&area>0)for(const enemy of rear)this.applyDamage(card,enemy,effect.damage*area*.2,{...extra,pattern:'rear-splash',source:'rear_splash',splash:true,rearSplash:true});
      }
    }
    beginEnemyTurn() {
      if(this.phase!=='player')return false;
      this.actions.push({type:'end_turn'});this.phase='enemy';this.log('turn_end',`结束第 ${this.turn} 回合`);
      for(const c of Object.values(this.piles).flat()){delete c.wingDiscount;if(c.rewardFreeTurn!==undefined){c.free=false;delete c.rewardFreeTurn;}}
      this.releaseCombo(true);
      this.reverseCombo=false;
      const kept=this.piles.hand.filter(c=>catalog.cards[c.key].retain), discarded=this.piles.hand.filter(c=>!catalog.cards[c.key].retain);
      this.piles.discard.push(...discarded);this.piles.hand=kept;
      this.log('discard',`弃置 ${discarded.length} 张手牌`,{count:discarded.length});
      bossRules.beforeEnemyTurn(this);if(this.player.health<=0&&!effectsV10.revive(this)){this.phase='defeat';this.enemyQueue=[];this.log('defeat','鼠疫耗尽生命');return true;}
      // Reversed model-list order, matching the inspected ordinary enemy loop.
      this.enemyQueue=(this.settings.attackRulesVersion>=10?frontEnemies(this.enemies).map(x=>x.enemy):this.living()).map(e=>e.id).reverse();return true;
    }
    resolveNextEnemy() {
      if(this.phase!=='enemy')return false;
      const id=this.enemyQueue.shift();if(id===undefined){for(const e of this.enemies){e.freezeStacks=0;delete e.frozenIntent;}this.beginPlayerTurn();return false;}
      const enemy=this.enemies.find(e=>e.id===id);if(enemy.health<EPSILON||!enemy.intent)return true;
      bossRules.beforeAction(this,enemy);const bossHealthBefore=this.player.health,bossEventStart=this.events.length;
      this.log('enemy_action',`${enemy.name}执行意图`,{enemyId:id,intentId:enemy.intent.id});
      for(const action of enemy.intent.actions){
        if(action.kind==='attack'){
          const hp=Math.trunc(this.player.health), armor=Math.trunc(this.player.armor), damage=Math.max(0,Math.trunc(action.value));
          this.player.armor=Math.max(armor-damage,0);this.player.health=Math.max(hp-Math.max(damage-armor,0),0);
          this.log('player_damage',`${enemy.name}攻击 ${damage} · 护甲抵消 ${Math.min(armor,damage)} · 失去 ${hp-this.player.health} 生命`,{enemyId:id,damage,healthBefore:hp,healthAfter:this.player.health,armorBefore:armor,armorAfter:this.player.armor});
          if(this.player.health<=0&&!(this.settings.attackRulesVersion>=10&&effectsV10.revive(this))){this.phase='defeat';this.enemyQueue=[];this.log('defeat','生命耗尽。本次探索结束。');break;}
        } else if(action.kind==='armor'){enemy.armor+=action.value;this.log('enemy_armor',`${enemy.name}获得 ${action.value} 护甲`,{enemyId:id,amount:action.value});}
        else this.log('enemy_wait',`${enemy.name}暂时等待`,{enemyId:id});
      }
      bossRules.afterAction(this,enemy,bossHealthBefore,this.events.slice(bossEventStart).filter(e=>e.type==='player_damage').reduce((sum,e)=>sum+Math.max(0,e.healthBefore-e.healthAfter),0));
      return true;
    }
    beginPlayerTurn() {
      if(this.phase==='victory'||this.phase==='defeat')return;
      this.phase='setup';this.turn++;bossRules.startTurn(this);
      for(const e of this.settings.attackRulesVersion>=12?frontEnemies(this.enemies).map(x=>x.enemy):this.living())this.decideIntent(e);
      this.player.armor=this.settings.startingArmor;this.player.mana=this.settings.startingMana;
      this.log('turn_start',`第 ${this.turn} 回合 · 法力恢复至 ${this.player.mana} · 护甲设为 ${this.player.armor}`);
      this.draw(this.settings.dealCount,true);this.phase='player';
    }
    endTurn() { if(!this.beginEnemyTurn())return false;while(this.phase==='enemy')this.resolveNextEnemy();return true; }
    snapshot() {return {data:JSON.parse(JSON.stringify(this)),deckRng:this.deckRandom.state()|0,intentRng:this.intentRandom.state()|0,targetRng:this.targetRandom.state()|0,effectRng:this.effectRandom.state()|0};}
    static restore(save) {
      if(!save?.data||!Number.isInteger(save.deckRng)||!Number.isInteger(save.intentRng))throw Error('Invalid battle save');
      const b=Object.assign(Object.create(Battle.prototype),JSON.parse(JSON.stringify(save.data)));
      if(!['player','enemy','victory','defeat'].includes(b.phase))throw Error('Invalid saved phase');
      const cards=Object.values(b.piles).flat();
      if(cards.length!==b.cardCount||new Set(cards.map(c=>c.id)).size!==cards.length||cards.some(c=>!catalog.cards[c.key]||!gems.validate(c).ok))throw Error('Invalid saved deck');
      if(cards.some(c=>c.baseKey&&!evolutionRecipes.some(r=>r.id===c.evolutionRecipe&&r.resultKey===c.key&&r.componentGroups[0]===catalog.cards[c.baseKey]?.group)))throw Error('Invalid evolution source');
      if(b.reverseCombo===undefined)b.reverseCombo=false;
      if(typeof b.reverseCombo!=='boolean')throw Error('Invalid saved reverse combo');
      b.piles.fcc??=[];b.piles.destroyed??=[];b.activeFCC??=[];b.previousWild??=false;
      if(typeof b.previousWild!=='boolean')throw Error('Invalid wildcard combo save');
      if(!Array.isArray(b.activeFCC)||b.activeFCC.length!==b.piles.fcc.length||new Set(b.activeFCC.map(x=>x.cardId)).size!==b.activeFCC.length||b.activeFCC.some(x=>!Number.isInteger(x.remaining)||x.remaining<1||!b.piles.fcc.some(c=>c.id===x.cardId&&catalog.cards[c.key]?.kind==='character'&&catalog.cards[c.key].character===x.character)))throw Error('Invalid active character save');
      b.deckRandom=rng(b.seed+':deck').restore(save.deckRng);b.intentRandom=rng(b.seed+':intent').restore(save.intentRng);b.targetRandom=rng(b.seed+':target');if(Number.isInteger(save.targetRng))b.targetRandom.restore(save.targetRng);b.effectRandom=rng(b.seed+':effects');if(Number.isInteger(save.effectRng))b.effectRandom.restore(save.effectRng);return b;
    }
    export() {return {format:'crawler-prototype-log-v1',seed:this.seed,profile:this.profile,settings:this.settings,catalogSources:catalog.sources,actions:this.actions,events:this.events,state:{phase:this.phase,turn:this.turn,player:this.player,enemies:this.enemies,piles:this.piles,combo:this.combo}};}
  }
  const api={Battle,bossRules,catalog,gems,characters,cardTypes:characterData.cardTypes,evolutionRecipes,evolutionData,effectsV10,specials,wildV10,attackPatterns,wildCards,friendship,friendshipBonus,attackSummary,frontEnemies,profiles,rng,shuffle,roundEven,cost,definition,damageProfile,resolveEnemyHit,selectIntent};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Crawler=api;
})(typeof globalThis!=='undefined'?globalThis:this);
