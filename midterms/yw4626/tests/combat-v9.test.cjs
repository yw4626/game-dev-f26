'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,definition,attackSummary,catalog,frontEnemies,rng}=require('../dist/engine.js');
const {Run}=require('../dist/run.js'),encounters=require('../dist/encounters.js'),progression=require('../dist/progression-catalog.js');
function enemy(column,health=1000,row=0){return {key:'ghost',name:'fixture',health,armor:0,slot:{row,column},intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]};}
function battle(key,enemies=[enemy(0),enemy(2),enemy(4)],extra={}){
  const cards=[{id:1,key,level:0,gems:[],...extra}],b=new Battle({seed:'TARGET',deck:cards,enemies,settings:{attackRulesVersion:9,startingMana:100,dealCount:0,handLimit:9}});
  b.piles.hand=b.piles.draw;b.piles.draw=[];return b;
}
const impacts=b=>b.events.filter(e=>e.type==='enemy_damage');
test('shipped targeting preserves configured pierce and the native effective Whip/RuneTracer overrides',()=>{
  assert.equal(definition({key:'axe'}).configuredPierce,2);assert.equal(definition({key:'axe'}).pierce,2);assert.equal(definition({key:'axe',level:2}).pierce,3);
  assert.equal(definition({key:'whip'}).configuredPierce,3);assert.equal(definition({key:'whip'}).effectivePierce,5);assert.equal(definition({key:'runetracer'}).pierce,1);
  assert.equal(definition({key:'bible'}).attackPattern,'left-right');assert.equal(definition({key:'bible'}).area,0);
});
test('static and battle previews expose upper impact bounds without treating every projectile as one total hit',()=>{
  const def=definition({key:'whip'}),staticPreview=attackSummary(def,{},1,[]),live=attackSummary(def,{},2,[enemy(0),enemy(2)]);
  assert.equal(staticPreview.maxImpactCount,5);assert.equal(staticPreview.totalDamage,40);assert.equal(staticPreview.targetCount,5);
  assert.equal(live.maxImpactCount,4);assert.equal(live.totalDamage,32);assert.equal(live.waves,2);
  assert.equal(attackSummary(def,{},1,[enemy(0,0)]).totalDamage,0);
});
test('Bible scans left-to-right five projectiles and wraps; it is not all-enemy damage each projectile',()=>{
  const b=battle('bible');b.target=999;assert.ok(b.canPlay(1).ok);b.play(1);
  assert.deepEqual(impacts(b).map(e=>e.enemyId),[1,2,3,1,2]);assert.deepEqual(impacts(b).map(e=>e.wave),[1,2,3,4,5]);assert.ok(impacts(b).every(e=>e.pattern==='left-right'));
});
test('Axe pierces two different enemies per projectile while its cursor continues across waves',()=>{
  const b=battle('axe');b.play(1);assert.deepEqual(impacts(b).map(e=>e.enemyId),[1,2,3,1,2,3]);assert.deepEqual(impacts(b).map(e=>e.wave),[1,1,2,2,3,3]);
  const solo=battle('axe',[enemy(2)]);solo.play(1);assert.equal(impacts(solo).length,3);
});
test('Whip sweeps up to five front-column targets and does not hit protected rear enemies',()=>{
  const b=battle('whip',[enemy(0),enemy(1),enemy(2),enemy(3),enemy(4),enemy(2,1000,1)]);b.play(1);
  assert.deepEqual(impacts(b).map(e=>e.enemyId),[1,2,3,4,5]);assert.equal(b.enemies[5].health,1000);
});
test('death promotes the surviving enemy in the same column; each killed instance awards one event',()=>{
  const b=battle('bible',[enemy(0,1),enemy(0,1,1),enemy(2,1),enemy(4,1)]);b.play(1);
  assert.deepEqual(impacts(b).map(e=>e.enemyId),[1,3,4,2]);assert.equal(b.phase,'victory');assert.equal(b.events.filter(e=>e.type==='kill').length,4);assert.equal(frontEnemies(b.enemies).length,0);
});
test('right-left wand prioritizes attacking intent then falls back to other columns',()=>{
  const b=battle('wand');b.enemies[0].intent={actions:[{kind:'attack',value:1}]};b.enemies[2].intent={actions:[{kind:'armor',value:1}]};b.play(1);assert.equal(impacts(b)[0].enemyId,1);
  const plain=battle('wand');plain.play(1);assert.equal(impacts(plain)[0].enemyId,3);
});
test('random targeting draws column bags without replacement and survives deterministic reload',()=>{
  const b=battle('fire');const saved=b.snapshot(),copy=Battle.restore(saved);b.play(1);copy.play(1);
  assert.deepEqual(b.snapshot(),copy.snapshot());assert.equal(new Set(impacts(b).slice(0,3).map(e=>e.enemyId)).size,3);
  const cross=battle('cross',[enemy(2)]);cross.play(1);assert.equal(impacts(cross).length,definition({key:'cross'}).baseAmount*2);
});
test('piercing armor resolves per target and combo/gem scalars apply once before targeting',()=>{
  const b=battle('axe');b.enemies[0].armor=10;b.enemies[1].armor=20;b.play(1);
  assert.equal(impacts(b)[0].armorDamage,10);assert.equal(impacts(b)[0].actualLoss,5);assert.equal(impacts(b)[1].armorDamage,15);assert.equal(impacts(b)[1].actualLoss,0);
  const w=battle('whip',undefined,{gems:['double']});w.combo=1;w.previousCost=-1;w.play(1);assert.equal(impacts(w).length,6);assert.ok(impacts(w).every(e=>e.actualLoss===16));assert.equal(Object.values(w.piles).flat().length,w.cardCount);
});
test('new encounters redistribute original HP/XP/maximum turn threat instead of multiplying it per added enemy',()=>{
  for(let floor=1;floor<=3;floor++)for(const type of ['battle','elite','boss'])for(const stage of [0,3])for(let seed=0;seed<20;seed++){
    const node={type,stage},items=encounters.create({floor,node,catalog,xp:progression.enemies,random:rng('BUDGET'+seed)}),budget=encounters.budget(floor,node,catalog,progression.enemies);
    assert.equal(items.reduce((n,e)=>n+e.health,0),budget.health);assert.equal(items.reduce((n,e)=>n+e.xpOverride,0),budget.xp);assert.equal(items.reduce((n,e)=>n+e.armor,0),budget.armor);
    for(const [kind,field]of [['attack','attack'],['armor','shield']])assert.equal(items.reduce((n,e)=>n+Math.max(...e.intents.flatMap(i=>i.actions.filter(a=>a.kind===kind).map(a=>a.value)),0),0),budget[field]);
    assert.ok(items.every(e=>e.health>0&&e.slot.column>=0&&e.slot.column<5));assert.equal(new Set(items.map(e=>e.slot.row+':'+e.slot.column)).size,items.length);
    if(type==='boss'){assert.equal(items.filter(e=>e.encounterRole==='boss').length,1);assert.ok(items.filter(e=>e.encounterRole==='minion').length>=2);}else assert.ok(items.length>=(type==='elite'?4:3));
  }
});
test('XP overrides prevent reskinned swarm count from granting full original XP per creature',()=>{
  const r=new Run({exploration:false});r.enter(r.available()[0].id);const total=r.battle.enemies.reduce((n,e)=>n+e.xpOverride,0);
  for(const e of r.battle.enemies){e.health=0;r.battle.log('kill','fixture',{enemyId:e.id});}r.syncExperience();assert.equal(r.xp+5,total);const save=r.snapshot();r.syncExperience();assert.deepEqual(r.snapshot(),save);
});
test('old v8 saves keep selected-target combat and their original future encounter composition',()=>{
  const r=new Run({combatVersion:8,exploration:false}),save=r.snapshot();delete save.data.combatVersion;const old=Run.restore(save);old.enter(old.available()[0].id);
  assert.equal(old.battle.enemies.length,2);assert.equal(old.battle.settings.attackRulesVersion,8);assert.equal(old.battle.cardPreview(old.battle.piles.hand.find(c=>catalog.cards[c.key].kind==='attack')).attackPattern,'selected');
});
test('both characters and both profiles complete real map journeys with supplies, W purchase/use, boss minions and saved state',()=>{
  const {simulate}=require('./simulate-v9.cjs');
  for(const profile of ['base','demo'])for(const character of ['antonio','imelda'])for(let seed=0;seed<2;seed++){
    const result=simulate({seed:'V9-BAL-'+seed,profile,character});
    assert.equal(result.outcome,'won');assert.ok(result.moves>10);assert.equal(result.playedW,1);assert.equal(result.seenMinions,3);assert.equal(result.luck,5);assert.ok(result.growth.mana>=2);
  }
});
