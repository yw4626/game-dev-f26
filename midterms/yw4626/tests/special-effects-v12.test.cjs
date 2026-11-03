'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=E.specials,Fx=E.effectsV10;
const wait={id:1,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]};
function fixture(key='noFuture',health=10000){
 const enemies=Array.from({length:10},(_,i)=>({key:'ghost',name:'Target '+i,health,slot:{row:Math.floor(i/5),column:i%5},intents:[wait]}));
 const card={id:1,key,level:0,gems:[],modifiers:[0,0,0,0]};
 const b=new E.Battle({seed:'SPECIAL12',deck:[card],enemies,settings:{attackRulesVersion:12,startingMana:100,dealCount:1,handLimit:20}});return b;
}
function withTimeline(events,fn){const old=S.projectileTimeline;try{S.projectileTimeline=()=>events;fn();}finally{S.projectileTimeline=old;}}
const burst=(x,y=3,time=.1)=>({type:'explosion',wave:1,time,boundary:'right',position:{x,y}});
test('wall damage uses serialized f32 .2 then ties-to-even, not ctor .5 or a crit multiplier',()=>{
 assert.equal(S.explosionDamage(15),3);assert.equal(S.explosionDamage(30),6);assert.equal(S.explosionDamage(100),20);
 assert.equal(S.explosionDamage(12.5),3,'serialized .2 is slightly above .2, not exactly halfway');
 assert.equal(S.explosionDamage(0),0);
});
test('trajectory reflects actual walls, supports two independent corner events, and delays bursts',()=>{
 const diagonal=S.traceProjectile({origin:{x:4.5,y:3},direction:{x:1,y:0},speed:30,duration:.5});
 assert.ok(diagonal.some(e=>e.type==='boundary'));assert.ok(diagonal.filter(e=>e.type==='boundary').every(e=>e.time>0&&e.time<=.5));
 const corner=S.traceProjectile({origin:{x:4.5,y:3},direction:{x:9,y:6},speed:30,duration:.2}).filter(e=>e.type==='boundary');
 assert.equal(corner.length,2);assert.ok(Math.abs(corner[0].time-corner[1].time)<1e-8);assert.notEqual(corner[0].boundary,corner[1].boundary);
 const d=E.definition({key:'noFuture'}),timeline=S.projectileTimeline({damage:15,hits:1},d,E.rng('trajectory'));
 for(const e of timeline.filter(e=>e.type==='explosion'))assert.ok(timeline.some(b=>b.type==='boundary'&&b.boundary===e.boundary&&Math.abs(e.time-b.time-S.noFuture.delay)<1e-7));
});
test('each column can be hit again only after a boundary resets collision memory',()=>{
 const events=S.traceProjectile({origin:S.columnPosition(2),direction:{x:1,y:0},speed:30,duration:1,initialColumn:2});
 let seen=new Set(),repeated=false,all=new Set();
 for(const e of events){if(e.type==='boundary')seen.clear();else{assert.ok(!seen.has(e.column));seen.add(e.column);if(all.has(e.column))repeated=true;all.add(e.column);}}
 assert.ok(repeated);assert.ok(all.size>1);
});
test('wall burst targets only nearest currently targetable front, respects armor, no splash/crit/heal',()=>{
 withTimeline([burst(8)],()=>{
  const b=fixture(),before=b.player.health=20;b.player.area=100;b.player.luck=10000;b.enemies[4].armor=2;
  assert.ok(b.play(1).ok);const hit=b.events.filter(e=>e.type==='enemy_damage');assert.equal(hit.length,1);assert.equal(hit[0].enemyId,5);assert.equal(hit[0].armorDamage,2);assert.equal(hit[0].healthDamage,1);
  assert.equal(b.player.health,before);assert.equal(b.events.filter(e=>e.type==='critical').length,0);assert.equal(b.enemies[9].health,10000);assert.equal(hit[0].source,'boundary_explosion');
 });
 withTimeline([burst(8)],()=>{const b=fixture();b.enemies[4].targetable=false;b.play(1);assert.equal(b.events.find(e=>e.type==='enemy_damage').enemyId,4);});
});
test('delayed explosions retarget the promoted enemy and never emit duplicate kills',()=>{
 withTimeline([{type:'contact',wave:1,time:0,column:4,position:S.columnPosition(4)},burst(8)],()=>{
  const b=fixture();b.enemies[4].health=1;b.play(1);
  const hits=b.events.filter(e=>e.type==='enemy_damage');assert.deepEqual(hits.map(e=>e.enemyId),[5,10]);assert.equal(hits[1].healthDamage,3);
  assert.equal(b.events.filter(e=>e.type==='kill'&&e.enemyId===5).length,1);assert.equal(b.enemies[9].slot.row,0);assert.equal(b.phase,'player');
 });
});
test('burst freeze doubles damage and consumes one stack before restoring intent',()=>{
 withTimeline([burst(8)],()=>{const b=fixture(),target=b.enemies[4];target.freezeStacks=1;target.frozenIntent=target.intent;target.intent=null;b.play(1);const hit=b.events.find(e=>e.type==='enemy_damage');assert.equal(hit.healthDamage,6);assert.equal(target.freezeStacks,0);assert.ok(target.intent);assert.equal(b.events.filter(e=>e.type==='freeze_consumed').length,1);});
});
test('real No Future trajectory settles repeated full hits AND variable boundary damage; exact save/replay',()=>{
 const b=fixture(),restored=E.Battle.restore(b.snapshot());b.play(1);restored.play(1);assert.deepEqual(restored.snapshot(),b.snapshot());
 const hits=b.events.filter(e=>e.type==='enemy_damage'),bursts=hits.filter(e=>e.boundary),contacts=hits.filter(e=>e.source==='projectile_contact');
 assert.ok(contacts.length>1);assert.ok(bursts.length>1);assert.ok(contacts.every(e=>e.healthDamage===15));assert.ok(bursts.every(e=>e.healthDamage===3));
 assert.equal(b.player.mana,97);assert.equal(b.piles.combo.length,1);assert.equal(b.piles.hand.length,0);
});
test('combo adds projectiles and speed; Might scales both contact and explosion damage',()=>{
 const normal=fixture(),combo=fixture();combo.combo=2;combo.previousWild=true;combo.player.might=100;
 normal.play(1);combo.play(1);const event=combo.events.find(e=>e.type==='projectile_flight');assert.equal(event.projectiles,3);
 const bursts=combo.events.filter(e=>e.type==='enemy_damage'&&e.boundary);assert.ok(bursts.every(e=>e.healthDamage===6));
 assert.ok(bursts.length>normal.events.filter(e=>e.type==='enemy_damage'&&e.boundary).length*3);
});
test('base Runetracer repeats contacts but has shorter slower flight and no evolved explosions',()=>{
 const b=fixture('runetracer');b.targetRandom=E.rng('RUNE0');b.play(1);
 assert.equal(b.events.find(e=>e.type==='projectile_flight').lifetime,1.5);
 assert.equal(S.runetracer.speed,20);assert.equal(S.noFuture.speed,30);
 assert.ok(b.events.filter(e=>e.type==='enemy_damage').length>1);
 assert.equal(b.events.filter(e=>e.type==='boundary_explosion').length,0);
 assert.equal(b.events.filter(e=>e.type==='enemy_damage'&&e.boundary).length,0);
});
test('Heaven Sword applies banker rounding after frozen damage, legacy snapshots keep old rounding',()=>{
 for(const [version,frozen,expected]of [[12,0,12],[12,1,25],[10,0,12.5]]){
  const b=fixture('heavenSword'),card=b.piles.hand[0],target=b.enemies[0],def={...E.definition(card),critChance:1};b.settings.attackRulesVersion=version;target.freezeStacks=frozen;b.player.luck=0;
  Fx.hit(b,card,def,target,5,{wave:1,hit:1});assert.equal(b.events.find(e=>e.type==='enemy_damage').healthDamage,expected);
 }
});
test('every enabled evolved card exposes actual special effects in bilingual descriptions',()=>{
 for(const r of E.evolutionRecipes.filter(r=>r.runtimeEnabled)){
  const d=E.definition({key:r.resultKey}),opts={player:{revivalStacks:2},multiplier:3,damage:d.baseDamage};
  const zh=S.describe(d,opts),en=S.describe(d,{...opts,en:true});assert.ok(zh.compact,r.id);assert.ok(zh.lines.length,r.id);assert.ok(en.lines.length,r.id);assert.notDeepEqual(zh.lines,en.lines,r.id);
 }
 const no=S.describe(E.definition({key:'noFuture'}),{damage:30});assert.ok(no.compact.includes('+6'));assert.ok(no.lines.join('').includes('不触发暴击'));
 const soul=S.describe(E.definition({key:'soulEater'}),{multiplier:3});assert.ok(soul.compact.includes('治疗6'));assert.ok(soul.compact.includes('解除2'));
 const bloody=S.describe(E.definition({key:'bloodyTear'}));assert.ok(bloody.lines.join('').includes('每次出牌最多一次'));
});
