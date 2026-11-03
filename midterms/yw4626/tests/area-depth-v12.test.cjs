'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine.js');
function fixture(key='garlic'){
 const enemies=Array.from({length:15},(_,i)=>({key:'ghost',name:'Enemy '+i,health:1000,slot:{row:Math.floor(i/5),column:i%5},intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'attack',value:2}]}]}));
 return new E.Battle({seed:'AREA12',deck:[{id:1,key,gems:[]}],enemies,settings:{attackRulesVersion:12,startingMana:100,dealCount:1,handLimit:20,rearSplashRatio:.2}});
}
const loss=b=>b.enemies.map(e=>1000-e.health);
test('one range wave deals full damage to every front and 20% only once to each rear',()=>{
 const b=fixture(),card=b.piles.hand[0];b.resolveAreaAttack(card,E.definition(card),{damage:10,hits:1});
 assert.deepEqual(loss(b),[...Array(5).fill(10),...Array(10).fill(2)]);
 assert.equal(b.events.filter(e=>e.type==='enemy_damage'&&!e.splash).length,5);
 assert.equal(b.events.filter(e=>e.rearSplash).length,10);
});
test('front death promotes reserves but does not expose them to full damage in the same range wave',()=>{
 const b=fixture(),card=b.piles.hand[0];b.enemies.slice(0,5).forEach(e=>e.health=1);b.resolveAreaAttack(card,E.definition(card),{damage:10,hits:1});
 assert.ok(b.enemies.slice(0,5).every(e=>e.health===0));assert.ok(b.enemies.slice(5).every(e=>e.health===998));
 assert.ok(b.enemies.slice(5,10).every(e=>e.slot.row===0));assert.ok(b.enemies.slice(10).every(e=>e.slot.row===1));
 assert.equal(b.events.filter(e=>e.type==='enemy_damage'&&e.enemyId>5&&!e.splash).length,0);
});
test('the next distinct range wave can fully hit the newly promoted front',()=>{
 const b=fixture(),card=b.piles.hand[0];b.enemies.slice(0,5).forEach(e=>e.health=1);b.resolveAreaAttack(card,E.definition(card),{damage:10,hits:2});
 assert.ok(b.enemies.slice(5,10).every(e=>e.health===988));assert.ok(b.enemies.slice(10).every(e=>e.health===996));
});
test('Area scales rear splash but not full front damage; armor applies independently',()=>{
 const b=fixture(),card=b.piles.hand[0];b.player.area=100;b.enemies[0].armor=3;b.enemies[5].armor=3;
 b.resolveAreaAttack(card,E.definition(card),{damage:10,hits:1});
 assert.equal(b.enemies[0].health,993);assert.equal(b.enemies[1].health,990);assert.equal(b.enemies[5].health,999);assert.equal(b.enemies[6].health,996);
});
test('rear splash does not crit, double for freeze, consume freeze, or trigger critical healing',()=>{
 const b=fixture('bloodyTear'),card=b.piles.hand[0],def={...E.definition(card),critChance:1};
 b.player.health=10;b.enemies.forEach(e=>e.freezeStacks=1);b.resolveAreaAttack(card,def,{damage:5,hits:1});
 assert.ok(b.enemies.slice(0,5).every(e=>e.health===980&&e.freezeStacks===0));
 assert.ok(b.enemies.slice(5).every(e=>e.health===999&&e.freezeStacks===1));assert.equal(b.player.health,12);assert.equal(b.events.filter(e=>e.type==='heal').length,1);
});
for(const key of ['bible','unholyVespers'])test(`${key} uses area waves in v12 and exposes matching front/rear numbers`,()=>{
 const b=fixture(key),card=b.piles.hand[0],d=E.definition(card),p=b.cardPreview(card);
 assert.equal(p.areaAttack,true);assert.equal(p.targetCount,5);assert.equal(p.rearSplashDamage,d.baseDamage*.2);
 b.play(1);for(const e of b.enemies.slice(0,5))assert.ok(Math.abs(e.health-(1000-d.baseDamage*d.baseAmount))<1e-6);
 for(const e of b.enemies.slice(5))assert.ok(Math.abs(e.health-(1000-d.baseDamage*.2*d.baseAmount))<1e-6);
 const legacy=fixture(key);legacy.settings.attackRulesVersion=10;assert.equal(legacy.cardPreview(legacy.piles.hand[0]).areaAttack,false);
});
test('direct projectiles keep main target rules; Area bonus splashes reserves rather than repeating full hits',()=>{
 const b=fixture('wand'),card=b.piles.hand[0];b.player.area=100;b.play(1);
 const main=b.events.filter(e=>e.type==='enemy_damage'&&!e.splash);assert.equal(main.length,1);
 assert.ok(b.enemies.slice(0,5).filter(e=>e.health<1000).length===1);assert.ok(b.enemies.slice(5).every(e=>e.health===994));
});
test('range + reserves + armor is deterministic across save/load and victory waits for splash survivors',()=>{
 const b=fixture(),copy=E.Battle.restore(b.snapshot());b.play(1);copy.play(1);assert.deepEqual(copy.snapshot(),b.snapshot());assert.equal(b.phase,'player');
 assert.equal(new Set(b.events.filter(e=>e.type==='kill').map(e=>e.enemyId)).size,b.events.filter(e=>e.type==='kill').length);
});
test('fractional splash cannot leave visually alive epsilon ghosts or lose kill statistics',()=>{
 const b=fixture(),target=b.enemies[0];target.health=1.4;
 for(let i=0;i<7;i++)b.applyDamage({id:1},target,.2,{splash:true,rearSplash:true});
 assert.equal(target.health,0);assert.equal(b.events.filter(e=>e.type==='kill'&&e.enemyId===target.id).length,1);
 assert.equal(b.enemies.filter(e=>e.health<=0).length,1);assert.equal(b.living().length,14);
});
