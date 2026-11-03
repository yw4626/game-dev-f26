'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{Run}=require('../dist/run'),D=require('../dist/dungeon');
function approach(r,key){const [x,y]=key.split(',').map(Number),i=D.dirs.findIndex(v=>D.canTraverse(r.dungeon,x-v.x,y-v.y,x,y));assert.ok(i>=0);const v=D.dirs[i];r.dungeon.x=x-v.x;r.dungeon.y=y-v.y;r.dungeon.dir=i;delete r.dungeon.objects[D.key(r.dungeon.x,r.dungeon.y)];const previous=D.roomAt(r.dungeon);if(previous&&!r.completed.includes(previous.id))r.completed.push(previous.id);r.phase='map';}
function chest(r){return Object.entries(r.dungeon.rooms).find(([,n])=>n.type==='treasure');}
test('chest opens without movement or payment, then next step collects exactly 100 and clears object',()=>{
 const r=new Run(),[key,room]=chest(r);approach(r,key);r.health-=10;const before={x:r.dungeon.x,y:r.dungeon.y,gold:r.gold,hp:r.health,max:r.maxHealth,rooms:r.stats.rooms};
 const opened=r.walk('forward');assert.equal(opened.feedback.kind,'open');assert.equal(r.gold,before.gold);assert.equal(r.health,before.hp);assert.equal(r.dungeon.x,before.x);assert.equal(r.dungeon.y,before.y);assert.ok(!r.completed.includes(room.id));assert.deepEqual(r.dungeon.objects[key].reward,{kind:'gold',amount:100});
 const collected=r.walk('forward');assert.equal(collected.feedback.kind,'collect');assert.equal(collected.goldGain,100);assert.equal(collected.stationary,false);assert.equal(D.key(r.dungeon.x,r.dungeon.y),key);assert.equal(r.gold,before.gold+100);assert.equal(r.health,before.hp);assert.equal(r.maxHealth,before.max);assert.equal(r.stats.rooms,before.rooms+1);assert.ok(r.completed.includes(room.id));assert.equal(D.objectAt(r.dungeon),null);
 approach(r,key);r.walk('forward');assert.equal(r.gold,before.gold+100);assert.equal(D.objectAt(r.dungeon),null);
});
test('opened chest persists through reload and can be left and revisited without respawning',()=>{
 let r=new Run();const [key]=chest(r);approach(r,key);const gold=r.gold;r.walk('forward');r=Run.restore(r.snapshot());assert.equal(r.gold,gold);assert.ok(r.dungeon.objects[key].openedChest);r.turn(1);r.turn(-1);approach(r,key);r.walk('forward');assert.equal(r.gold,gold+100);r=Run.restore(r.snapshot());approach(r,key);r.walk('forward');assert.equal(r.gold,gold+100);
});
test('container destruction and collection return separate feedback and only collection moves',()=>{
 for(const type of ['crate','barrel','gargoyle','manaCart','bracerCart']){
  const r=new Run(),[key]=Object.entries(r.dungeon.objects).find(([,o])=>o.type===type)||Object.entries(r.dungeon.objects).find(([,o])=>o.type==='crate');r.dungeon.objects[key].type=type;r.dungeon.objects[key].reward={kind:type==='manaCart'?'mana':type==='bracerCart'?'deal':'gold',amount:type.includes('Cart')?1:17};approach(r,key);const before=[r.dungeon.x,r.dungeon.y],gold=r.gold;
  const broken=r.walk('forward');assert.equal(broken.feedback.kind,'break');assert.equal(broken.feedback.source,type);assert.deepEqual([r.dungeon.x,r.dungeon.y],before);assert.equal(r.gold,gold);assert.equal(r.dungeon.objects[key].type,'pickup');
  const collected=r.walk('forward');assert.equal(collected.feedback.kind,'collect');assert.equal(collected.stationary,false);assert.equal(D.key(r.dungeon.x,r.dungeon.y),key);assert.equal(D.objectAt(r.dungeon),null);if(!type.includes('Cart'))assert.equal(r.gold,gold+17);
 }
});
test('full deck rejects Wild pickup without moving or consuming it',()=>{
 const r=new Run(),[key]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='pickup'&&o.reward?.kind==='card');approach(r,key);while(r.deck.length<100)r.deck.push(r.makeCard('whip'));const before=r.snapshot();assert.equal(r.walk('forward').ok,false);assert.deepEqual(r.snapshot(),before);
});
test('legacy unclaimed chest migrates to pending coins, while previously collected chest never respawns',()=>{
 const old=new Run({worldRulesVersion:14}),[key,room]=chest(old);[old.dungeon.x,old.dungeon.y]=key.split(',').map(Number);old.enter(room.id);const gold=old.gold;assert.equal(old.phase,'treasure');old.enableWorldV16();assert.equal(old.phase,'map');assert.equal(old.gold,gold);assert.ok(old.dungeon.objects[key].openedChest);old.walk('forward');assert.equal(old.gold,gold+100);
 const paid=new Run({worldRulesVersion:15}),[paidKey]=chest(paid);approach(paid,paidKey);paid.walk('forward');const paidGold=paid.gold;paid.enableWorldV16();approach(paid,paidKey);paid.walk('forward');assert.equal(paid.gold,paidGold);assert.equal(D.objectAt(paid.dungeon),null);
});
test('XP visual amount uses authoritative growth/curse formula and survives reload without duplicate award',()=>{
 let r=new Run({exploration:false});r.enter(r.available()[0].id);const b=r.battle,enemy=b.enemies[0];enemy.health=0;enemy.xpOverride=3;b.player.growth=20;b.player.curse=10;b.log('kill','test',{enemyId:enemy.id});const event=b.events.at(-1),expected=Math.ceil(3*1.2*1.1);assert.equal(r.experienceGain(event),expected);assert.equal(r.experienceGain({type:'experience_gain',amount:7}),7);
 r=Run.restore(r.snapshot());r.syncExperience();assert.equal(r.xp,expected);const before=r.snapshot();r.syncExperience();assert.deepEqual(r.snapshot(),before);
});
