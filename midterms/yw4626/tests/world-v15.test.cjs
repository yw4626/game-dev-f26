'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js'),E=require('../dist/engine.js');
// A fixture's approach tile has already been cleared on the way to its destination.
function approach(r,key){const [x,y]=key.split(',').map(Number),dir=D.dirs.findIndex(v=>D.canTraverse(r.dungeon,x-v.x,y-v.y,x,y));assert.ok(dir>=0);const v=D.dirs[dir];delete r.dungeon.objects[D.key(x-v.x,y-v.y)];r.dungeon.x=x-v.x;r.dungeon.y=y-v.y;r.dungeon.dir=dir;r.phase='map';}
function shop(r){const node=r.maps[0].find(n=>n.type==='shop');r.current=node.id;r.phase='shop';r.shop=r.makeShop(node);r.gold=500;}
test('socket upgrades cost 100, allow exactly two per base card, share across copies and future floors',()=>{
 let r=new Run({worldRulesVersion:15});shop(r);const c=r.deck.find(c=>c.key==='whip');c.gems=['double'];assert.ok(r.addGemSlot(c.id).ok);assert.equal(r.gold,400);assert.ok(r.addGemSlot(c.id).ok);assert.equal(r.gold,300);assert.equal(c.gemSlots,3);assert.deepEqual(c.gems,['double']);
 const before=r.snapshot();assert.equal(r.addGemSlot(c.id).ok,false);assert.deepEqual(r.snapshot(),before);assert.equal(r.makeCard('whip').gemSlots,3);
 r=Run.restore(r.snapshot());assert.equal(r.slotExpansionInfo(c.id).used,2);assert.ok(r.deck.filter(x=>x.key==='whip').every(x=>x.gemSlots===3));assert.doesNotThrow(()=>new E.Battle({deck:r.deck}));
});
test('insufficient gold leaves upgrades unchanged and migration counts past upgrades',()=>{
 const r=new Run({worldRulesVersion:15});shop(r);r.gold=99;const before=r.snapshot();assert.equal(r.addGemSlot(r.deck.find(c=>c.key==='whip').id).ok,false);assert.deepEqual(r.snapshot(),before);
 const old=new Run({worldRulesVersion:14});shop(old);const c=old.deck.find(c=>c.key==='whip');assert.ok(old.addGemSlot(c.id).ok);const slots=c.gemSlots;assert.ok(old.enableWorldV15());assert.equal(c.gemSlots,slots);assert.equal(old.slotExpansionInfo(c.id).used,1);assert.ok(old.addGemSlot(c.id).ok);assert.equal(old.addGemSlot(c.id).ok,false);
});
test('bumping a treasure collects exactly 100 once without any health change or selection screen',()=>{
 const r=new Run({worldRulesVersion:15}),[key,room]=Object.entries(r.dungeon.rooms).find(([,x])=>x.type==='treasure');r.health-=10;const gold=r.gold,hp=r.health,max=r.maxHealth;approach(r,key);
 const result=r.walk('forward');assert.ok(result.ok);assert.equal(result.goldGain,100);assert.equal(r.phase,'map');assert.equal(r.gold,gold+100);assert.equal(r.health,hp);assert.equal(r.maxHealth,max);assert.ok(r.completed.includes(room.id));
 approach(r,key);r.walk('forward');assert.equal(r.gold,gold+100);assert.equal(r.openTreasure('vitality').ok,false);
});
test('every floor has exactly one reachable removal event, seeded placement varies and reloads never duplicate',()=>{
 const locations=new Set();for(let i=0;i<12;i++){let r=new Run({seed:'ALTAR-'+i,worldRulesVersion:15});for(let floor=1;floor<=5;floor++){
  if(floor>1){r.floor=floor;r.dungeon=D.build(r.seed,floor,r.maps[floor-1]);r.populateGems();r.populateGrowth();r.populateWildLoot();r.populateRemoval();}
  const d=r.dungeon;assert.equal(Object.values(d.objects).filter(x=>x.type==='removal').length,1);const key=d.removalEvent.key;locations.add(key);assert.ok(!d.rooms[key]);
  const seen=new Set([D.key(d.x,d.y)]),q=[[d.x,d.y]];for(let j=0;j<q.length;j++)for(const v of D.dirs){const [x,y]=q[j],k=D.key(x+v.x,y+v.y);if(!seen.has(k)&&D.canTraverse(d,x,y,x+v.x,y+v.y)){seen.add(k);q.push([x+v.x,y+v.y]);}}assert.ok(seen.has(key));
  const before=JSON.stringify(d.removalEvent);r.populateRemoval();assert.equal(JSON.stringify(d.removalEvent),before);r=Run.restore(r.snapshot());assert.equal(r.dungeon.removalEvent.key,key);
 }}assert.ok(locations.size>6);
});
test('removal event is free and once per floor; cancel and reload keep chance; merchant cannot remove cards',()=>{
 let r=new Run({worldRulesVersion:15});const key=r.dungeon.removalEvent.key,gold=r.gold;approach(r,key);r.walk('forward');assert.equal(r.phase,'removal');assert.equal(r.removeCard(r.deck.find(c=>E.definition(c).kind==='character').id).ok,false);assert.ok(r.cancelRemoval());
 approach(r,key);r.walk('forward');r=Run.restore(r.snapshot());const id=r.deck.find(c=>E.definition(c).kind!=='character').id;assert.ok(r.removeCard(id).ok);assert.equal(r.gold,gold);assert.equal(r.deck.length,4);assert.ok(r.dungeon.removalEvent.used);assert.equal(r.dungeon.objects[key].active,false);
 approach(r,key);r.walk('forward');assert.equal(r.phase,'map');shop(r);assert.equal(r.removeCard(r.deck[1].id).ok,false);
});
test('bumping gem chests opens them; cancellation does not trap player or block exit',()=>{
 const r=new Run({worldRulesVersion:15}),[key]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='gemchest');approach(r,key);const before=[r.dungeon.x,r.dungeon.y];assert.ok(r.walk('forward').ok);assert.equal(r.phase,'gem');assert.equal(D.key(r.dungeon.x,r.dungeon.y),key);assert.ok(r.cancelGem());assert.ok(r.walk('back').ok);assert.deepEqual([r.dungeon.x,r.dungeon.y],before);
});
test('bumping breakables and pickups needs no interaction key',()=>{
 const r=new Run({worldRulesVersion:15}),[key]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='manaCart');approach(r,key);const mana=r.combatSettings().startingMana;
 assert.ok(r.walk('forward').ok);assert.equal(r.dungeon.objects[key].type,'pickup');assert.ok(r.walk('forward').ok);assert.equal(r.combatSettings().startingMana,mana+1);assert.equal(D.objectAt(r.dungeon,...key.split(',').map(Number)),null);
});
test('forward from cleared garden guardian enters mansion without digging and creates next floor event',()=>{
 const r=new Run({worldRulesVersion:15}),key=r.dungeon.exit.key,[x,y]=key.split(',').map(Number),boss=r.maps[0].find(n=>n.type==='boss');r.completed.push(boss.id);D.refreshExit(r.dungeon,r.completed);r.dungeon.x=x;r.dungeon.y=y;
 const gold=r.gold,hp=r.health;assert.equal(D.objectAt(r.dungeon).type,'mansionDoor');assert.ok(r.walk('forward').ok);assert.equal(r.floor,2);assert.equal(r.phase,'map');assert.equal(r.gold,gold);assert.equal(r.health,hp);assert.ok(r.dungeon.removalEvent);assert.equal(r.dungeon.removalEvent.used,false);
});
test('standing shop can be re-entered by moving out and back without resetting inventory',()=>{
 const r=new Run({worldRulesVersion:15}),[key]=Object.entries(r.dungeon.rooms).find(([,room])=>room.type==='shop');approach(r,key);r.walk('forward');assert.equal(r.phase,'shop');const stock=JSON.stringify(r.shop);r.leave();r.walk('back');r.walk('forward');assert.equal(r.phase,'shop');assert.equal(JSON.stringify(r.shop),stock);
});
test('legacy treasure selection migrates to one 100-gold collection without life reward',()=>{
 const r=new Run({worldRulesVersion:14}),[key,room]=Object.entries(r.dungeon.rooms).find(([,n])=>n.type==='treasure');[r.dungeon.x,r.dungeon.y]=key.split(',').map(Number);r.enter(room.id);assert.equal(r.phase,'treasure');const gold=r.gold,hp=r.health,max=r.maxHealth;r.enableWorldV15();assert.equal(r.gold,gold+100);assert.equal(r.health,hp);assert.equal(r.maxHealth,max);assert.equal(r.phase,'map');r.enableWorldV15();assert.equal(r.gold,gold+100);
});
