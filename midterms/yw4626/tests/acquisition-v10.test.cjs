'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js'),W=require('../dist/wild-v10.js');
const place=(r,k)=>{[r.dungeon.x,r.dungeon.y]=k.split(',').map(Number);};
const reload=r=>{const save=r.snapshot(),next=Run.restore(save);assert.deepEqual(next.snapshot(),save);return next;};
test('shipped shared pickup pool has all eight exact weights, separate from rounded editor percentages',()=>{
 const expected=[['bagOfCoins',10],['coinPurse',5],['largeBagOfCoins',5],['cloverPetal',5],['littleClover',30],['orologion',10],['rosary',5],['vacuum',5]],p=W.pickupPools.find(p=>p.gameObject==='DestructibleCardCanvas');assert.deepEqual(p.entries.map(e=>[e.key,e.weight]),expected);assert.equal(p.entries.reduce((n,e)=>n+e.weight,0),75);
 const r=new Run({combatVersion:10,exploration:false});assert.deepEqual(r.wildLootPool().map(e=>[e.key,e.weight]),expected);const allowed=new Set(expected.map(e=>e[0]));for(let i=0;i<100;i++)assert.ok(allowed.has(r.rollWild('sample-'+i)));
});
test('W coin event synchronizes once into Run gold, including save before and after sync',()=>{
 let r=new Run({combatVersion:10,exploration:false});const card=r.makeCard('bagOfCoins');r.deck.push(card);assert.ok(r.enter(r.available()[0].id).ok);let b=r.battle;const all=Object.values(b.piles).flat(),c=all.find(c=>c.id===card.id);for(const pile of Object.values(b.piles)){const i=pile.findIndex(x=>x.id===c.id);if(i>=0)pile.splice(i,1);}b.piles.hand.push(c);b.settings.handLimit=20;b.combo=2;b.previousWild=true;b.player.greed=20;const gold=r.gold,earned=r.stats.goldEarned;
 assert.ok(b.play(c.id).ok);assert.equal(b.events.filter(e=>e.type==='coins_gain').at(-1).amount,90);assert.equal(r.gold,gold);r=reload(r);r.syncExperience();assert.equal(r.gold,gold+90);assert.equal(r.stats.goldEarned,earned+90);r=reload(r);const before=r.snapshot();r.syncExperience();r.syncExperience();assert.deepEqual(r.snapshot(),before);
});
test('ground W pickup adds one deck card without immediate Luck or coins and cannot repeat after reload',()=>{
 let r=new Run({seed:'W-GROUND',combatVersion:10});const [k,o]=Object.entries(r.dungeon.objects).find(([,o])=>o.id.startsWith('wild-ground'));assert.equal(o.type,'pickup');assert.equal(o.reward.kind,'card');const n=r.deck.length,gold=r.gold,luck=r.combatSettings().luck,expected=o.reward.key;place(r,k);assert.ok(r.useObject(r.dungeon.x,r.dungeon.y).ok);assert.equal(r.deck.length,n+1);assert.equal(r.deck.at(-1).key,expected);assert.equal(r.gold,gold);assert.equal(r.combatSettings().luck,luck);assert.equal(r.battle,null);r=reload(r);assert.equal(r.useObject(r.dungeon.x,r.dungeon.y).ok,false);assert.equal(r.deck.length,n+1);const before=r.snapshot();r.populateWildLoot();assert.deepEqual(r.snapshot(),before);
});
test('gargoyles break then reveal and pay once; neither pickups nor statues occupy corridors or reserved clear tiles',()=>{
 const results=new Set();
 for(let seed=0;seed<40;seed++){
  let r=new Run({seed:'GARGOYLE-'+seed,combatVersion:10}),d=r.dungeon;const blocked=new Set([...d.generation.corridorCells,...d.generation.zones.flatMap(z=>z.clearCells)].map(p=>D.key(p.x,p.y)));
  const wild=Object.entries(d.objects).filter(([,o])=>o.id.startsWith('wild-'));assert.equal(wild.length,2);for(const[k]of wild){assert.ok(!blocked.has(k));assert.equal(d.rooms[k],undefined);assert.notEqual(k,D.key(d.x,d.y));}
  const [k,obj]=wild.find(([,o])=>o.type==='gargoyle');results.add(obj.reward.kind);const n=r.deck.length,gold=r.gold,luck=r.combatSettings().luck,reward=structuredClone(obj.reward);place(r,k);
  assert.ok(r.useObject(d.x,d.y).ok);assert.equal(obj.type,'pickup');assert.equal(obj.active,true);assert.equal(obj.containerBroken,true);assert.equal(r.deck.length,n);assert.equal(r.gold,gold);r=reload(r);assert.ok(r.useObject(r.dungeon.x,r.dungeon.y).ok);assert.equal(r.dungeon.objects[k].active,false);assert.equal(r.combatSettings().luck,luck);
  if(reward.kind==='card'){assert.equal(r.deck.length,n+1);assert.equal(r.deck.at(-1).key,reward.key);assert.equal(r.gold,gold);}else{assert.equal(r.deck.length,n);assert.equal(r.gold,gold+reward.amount);}
  r=reload(r);const before=r.snapshot();assert.equal(r.useObject(r.dungeon.x,r.dungeon.y).ok,false);r.populateWildLoot();assert.deepEqual(r.snapshot(),before);
 }
 assert.deepEqual([...results].sort(),['card','gold']);
});
