/* Explicit, disposable human animation fixtures. Never used by evaluations. */
(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports;
 const E=node?require('./engine.js'):root.Crawler,R=node?require('./run.js'):root.CrawlerRun,D=node?require('./dungeon.js'):root.CrawlerDungeon;
 const modes=['ritual','bleed','finale'];
 function create(mode='ritual'){
  if(!modes.includes(mode))throw Error('Unknown boss test phase');
  const r=new R.Run({seed:'BOSS-ANIMATION-TEST',exploration:false});r.floor=5;r.health=r.maxHealth=200;r.growth={mana:7,deal:1};
  r.deck=['whip','fire','axe','armor','littleHeart','lightTome'].map(k=>r.makeCard(k));
  r.dungeon=D.build(r.seed,5,r.maps[4]);r.dungeon.themeVersion=24;
  const room=r.maps[4].find(n=>n.type==='boss');r.current=room.id;r.stage=room.stage;r.phase='battle';
  const entry=Object.entries(r.dungeon.rooms).find(([,v])=>v.id===room.id);
  if(entry){const [x,y]=entry[0].split(',').map(Number);Object.assign(r.dungeon,{x,y});const dir=D.dirs.findIndex(v=>D.canTraverse(r.dungeon,x,y,x-v.x,y-v.y));r.dungeon.dir=Math.max(0,dir);}
  const boss=r.encounter(room).find(e=>e.encounterRole==='boss');boss.xpOverride=0;boss.slot={row:0,column:2};
  const b=r.battle=new E.Battle({seed:r.seed,deck:r.deck,enemies:[boss],settings:{...r.combatSettings(),bossFloor:5,startingArmor:0},player:{health:200,maxHealth:200}});
  // A fixed hand makes each entry repeatable; subsequent play still uses the engine.
  b.piles.hand.sort((a,c)=>r.deck.findIndex(d=>d.id===a.id)-r.deck.findIndex(d=>d.id===c.id));
  if(mode!=='ritual'){
   E.bossRules.afterCard(b,{kind:'skill'},b.player.health);
   for(const e of b.enemies.filter(e=>e.bloodEcho))e.health=0;
   E.bossRules.afterCard(b,{kind:'skill'},b.player.health);b.compactFormation();
   const v=b.enemies.find(e=>e.bossKind===5);v.health=mode==='finale'?1:300;v.armor=0;b.decideIntent(v);
  }
  b.events=[];r.xpCursor=0;return r;
 }
 const api={create,modes};if(node)module.exports=api;else root.BossTest=api;
})(globalThis);
