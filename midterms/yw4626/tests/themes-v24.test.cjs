'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run'),D=require('../dist/dungeon'),{Battle,catalog,rng}=require('../dist/engine'),E=require('../dist/encounters'),P=require('../dist/progression-catalog'),T=require('../dist/floor-themes'),M=require('../dist/combat-motion');
const encounter=f=>E.create({floor:f,node:{type:'boss',stage:4},catalog,xp:P.enemies,random:rng('V24'),rulesVersion:12});
test('five themes use 25 distinct normal roles and five increasingly strong guardians',()=>{
 assert.equal(new Set(T.floors.flatMap(t=>t.enemies.map(e=>e.visualKey))).size,25);
 let old={health:0,attack:0,armor:0};
 for(let f=1;f<=5;f++){const enemies=encounter(f),boss=enemies.find(e=>e.finalBoss),s=T.get(f).stats;
  assert.equal(boss.health,s.health);assert.equal(boss.armor,s.armor);assert.equal(boss.xpOverride,s.xp);
  for(const k of ['health','attack','armor'])assert.ok(s[k]>old[k]);old=s;
  assert.ok(boss.intents.some(i=>i.actions.some(a=>a.kind==='attack'&&a.value===s.attack)));
  assert.ok(enemies.filter(e=>!e.finalBoss).every(e=>T.get(f).enemies.some(v=>v.visualKey===e.visualKey)));
 }
});
test('boss is visible at the rear, can receive rear damage, and advances only after the final add',()=>{
 const b=new Battle({enemies:encounter(2),settings:{attackRulesVersion:13,dealCount:0}}),boss=b.enemies.find(e=>e.finalBoss);
 assert.equal(M.formation(b.enemies).find(e=>e.enemy===boss).depth,3);assert.equal(boss.intent,null);
 const hp=boss.health;b.applyDamage({id:1},boss,40,{splash:true});assert.ok(boss.health<hp);
 const adds=b.enemies.filter(e=>!e.finalBoss),last=adds.find(e=>e.slot.column!==2);
 for(const e of adds.filter(e=>e!==last))b.applyDamage({id:1},e,99999);
 assert.equal(b.living().includes(boss),true);assert.equal(b.beginEnemyTurn(),true);assert.deepEqual(b.enemyQueue,[last.id]);
 while(b.phase==='enemy')b.resolveNextEnemy();
 b.applyDamage({id:1},last,99999);
 assert.deepEqual(b.living(),[boss]);assert.deepEqual(boss.slot,{row:0,column:2});assert.ok(boss.intent);
 assert.deepEqual(M.formation(b.enemies).map(x=>x.enemy),[boss]);assert.ok(b.events.some(e=>e.type==='enemy_advance'&&e.enemyId===boss.id));
 const restored=Battle.restore(b.snapshot());assert.deepEqual(restored.snapshot(),b.snapshot());
 b.beginEnemyTurn();assert.deepEqual(b.enemyQueue,[boss.id]);
});
test('new reward free tag survives a save and expires with its actual free payment',()=>{
 const r=new Run({exploration:false});r.enter(r.available()[0].id);const b=r.battle;
 r.pendingLevels=[2];r.openLevelChoice();assert.ok(r.chooseLevelCard(0).ok);const c=b.piles.hand.at(-1);
 assert.equal(c.rewardFreeTurn,b.turn);assert.equal(b.cardPreview(c).payment,0);
 const restored=Run.restore(r.snapshot()),rc=restored.battle.piles.hand.find(x=>x.id===c.id);assert.equal(rc.rewardFreeTurn,b.turn);
 b.beginEnemyTurn();while(b.phase==='enemy')b.resolveNextEnemy();
 const moved=Object.values(b.piles).flat().find(x=>x.id===c.id);assert.equal(moved.rewardFreeTurn,undefined);assert.equal(moved.free,false);
});
test('garden doorway persists before entry; later floors retain shovel descent and fifth floor ends',()=>{
 let r=new Run({seed:'DOOR24'});for(let f=1;f<5;f++){
  const d=r.dungeon,key=d.exit.key;[d.x,d.y]=key.split(',').map(Number);r.completed.push(d.exit.roomId);D.refreshExit(d,r.completed);r=Run.restore(r.snapshot());
  assert.equal(D.objectAt(r.dungeon).type,f===1?'mansionDoor':'shovel');const hp=r.health,gold=r.gold;
  assert.ok(r.walk('forward').ok);
  if(f===1){assert.equal(r.gold,gold);assert.equal(r.dig,null);}else {assert.equal(r.phase,'digging');for(let i=0;i<3;i++)r.digStep();assert.equal(r.gold,gold+100);}
  assert.equal(r.floor,f+1);assert.equal(r.health,hp);assert.equal(r.phase,'map');
 }
 const d=r.dungeon;[d.x,d.y]=d.exit.key.split(',').map(Number);r.enter(d.exit.roomId);r.battle.enemies.forEach(e=>e.health=0);r.battle.phase='victory';r.settleBattle();assert.equal(r.phase,'won');
});
