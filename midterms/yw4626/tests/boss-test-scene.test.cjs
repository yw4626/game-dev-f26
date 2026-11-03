'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{create}=require('../dist/boss-test.js');
test('ritual fixture starts before summoning and one real card summons four echoes',()=>{
 const r=create('ritual'),b=r.battle;
 assert.equal(r.floor,5);assert.equal(b.bossState.ritualUsed,false);assert.equal(b.enemies.length,1);
 assert.equal(b.play(b.piles.hand.find(c=>c.key==='whip').id).ok,true);
 assert.equal(b.enemies.filter(e=>e.bloodEcho).length,4);
 assert.ok(b.events.some(e=>e.type==='boss_fx'&&e.fx==='ritual'));
});
test('bleed fixture uses the real vampire attack and end-turn tick',()=>{
 const b=create('bleed').battle;b.endTurn();assert.equal(b.player.health,172);assert.equal(b.bossState.bleed,2);
 b.endTurn();assert.equal(b.player.health,142);assert.equal(b.bossState.bleed,3);
 const heart=b.piles.hand.find(c=>c.key==='littleHeart');b.play(heart.id);assert.equal(b.bossState.bleed,2);
});
test('finale fixture reaches real victory and does not require a level-up choice',()=>{
 const r=create('finale'),b=r.battle;b.play(b.piles.hand.find(c=>c.key==='whip').id);
 assert.equal(b.phase,'victory');assert.equal(r.settleBattle(),true);assert.equal(r.phase,'won');
});
