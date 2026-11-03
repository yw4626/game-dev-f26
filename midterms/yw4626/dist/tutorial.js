/* Authored onboarding. Uses the real Run/Battle rules; no evaluator opts into it. */
(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports;
 const E=node?require('./engine.js'):root.Crawler,R=node?require('./run.js'):root.CrawlerRun,D=node?require('./dungeon.js'):root.CrawlerDungeon;
 const stages=['move','pickup','left','turnWalk','right','approach','combo0','combo1','combo2','combat','shopApproach','buy','socket','leave','gemApproach','gemPick','gemSocket','altarApproach','remove','bossApproach','boss','evolution','complete'];
 const copy=x=>JSON.parse(JSON.stringify(x));
 class TutorialRun extends R.Run{
  constructor(options={}){
   super(options);this.tutorial={version:1,stage:'move',options:{seed:this.seed,profile:this.profile,character:this.character,wildStrength:this.wildStrength}};
   this.health=this.maxHealth=100;this.gold=60;
   this.deck=[E.characters[this.character].cardKey,'whip','fire','axe','armor'].map(k=>this.makeCard(k));
   const nodes=[{id:'tutorial-fight',type:'battle',name:'花园练习',stage:0},{id:'tutorial-shop',type:'shop',name:'教学商人',stage:1},{id:'tutorial-boss',type:'boss',name:'幼生荆棘守卫',stage:2}].map(n=>({...n,floor:1,lane:0}));
   this.maps[0]=nodes;
   this.dungeon={version:5,themeVersion:24,x:4,y:18,dir:0,floor:1,seen:[],visited:[],steps:0,shops:{},objects:{'4,16':{id:'training-crate',type:'crate',active:true,reward:{kind:'gold',amount:100},lootEconomyVersion:21},'2,6':{id:'training-gems',type:'gemchest',active:true,offers:['draw','armor','costDown']},'2,5':{id:'training-altar',type:'removal',active:true}},removalEvent:{key:'2,5',used:false},secrets:{},exit:null};
   layout(this);this.tutorial.version=3;
   D.reveal(this.dungeon);this.history=[];this.log('tutorial','Training garden');
  }
  combatSettings(){const s=super.combatSettings();return this.tutorial?{...s,startingMana:3,dealCount:6,bossRulesVersion:0}:s;}
  encounter(n){if(!this.tutorial)return super.encounter(n);const boss=n.type==='boss';
   return (boss?[['zombie','gardenShrub',24,2],['zombie','gardenShrub',24,2],['lion','bossPlant',180,6]]:[['ghost','gardenBud',55,2],['zombie','gardenBeetle',55,2],['ghost','gardenBloom',55,2]]).map(([key,visualKey,health,damage],i)=>{
    const b=boss&&i===2,e={...copy(E.catalog.enemies[key]),key,visualKey,health,armor:b?8:0,xpOverride:boss&&i===0?5:0,encounterRole:b?'boss':'normal',slot:{row:b?1:0,column:boss?(b?2:i+1):i+1},name:b?'幼生荆棘守卫':'花园训练守卫',english:b?'Young Thorn Guardian':'Garden Sentry'};
    e.intents=[{id:'strike',weight:3,actions:[{kind:'attack',value:damage}]},{id:'guard',weight:1,actions:[{kind:'armor',value:b?6:2}]}];return e;
   });
  }
  makeShop(n){if(!this.tutorial)return super.makeShop(n);return {nodeId:n.id,offers:['fire','armor','spinach'].map((key,id)=>({id,key,level:0,price:this.shopCardPrice(key),sold:false})),refreshCount:0,healed:false,removed:false};}
  syncTutorial(){
   const t=this.tutorial;if(!t)return;const d=this.dungeon;
   if(t.stage==='move'&&d.y===17)t.stage='pickup';
   if(t.stage==='pickup'&&d.objects['4,16'].active===false)t.stage='left';
   if(t.stage==='left'&&d.dir===3)t.stage='turnWalk';
   if(t.stage==='turnWalk'&&d.x===2)t.stage='right';
   if(t.stage==='right'&&d.dir===0)t.stage='approach';
   if(t.stage==='approach'&&this.phase==='battle')t.stage='combo0';
   if(['combo0','combo1','combo2'].includes(t.stage)){
    const plays=this.battle.actions.filter(a=>a.type==='play').length;t.stage=plays>=3?'combat':'combo'+plays;
   }
   if(t.stage==='shopApproach'&&this.phase==='shop')t.stage='buy';
   if(t.stage==='buy'&&this.shop?.offers.some(o=>o.sold))t.stage='socket';
   if(t.stage==='socket'&&Object.values(this.slotExpansionCounts).some(n=>n>0))t.stage='leave';
   if(t.stage==='leave'&&this.phase==='map')t.stage='gemApproach';
   if(t.stage==='gemApproach'&&this.phase==='gem')t.stage='gemPick';
   if(t.stage==='gemPick'&&this.gemChoice?.selected)t.stage='gemSocket';
   if(t.stage==='gemSocket'&&this.phase==='map')t.stage='altarApproach';
   if(t.stage==='altarApproach'&&this.phase==='removal')t.stage='remove';
   if(t.stage==='remove'&&d.removalEvent.used)t.stage='bossApproach';
   if(t.stage==='bossApproach'&&this.phase==='battle')t.stage='boss';
  }
  tutorialCard(){const key={combo0:'whip',combo1:'fire',combo2:'axe'}[this.tutorial.stage];return key?this.battle?.piles.hand.find(c=>c.key===key):null;}
  allowTutorial(action,arg){this.syncTutorial();const s=this.tutorial.stage;
   if(action==='walk')return !['left','right'].includes(s)&&arg==='forward';
   if(action==='turn')return s==='left'?arg===-1:s==='right'?arg===1:false;
   if(action==='play')return !s.startsWith('combo')||this.tutorialCard()?.id===arg;
   if(action==='endTurn')return !s.startsWith('combo');
   if(this.phase==='shop')return s==='buy'?action==='buy':s==='socket'?action==='slot':s==='leave'?action==='leave':false;
   if(this.phase==='evolution')return action==='evolve';
   if(this.phase==='gem')return ['gem','socket'].includes(action);
   if(this.phase==='removal')return ['remove','removalcancel'].includes(action);
   return true;
  }
  walk(d,o){if(!this.allowTutorial('walk',d))return {ok:false,reason:'Follow the highlighted action.'};const r=super.walk(d,o);this.syncTutorial();return r;}
  turn(n){if(!this.allowTutorial('turn',n))return {ok:false,reason:'Follow the highlighted action.'};const r=super.turn(n);this.syncTutorial();return r;}
  buy(n){if(!this.allowTutorial('buy',n))return {ok:false};const r=super.buy(n);this.syncTutorial();return r;}
  addGemSlot(n){if(!this.allowTutorial('slot',n))return {ok:false};const r=super.addGemSlot(n);this.syncTutorial();return r;}
  leave(){if(!this.allowTutorial('leave'))return false;const r=super.leave();this.syncTutorial();return r;}
  removeCard(n){const r=super.removeCard(n);this.syncTutorial();return r;}
  cancelRemoval(){const r=super.cancelRemoval();if(r)this.tutorial.stage='bossApproach';return r;}
  chooseGem(k){const r=super.chooseGem(k);this.syncTutorial();return r;}
  socketGem(id){const r=super.socketGem(id);this.syncTutorial();return r;}
  cancelGem(){return false;}
  evolutionChoices(){const choices=super.evolutionChoices();return this.tutorial?.stage==='evolution'?choices.filter(c=>c.recipeId==='hellfire').slice(0,1):choices;}
  skipEvolution(){return {ok:false};}
  returnToBossReward(){return false;}
  fuse(id){const r=super.fuse(id);if(r.ok){this.tutorial.stage='complete';this.tutorial.evolvedCard=r.card;}return r;}
  settleBattle(){if(['evolution','complete'].includes(this.tutorial.stage))return false;const boss=this.currentRoom()?.type==='boss',r=super.settleBattle();if(r&&this.battle?.phase==='victory'){
    this.tutorial.stage=boss?'evolution':'shopApproach';this.bossReward=null;this.phase='map';
    if(boss){
     for(const key of ['fire','spinach'])if(!this.deck.some(c=>c.key===key))this.deck.push(this.makeCard(key));
     this.openEvolution();this.evolution.choices=this.evolution.choices.filter(c=>c.recipeId==='hellfire').slice(0,1);
    }
   }this.syncTutorial();return r;
  }
 }
 function layout(run){
  const d=run.dungeon,grid=Array.from({length:20},()=>Array(9).fill('#'));
  for(let y=16;y<=18;y++)grid[y][4]='.';
  for(let x=2;x<=4;x++)grid[16][x]='.';
  for(let y=1;y<=16;y++)grid[y][2]='.';
  for(const [top,bottom]of [[10,12],[1,3]])for(let y=top;y<=bottom;y++)for(let x=1;x<=5;x++)grid[y][x]='.';
  d.grid=grid.map(r=>r.join(''));d.connections={};
  for(let y=0;y<20;y++)for(let x=0;x<9;x++)if(grid[y][x]==='.')d.connections[D.key(x,y)]=D.dirs.reduce((m,v,i)=>m|(grid[y+v.y]?.[x+v.x]==='.'?1<<i:0),0);
  const n=run.maps[0];d.rooms={'2,11':n[0],'2,8':n[1],'2,2':n[2]};
  const specs=[['entry',16,18,[]],['battle',10,12,['tutorial-fight']],['service',7,8,['tutorial-shop']],['service',4,5,[]],['boss',1,3,['tutorial-boss']]];
  d.generation={zones:specs.map(([role,top,bottom,eventIds],i)=>{const cells=[];for(let y=top;y<=bottom;y++)for(let x=0;x<9;x++)if(grid[y][x]==='.')cells.push({x,y});const xs=cells.map(p=>p.x);return {id:'tutorial-zone-'+i,role,entry:i===0,eventIds,cells,bounds:{x:Math.min(...xs),y:top,width:Math.max(...xs)-Math.min(...xs)+1,height:bottom-top+1}};})};
 }
 function restore(run){
  if(![1,2,3].includes(run.tutorial?.version)||!stages.includes(run.tutorial.stage)||!run.tutorial.options)throw Error('Invalid tutorial save');
  Object.setPrototypeOf(run,TutorialRun.prototype);
  if(run.tutorial.version===1){
   const d=run.dungeon,s=run.tutorial.stage;
   if(s==='right')run.tutorial.stage='turnWalk';
   else if(!['move','pickup','left'].includes(s))d.x=2;
   if(d.objects['4,5']){d.objects['2,5']=d.objects['4,5'];delete d.objects['4,5'];}
   d.removalEvent.key='2,5';if(run.removalChoice)run.removalChoice.objectKey='2,5';
   d.seen=[];d.visited=[];delete run.battleCamera;layout(run);D.reveal(d);run.tutorial.version=2;
  }
  if(run.tutorial.version<3){
   if(['move','pickup','left','turnWalk','right','approach','combo0','combo1','combo2','combat','shopApproach','buy','socket','leave'].includes(run.tutorial.stage))run.dungeon.objects['2,6']={id:'training-gems',type:'gemchest',active:true,offers:['draw','armor','costDown']};
   run.tutorial.version=3;
  }
  if(run.tutorial.stage==='evolution'&&run.evolution)run.evolution.choices=run.evolutionChoices();
  return run;
 }
 function recommendation(run){
  const b=run.battle;if(!b||run.phase!=='battle'||b.phase!=='player')return null;
  const legal=b.piles.hand.filter(c=>b.canPlay(c.id).ok).map(card=>({card,preview:b.cardPreview(card)}));
  const numeric=legal.filter(x=>E.definition(x.card).costType!=='wild').sort((a,c)=>a.preview.cost-c.preview.cost||a.card.id-c.card.id);
  const ascending=b.previousCost!==null?numeric.find(x=>x.preview.cost===b.previousCost+1):null;
  return ascending||numeric[0]||legal[0]||null;
 }
 const api={TutorialRun,create:options=>new TutorialRun(options),restore,stages,recommendation};if(node)module.exports=api;else root.CrawlerTutorial=api;
})(globalThis);
