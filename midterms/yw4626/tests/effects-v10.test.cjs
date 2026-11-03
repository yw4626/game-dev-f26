'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,cost}=require('../dist/engine.js'),Fx=require('../dist/effects-v10.js');
function fixture(keys,{wildStrength=true,enemies}={}){
 const deck=[...keys,...Array(14).fill('armor')].map((key,i)=>({id:i+1,key,level:0,gems:[],free:false,modifiers:[0,0,0,0]}));
 const targets=enemies||[{key:'ghost',name:'fixture',health:100000,slot:{row:0,column:0},intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}];
 const b=new Battle({seed:'EFFECTS10',deck,enemies:targets,settings:{attackRulesVersion:10,wildStrength,dealCount:0,handLimit:30,startingMana:30}}),all=b.piles.draw;
 b.piles.hand=keys.map((_,i)=>all.find(c=>c.id===i+1));b.piles.draw=all.filter(c=>c.id>keys.length);b.combo=2;b.previousWild=true;return b;
}
test('WildStrength multiplies Clover Petal at combo3 to luck15 and draw3; disabled keeps5 and1',()=>{
 for(const on of [true,false]){let b=fixture(['cloverPetal'],{wildStrength:on});const luck=b.player.luck,draw=b.piles.draw.length;assert.equal(b.cardPreview(b.piles.hand[0]).multiplier,3);assert.equal(b.cardPreview(b.piles.hand[0]).effectMultiplier,on?3:1);assert.ok(b.play(1).ok);assert.equal(b.player.luck-luck,on?15:5);assert.equal(draw-b.piles.draw.length,on?3:1);assert.equal(b.combo,3);b=Battle.restore(b.snapshot());assert.equal(b.player.luck-luck,on?15:5);}
});
test('Wings reduces each current hand card once, does not stack at high combo, excludes later draws, clears on that card play',()=>{
 const b=fixture(['wings','wings','fire']),fire=b.piles.hand[2],original=cost(fire,b.player.mana);assert.ok(b.play(1).ok);assert.equal(fire.wingDiscount,1);assert.equal(cost(fire,b.player.mana),original-1);assert.ok(b.play(2).ok);assert.equal(fire.wingDiscount,1);assert.equal(cost(fire,b.player.mana),original-1);
 b.draw(1);const fresh=b.piles.hand.find(c=>c.id>3);assert.ok(fresh);assert.equal(fresh.wingDiscount,undefined);const saved=Battle.restore(b.snapshot());assert.equal(saved.piles.hand.find(c=>c.id===3).wingDiscount,1);
 assert.ok(b.play(3).ok);assert.equal(fire.wingDiscount,undefined);assert.equal(cost(fire,b.player.mana),original);assert.equal(b.events.filter(e=>e.type==='wings').length,2);
});
for(const [key,stat,base]of [['clover','luck',10],['crown','growth',15],['hollowHeart','maxHealth',3],['hollowHeart2','maxHealth',1],['pummarola','recovery',1],['candelabrador','area',5],['spellbinder','duration',2]])test(`${key} applies exact ${stat} amount with its combo multiplier`,()=>{
 for(const chain of [1,3]){const b=fixture([key],{wildStrength:false});b.combo=chain-1;b.previousWild=chain>1;b.previousCost=null;b.player.health=20;const before=b.player[stat]||0,mana=b.player.mana;
 assert.equal(catalog.cards[key].receivesComboMultiplier,true);assert.equal(b.cardPreview(b.piles.hand[0]).effectMultiplier,chain);assert.ok(b.play(1).ok);assert.equal(b.player[stat]-before,base*chain);assert.equal(b.player.mana,mana-catalog.cards[key].cost);assert.equal(b.player.health,20,'stat change must not create an immediate heal');assert.deepEqual(Battle.restore(b.snapshot()).snapshot(),b.snapshot());}
});
function rows(){return [{row:0,column:0},{row:0,column:2},{row:0,column:4},{row:1,column:0},{row:1,column:2}].map((slot,i)=>({key:'ghost',name:'front/rear '+i,health:100000,slot,disarmResistance:0,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'armor',value:4}]}]}));}
for(const [key,count]of [['garlic',1],['soulEater',2]])test(`${key} RemoveIntent clears only ${count} front enemies even when removeAllIntents=true and combo3`,()=>{
 const b=fixture([key],{enemies:rows()}),raw=catalog.cards[key].effectDescriptors.find(e=>e.sourceType==='RemoveIntentEffect').raw;assert.equal(raw._count,count);assert.equal(raw._removeAllIntents,true);const before=b.snapshot(),copy=Battle.restore(before);assert.ok(b.play(1).ok);assert.ok(copy.play(1).ok);assert.deepEqual(b.snapshot(),copy.snapshot());const cleared=b.enemies.filter(e=>!e.intent);assert.equal(cleared.length,count);assert.ok(cleared.every(e=>e.slot.row===0));assert.ok(b.enemies.filter(e=>e.slot.row===1).every(e=>e.intent));assert.equal(b.events.filter(e=>e.type==='disarm').length,count);
});
test('RemoveIntent false selects attack intents only and never touches protected rear enemies',()=>{
 const b=fixture(['garlic'],{enemies:rows()});b.enemies[1].intent={actions:[{kind:'attack',value:5}]};b.enemies[3].intent={actions:[{kind:'attack',value:5}]};
 Fx.afterAttack(b,b.piles.hand[0],{receivesComboMultiplier:true,effectDescriptors:[{sourceType:'RemoveIntentEffect',raw:{_count:2,_removeAllIntents:false}}]},5,b.player);
 assert.equal(b.enemies[1].intent,null);assert.ok(b.enemies[0].intent);assert.ok(b.enemies[2].intent);assert.ok(b.enemies[3].intent);assert.equal(b.events.filter(e=>e.type==='disarm').length,1);
});
