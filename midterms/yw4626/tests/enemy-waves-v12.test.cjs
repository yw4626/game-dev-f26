'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,rng,frontEnemies}=require('../dist/engine.js');
const encounters=require('../dist/encounters.js'),progression=require('../dist/progression-catalog.js');
const {Run}=require('../dist/run.js');
function wave(floor=1,type='battle',stage=0,seed='WAVES'){
  return encounters.create({floor,node:{type,stage},catalog,xp:progression.enemies,random:rng(seed),rulesVersion:12});
}
const maxAction=(enemy,kind)=>Math.max(0,...enemy.intents.flatMap(i=>i.actions.filter(a=>a.kind===kind).map(a=>a.value)));
test('v12 encounters use multiple fixed five-column queues that grow through the five floors',()=>{
  let previous=0;
  for(let floor=1;floor<=5;floor++){
    const enemies=wave(floor),rows=new Set(enemies.map(e=>e.slot.row)),columns=new Set(enemies.map(e=>e.slot.column));
    assert.ok(rows.size>=3);assert.ok(enemies.length>=9);assert.ok(enemies.length>=previous);previous=enemies.length;
    assert.ok([...columns].every(c=>Number.isInteger(c)&&c>=0&&c<5));
    assert.equal(new Set(enemies.map(e=>`${e.slot.row}:${e.slot.column}`)).size,enemies.length);
    for(const column of columns)assert.deepEqual(enemies.filter(e=>e.slot.column===column).map(e=>e.slot.row),Array.from({length:rows.size},(_,i)=>i));
    assert.equal(frontEnemies(enemies).length,columns.size);
  }
  assert.equal(wave(5,'battle',3).length,30);
});
test('more enemies divide total HP, XP and shield gains while keeping the front turn threat bounded',()=>{
  for(let floor=1;floor<=5;floor++)for(const type of ['battle','elite','boss'])for(const stage of [0,3]){
    const enemies=wave(floor,type,stage),budget=type==='boss'?{...enemies[0].encounterBudget,attack:enemies[0].encounterBudget.maxFrontAttack}:encounters.budget(floor,{type,stage},catalog,progression.enemies);
    assert.equal(enemies.reduce((s,e)=>s+e.health,0),budget.health);
    assert.equal(enemies.reduce((s,e)=>s+e.xpOverride,0),budget.xp);
    assert.equal(enemies.reduce((s,e)=>s+e.armor,0),budget.armor);
    assert.equal(enemies.reduce((s,e)=>s+maxAction(e,'armor'),0),budget.shield);
    assert.ok(enemies.every(e=>e.health>0&&Number.isInteger(e.xpOverride)&&e.xpOverride>=0));
    for(let row=0;row<enemies[0].formationDepth;row++){
      assert.ok(enemies.filter(e=>e.slot.row===row&&!e.finalBoss).reduce((s,e)=>s+maxAction(e,'attack'),0)<=budget.attack);
    }
    assert.ok(enemies.filter(e=>e.finalBoss).every(e=>maxAction(e,'attack')<=budget.attack));
  }
});
test('boss waits globally behind all minions, then enters alone at center',()=>{
  for(let floor=1;floor<=5;floor++){
    const enemies=wave(floor,'boss',4),boss=enemies.filter(e=>e.encounterRole==='boss');
    assert.equal(boss.length,1);assert.deepEqual(boss[0].slot,{row:enemies[0].formationDepth-1,column:2});
    assert.equal(frontEnemies(enemies).some(x=>x.enemy===boss[0]),false);
    assert.equal(frontEnemies(enemies).filter(x=>x.enemy.encounterRole==='minion').length,5);
    assert.ok(enemies.filter(e=>e.encounterRole==='minion'&&e.slot.row>0).length>=14);
    assert.ok(boss[0].health>=enemies.reduce((s,e)=>s+e.health,0)*.5);
    enemies.filter(e=>e.encounterRole!=='boss'&&e.slot.column===2).forEach(e=>e.health=0);
    assert.equal(frontEnemies(enemies).some(x=>x.enemy===boss[0]),false);
    enemies.filter(e=>e.encounterRole!=='boss').forEach(e=>e.health=0);
    assert.deepEqual(frontEnemies(enemies).map(x=>x.enemy),boss);
  }
});
test('wave population and sprite variety are deterministic; old encounter rules retain old counts',()=>{
  assert.deepEqual(wave(3,'elite',3,'REPLAY'),wave(3,'elite',3,'REPLAY'));
  assert.ok(new Set(wave(3).map(e=>e.visualKey)).size>=5);
  const old=encounters.create({floor:3,node:{type:'boss',stage:4},catalog,xp:progression.enemies,random:rng('OLD'),rulesVersion:9});
  assert.equal(old.length,4);assert.equal(old.filter(e=>e.encounterRole==='minion').length,3);
  assert.ok(old.every(e=>e.encounterBudget.version===9));
});
test('only the current front of each column is targeted; removing fronts reveals later reserves',()=>{
  const enemies=wave(3);enemies.forEach((e,i)=>e.id=i+1);
  const column=enemies.filter(e=>e.slot.column===2),initial=frontEnemies(enemies);
  assert.equal(initial.find(x=>x.column===2).enemy,column[0]);
  for(let i=0;i<column.length;i++){
    assert.equal(frontEnemies(enemies).find(x=>x.column===2).enemy,column[i]);column[i].health=0;
  }
  assert.equal(frontEnemies(enemies).some(x=>x.column===2),false);
  assert.ok(frontEnemies(enemies).every(x=>x.enemy.slot.row===0));
});
function fixtureEnemy(column,row,health=100){return {key:'ghost',name:`C${column}R${row}`,health,armor:0,slot:{row,column},intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'attack',value:2}]}]};}
function fixtureBattle(enemies,key='bible'){
  const b=new Battle({seed:'QUEUE-REPLAY',deck:[{id:1,key,gems:[]}],enemies,settings:{attackRulesVersion:12,startingMana:99,dealCount:0,handLimit:20}});
  b.piles.hand=b.piles.draw;b.piles.draw=[];return b;
}
test('reserves have no intent and front death compacts only its column with explicit advance events',()=>{
  const b=fixtureBattle([fixtureEnemy(0,0),fixtureEnemy(0,1),fixtureEnemy(0,2),fixtureEnemy(2,0),fixtureEnemy(2,1)]);
  assert.ok(b.enemies[0].intent);assert.equal(b.enemies[1].intent,null);assert.equal(b.enemies[2].intent,null);
  const otherIntent=b.enemies[3].intent;
  b.applyDamage({id:1},b.enemies[0],100);
  assert.deepEqual(b.enemies.slice(1,3).map(e=>e.slot.row),[0,1]);
  assert.deepEqual(b.enemies.slice(3).map(e=>e.slot.row),[0,1]);assert.equal(b.enemies[3].intent,otherIntent);
  assert.ok(b.enemies[1].intent);assert.equal(b.enemies[2].intent,null);
  assert.deepEqual(b.events.filter(e=>e.type==='enemy_advance').map(e=>[e.enemyId,e.column,e.fromRow,e.toRow]),[[2,0,1,0],[3,0,2,1]]);
  b.applyDamage({id:1},b.enemies[0],100);
  assert.equal(b.events.filter(e=>e.type==='kill'&&e.enemyId===1).length,1);
});
test('only fronts act and newly visible front replaces a dead enemy without adding rear attacks',()=>{
  const b=fixtureBattle([fixtureEnemy(0,0),fixtureEnemy(0,1),fixtureEnemy(0,2),fixtureEnemy(2,0),fixtureEnemy(2,1)]);
  b.applyDamage({id:1},b.enemies[0],100);assert.ok(b.beginEnemyTurn());
  assert.deepEqual(b.enemyQueue,[4,2]);
  while(b.phase==='enemy')b.resolveNextEnemy();
  assert.deepEqual(b.events.filter(e=>e.type==='enemy_action').map(e=>e.enemyId),[4,2]);
  assert.equal(b.enemies[2].intent,null);assert.equal(b.enemies[4].intent,null);
});
test('a multi-projectile card can kill successive reserves, and victory waits for the last queued enemy',()=>{
  const enemies=Array.from({length:11},(_,row)=>fixtureEnemy(2,row,1)),b=fixtureBattle(enemies,'thousandEdge');
  b.play(1);
  assert.equal(b.events.filter(e=>e.type==='kill').length,10);assert.equal(b.living().length,1);assert.equal(b.phase,'player');
  assert.equal(b.living()[0].slot.row,0);assert.ok(b.living()[0].intent);
  b.releaseCombo(true);b.piles.hand=b.piles.discard;b.piles.discard=[];b.play(1);
  assert.equal(b.events.filter(e=>e.type==='kill').length,11);assert.equal(b.phase,'victory');
});
test('promoted formation, intent RNG and next enemy actions survive a mid-turn restore',()=>{
  const b=fixtureBattle(Array.from({length:12},(_,i)=>fixtureEnemy(i%3,Math.floor(i/3),30)));
  b.applyDamage({id:1},b.enemies[0],30);b.beginEnemyTurn();b.resolveNextEnemy();
  const restored=Battle.restore(b.snapshot());
  while(b.phase==='enemy')b.resolveNextEnemy();while(restored.phase==='enemy')restored.resolveNextEnemy();
  assert.deepEqual(restored.snapshot(),b.snapshot());
});
test('v12 Run XP remains once per killed instance and old battle migration does not regenerate its roster',()=>{
  const run=new Run({exploration:false,combatVersion:12});run.enter(run.available()[0].id);
  assert.equal(run.battle.enemies.length,15);
  for(const row of new Set(run.battle.enemies.map(e=>e.slot.row)))assert.equal(run.battle.enemies.filter(e=>e.slot.row===row).length,5);
  const target=run.battle.enemies[0];run.battle.applyDamage({id:0},target,target.health);run.syncExperience();
  const cursor=run.xpCursor,stats=JSON.stringify(run.stats),xp=run.xp;
  run.battle.applyDamage({id:0},target,10000);run.syncExperience();
  assert.equal(run.xp,xp);assert.equal(run.xpCursor,cursor);assert.equal(JSON.stringify(run.stats),stats);
  const legacy=new Run({exploration:false,combatVersion:10});legacy.enter(legacy.available()[0].id);
  const ids=legacy.battle.enemies.map(e=>[e.id,e.health,e.xpOverride]);
  assert.equal(legacy.enableCombatV12(),true);assert.equal(legacy.enableCombatV12(),false);
  assert.deepEqual(legacy.battle.enemies.map(e=>[e.id,e.health,e.xpOverride]),ids);
  assert.equal(legacy.encounter({type:'battle',stage:0,id:'new'}).length,15);
});
test('Rosary snapshots selected original rows before death compaction; promoted reserves are not erased again',()=>{
  const b=fixtureBattle(Array.from({length:9},(_,i)=>fixtureEnemy(i%3,Math.floor(i/3))),'rosary');
  b.play(1);
  assert.deepEqual(b.events.filter(e=>e.type==='kill').map(e=>e.enemyId),[1,2,3]);
  assert.deepEqual(b.enemies.slice(3).map(e=>e.health),[100,100,100,100,100,100]);
  assert.deepEqual(b.enemies.slice(3).map(e=>e.slot.row),[0,0,0,1,1,1]);assert.equal(b.phase,'player');
});
test('two-row Rosary affects both selected rows once even if the resistant front boss survives',()=>{
  const enemies=Array.from({length:9},(_,i)=>fixtureEnemy(i%3,Math.floor(i/3)));
  enemies[1].instakillResist=.9;
  const b=fixtureBattle(enemies,'rosary');b.settings.wildStrength=true;b.combo=1;b.previousWild=true;b.play(1);
  const hits=b.events.filter(e=>e.type==='enemy_damage');assert.deepEqual(hits.map(e=>e.enemyId),[1,2,3,4,5,6]);
  assert.equal(b.enemies[1].health,90);assert.ok(b.enemies.slice(6).every(e=>e.health===100));
  assert.equal(b.events.filter(e=>e.type==='kill').length,5);assert.equal(b.phase,'player');
});
