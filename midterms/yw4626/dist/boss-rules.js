/* Authored v28 boss mechanics. Public, deterministic, independent of rendering. */
(function(root){
 'use strict';
 const themes=typeof module!=='undefined'&&module.exports?require('./floor-themes.js'):root.CrawlerThemes;
 const names=['根系之心','禁忌咒文','鼠疫与解药','处刑蓄力','四守卫复苏'];
 const english=['Root Heart','Forbidden Pages','Plague and Antidote','Execution Windup','Four Guardians Reborn'];
 const alive=e=>e.health>0.00001;
 function emit(b,e,fx,text){b.log('boss_fx',text,{enemyId:e?.id,fx});}
 function color(d){const typed={Attack:'red',Defense:'blue',Mana:'purple',Character:'green',Special:'yellow',Void:'silver'}[d.cardType];if(typed)return typed;return ({attack:'red',armor:'blue',mana:'purple',character:'green',wild:'silver'})[d.kind]||'yellow';}
 function init(b){
  if(b.settings.bossRulesVersion!==28||!b.settings.bossFloor)return;
  const e=b.enemies.find(e=>e.encounterRole==='boss');if(!e)return;
  b.bossState={version:28,floor:b.settings.bossFloor,bleed:0,plague:0,ritualUsed:false};
  attach(e,b.settings.bossFloor,false,1);
  if(e.bossKind===1)b.enemies.filter(x=>x!==e).slice(0,2).forEach(x=>{x.bossHelper='root';x.name='花苞护卫';x.english='Root Bud';x.visualKey='gardenBud';});
  if(e.bossKind===3)b.enemies.filter(x=>x!==e).slice(0,2).forEach(x=>{x.bossHelper='antidote';x.name='携药鼠';x.english='Antidote Rat';x.visualKey='cellarRat';});
 }
 function attach(e,kind,echo,turn){e.bossKind=kind;e.bloodEcho=echo;e.bossMechanic={colors:[],wild:false,broken:false,attacks:0,cycle:0,spawned:0,activeTurn:turn};if(kind===5){e.bossMechanic.originalInstakillResist=e.instakillResist??0;e.instakillResist=1;}}
 function startTurn(b){
  if(!b.bossState)return;
  for(const e of b.enemies.filter(e=>alive(e)&&e.bossKind)){
   const m=e.bossMechanic;m.colors=[];m.wild=false;m.broken=false;m.attacks=0;
   if(e.bossKind===2)m.spell=(b.turn-m.activeTurn)%3;
   if(e.bossKind===4)m.cycle=(b.turn-m.activeTurn)%3;
   if(m.witherTurn<b.turn)delete m.witherTurn;
  }
 }
 function intent(b,e){
  if(!b.bossState||!e.bossKind)return null;
  const m=e.bossMechanic,power=e.bloodEcho?Math.max(2,Math.round(themes.get(e.bossKind).stats.attack*.5)):themes.get(e.bossKind).stats.attack;
  let actions;
  if(b.turn<m.activeTurn||m.broken||(e.bossKind===4&&m.cycle===2&&m.skipStrike))actions=[{kind:'wait',value:0}];
  else if(e.bossKind===2)actions=m.spell===1?[{kind:'armor',value:e.bloodEcho?12:30}]:[{kind:'attack',value:Math.round(power*(m.spell===2?.7:1))}];
  else if(e.bossKind===4)actions=m.cycle===1?[{kind:'wait',value:0}]:[{kind:'attack',value:Math.round(power*(m.cycle===2?1:.55))}];
  else actions=[{kind:'attack',value:power}];
  return {id:100+e.bossKind,actions};
 }
 function scaleDamage(b,e,amount){
  if(!b.bossState)return amount;
  const garden=b.enemies.find(x=>alive(x)&&x.bossKind===1&&b.turn>=x.bossMechanic.activeTurn);
  if(garden){
   if(garden.bloodEcho&&e!==garden&&e.bloodEcho)amount*=.9;
   else if(e===garden&&!garden.bloodEcho){const buds=b.enemies.filter(x=>alive(x)&&x.bossHelper==='root').length;amount*=1-.15*buds;}
  }
  if(e.bossMechanic?.witherTurn===b.turn)amount*=1.25;
  // The ritual is a visible phase gate, checked only after the current card.
  if(e.bossKind===5&&!b.bossState.bloodFury)amount=Math.min(amount,Math.max(0,e.armor+e.health-1));
  return amount;
 }
 function killed(b,e){
  if(!b.bossState)return;
  if(e.bossHelper==='root'){
   b.player.mana+=1;emit(b,e,'roots','根须断裂：法力 +1');
   if(!b.enemies.some(x=>alive(x)&&x.bossHelper==='root')){const g=b.enemies.find(x=>alive(x)&&x.bossKind===1);if(g){g.bossMechanic.witherTurn=b.turn;emit(b,g,'wither','枯萎：本回合受到伤害 +25%');}}
  }
  if(e.bossHelper==='antidote'){b.bossState.plague=Math.max(0,b.bossState.plague-2);emit(b,e,'antidote','收集解药：鼠疫 −2');}
 }
 function add(b,template,column,kind){
  const e={...JSON.parse(JSON.stringify(template)),id:Math.max(0,...b.enemies.map(x=>x.id))+1,slot:{row:0,column},intent:null,previousIntent:null,freezeStacks:0,finalBoss:false,xpOverride:0};
  e.maxHealth=e.health;if(kind)attach(e,kind,true,b.turn+kind);b.enemies.push(e);b.decideIntent(e);return e;
 }
 function summonRats(b,e){
  if(e.bloodEcho||e.bossMechanic.spawned>=2)return;
  e.bossMechanic.spawned++;
  for(let i=0;i<2;i++)add(b,{key:'zombie',visualKey:'cellarRat',name:'携药鼠',english:'Antidote Rat',health:18,armor:0,bossHelper:'antidote',encounterRole:'minion',intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'attack',value:2}]}]},i*4);
  b.compactFormation();emit(b,e,'rats','鼠群出现：击败携药鼠可清除鼠疫（最多召唤两次）');
 }
 function ritual(b){
  const state=b.bossState,e=b.enemies.find(x=>alive(x)&&x.bossKind===5);
  if(!e||state.ritualUsed||b.enemies.some(x=>x!==e&&alive(x)))return;
  state.ritualUsed=true;e.instakillResist=e.bossMechanic.originalInstakillResist;
  for(let i=1;i<=4;i++){
   const t=themes.get(i);add(b,{...t.boss,health:Math.round(t.stats.health*.3),armor:Math.round(t.stats.armor*.25),encounterRole:'boss',visualScale:1.2,name:t.boss.name+'·血影',english:t.boss.english+' Echo',instakillResist:.9,intents:[]},i-1,i);
  }
  e.slot={row:1,column:2};e.intent=null;b.compactFormation();emit(b,e,'ritual','四守卫复苏：血影30%生命、50%攻击，延迟1/2/3/4回合激活，只召唤一次');
 }
 function afterCard(b,def,healthBefore){
  if(!b.bossState)return;
  if((def.heal||0)>0||b.player.health>healthBefore){b.bossState.bleed=Math.max(0,(b.bossState.bleed||0)-1);if(b.bossState.plague){b.bossState.plague--;emit(b,null,'antidote','治疗清除1层鼠疫');}}
  for(const e of b.enemies.filter(e=>alive(e)&&e.bossKind)){
   const m=e.bossMechanic;if(b.turn<m.activeTurn)continue;
   if(e.bossKind===2&&!m.broken){if(def.costType==='wild')m.wild=true;else if(!m.colors.includes(color(def)))m.colors.push(color(def));
    if(m.colors.length+(m.wild?1:0)>=3){m.broken=true;e.armor=0;e.intent=intent(b,e);b.draw(1);emit(b,e,'seal','三色解咒：取消本回合法术、护盾破裂、抽1张牌');}}
   if(e.bossKind===4&&m.cycle===1&&!m.broken&&def.kind==='attack'){m.attacks++;if(m.attacks>=3){m.broken=true;m.witherTurn=b.turn;e.intent=intent(b,e);emit(b,e,'chains','三次攻击破招：跳过下一次重击、本回合受到伤害 +25%');m.skipStrike=true;}}
  }
  ritual(b);const vampire=b.enemies.find(e=>alive(e)&&e.bossKind===5);if(vampire&&b.bossState.ritualUsed&&!b.enemies.some(e=>alive(e)&&e.bloodEcho)&&!b.bossState.bloodFury){b.bossState.bloodFury=true;emit(b,vampire,'fury','血影全灭：吸血鬼进入血刃阶段，未被完全格挡的攻击附加2层流血');}
 }
 function beforeEnemyTurn(b){
  if(!b.bossState)return;
  const bleed=b.bossState.bleed||0;if(bleed){const hp=b.player.health;b.player.health=Math.max(0,hp-bleed);b.bossState.bleed--;b.log('player_damage','流血发作',{enemyId:0,damage:bleed,healthBefore:hp,healthAfter:b.player.health,armorBefore:b.player.armor,armorAfter:b.player.armor,source:'bleed'});emit(b,null,'bleed','流血发作，随后减1层');}
  if(!b.bossState.plague)return;
  const damage=b.bossState.plague,hp=b.player.health,armor=b.player.armor;
  b.player.health=Math.max(0,hp-damage);b.bossState.plague--;
  b.log('player_damage','鼠疫发作（无视护甲）',{enemyId:0,damage,healthBefore:hp,healthAfter:b.player.health,armorBefore:armor,armorAfter:armor,source:'plague'});emit(b,null,'plague','鼠疫发作，结算后减少1层');
 }
 function beforeAction(b,e){
  if(!b.bossState||!e.bossKind)return;
  const m=e.bossMechanic;
  if(e.bossKind===4&&m.cycle===2&&m.skipStrike){e.intent={id:104,actions:[{kind:'wait',value:0}]};m.skipStrike=false;emit(b,e,'chains','处刑被打断：巨囚喘息');}
 }
 function afterAction(b,e,healthBefore,healthDamage){
  if(!b.bossState||!alive(e)||b.phase==='defeat'||!e.bossKind)return;
  const m=e.bossMechanic;if(b.turn<m.activeTurn||m.broken||e.freezeStacks>0)return;
  const attacked=e.intent?.actions.some(a=>a.kind==='attack');
  if(e.bossKind===3&&attacked){b.bossState.plague=Math.min(4,b.bossState.plague+(e.bloodEcho?1:2));emit(b,e,'plague','疫爪：鼠疫叠加（最多4层）');if(b.turn%2===0)summonRats(b,e);}
  if(e.bossKind===5&&attacked){const gain=Math.max(0,healthDamage??(healthBefore-b.player.health));e.health=Math.min(e.maxHealth,e.health+gain);if(b.bossState.bloodFury&&gain>0){b.bossState.bleed=Math.min(6,(b.bossState.bleed||0)+2);emit(b,e,'bleed','血刃：流血 +2（最多6层）；治疗清1层');}emit(b,e,'blood','吸血：恢复造成的生命伤害');}
  if(e.bossKind===2&&!m.broken)emit(b,e,'pages','禁书法术释放');
  if(e.bossKind===4&&m.cycle===1)emit(b,e,'charge','处刑蓄力：下回合重击，可提前打出3张攻击破招');
 }
 function publicState(b){
  if(!b.bossState)return null;
  return {version:29,bleed:b.bossState.bleed||0,bloodFury:!!b.bossState.bloodFury,plague:b.bossState.plague,plagueCap:4,ritualUsed:b.bossState.ritualUsed,
   rules:{bleedPerHit:2,bleedCap:6,bleedDecay:1,bleedHealCleanse:1,rootReductionPerBud:.15,witherBonus:.25,sealColors:3,wildcardColors:1,chainCards:3,poisonPerStack:1,antidoteCleanse:2,healCleanse:1,echoHealthRatio:.3,echoAttackRatio:.5,ritualTrigger:'Initial escorts defeated; after card resolution; vampire stays at 1 HP until ritual. Once only.'},
   bosses:b.enemies.filter(e=>alive(e)&&e.bossKind).map(e=>{const m=e.bossMechanic;return {id:e.id,kind:e.bossKind,name:names[e.bossKind-1],english:english[e.bossKind-1],echo:!!e.bloodEcho,activeIn:Math.max(0,m.activeTurn-b.turn),colors:[...m.colors],wildUsed:m.wild,sealProgress:Math.min(3,m.colors.length+(m.wild?1:0)),broken:m.broken,attacks:m.attacks,charging:e.bossKind===4&&m.cycle===1,strikeNext:e.bossKind===4&&m.cycle===1&&!m.skipStrike,skipStrike:!!m.skipStrike,spell:e.bossKind===2?['damage','shield','ink'][m.spell||0]:null,wither:m.witherTurn===b.turn,rootBuds:b.enemies.filter(x=>alive(x)&&x.bossHelper==='root').length,ratSummons:m.spawned,nextActions:e.intent?.actions.map(a=>({...a}))||[]};}),
   helpers:b.enemies.filter(e=>alive(e)&&e.bossHelper).map(e=>({id:e.id,kind:e.bossHelper}))};
 }
 const api={init,startTurn,intent,scaleDamage,killed,afterCard,beforeEnemyTurn,beforeAction,afterAction,publicState,color};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BossRules=api;
})(globalThis);
