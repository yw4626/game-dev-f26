'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),E=require('../dist/engine.js');
function setup(){
 const r=new Run({seed:'TOMATO-DEV',exploration:false,profile:'demo',character:'antonio'});
 r.health=20;r.deck=[r.deck.find(c=>E.definition(c).kind==='character'),...['pummarola0','pummarola','pummarola2','knife'].map(k=>r.makeCard(k))];
 assert.ok(r.enter(r.available()[0].id).ok);r.battle.player.mana=20;return r;
}
function playKey(r,key){const c=r.battle.piles.hand.find(c=>c.key===key);assert.ok(c,key);assert.ok(r.battle.play(c.id).ok);}
function finish(r){
 r.battle.player.amount=30;r.battle.player.might=100000;playKey(r,'knife');assert.equal(r.battle.phase,'victory');
 r.settleBattle();while(r.phase==='levelup'){assert.ok(r.chooseLevelCard(0).ok);r.settleBattle();}r.settleBattle();
}
test('all three tomato cards actually stack 1+2+6 recovery, survive reload, and heal 20 to 29 once on victory',()=>{
 let r=setup();for(const key of ['pummarola0','pummarola','pummarola2'])playKey(r,key);
 assert.equal(r.battle.player.recovery,9);assert.equal(r.battle.player.health,20,'not an immediate heal');
 r=Run.restore(r.snapshot());assert.equal(r.battle.player.recovery,9);finish(r);
 assert.equal(r.health,29);assert.equal(r.battle.player.health,29);const events=r.history.filter(e=>e.type==='recovery');assert.equal(events.length,1);assert.deepEqual([events[0].before,events[0].after,events[0].amount],[20,29,9]);
 assert.equal(Run.restore(r.snapshot()).settleBattle(),false);
 const next=r.available().find(n=>n.type==='battle');assert.ok(next);assert.ok(r.enter(next.id).ok);assert.equal(r.battle.player.recovery,0);
});
test('tomato heal caps at missing HP and never pays out on defeat',()=>{
 const r=setup();playKey(r,'pummarola2');r.battle.player.health=r.battle.player.maxHealth-1;finish(r);assert.equal(r.health,r.maxHealth);assert.equal(r.history.find(e=>e.type==='recovery').amount,1);
 const loss=setup();playKey(loss,'pummarola');loss.battle.player.health=0;loss.battle.phase='defeat';loss.settleBattle();assert.equal(loss.health,0);assert.equal(loss.history.some(e=>e.type==='recovery'),false);
});
test('tomato card description and combo text disclose the delayed trigger in both languages',()=>{
 const d=E.definition({key:'pummarola'});assert.deepEqual(E.effectsV10.descriptions(d,3),['战后回血 +3']);
 assert.deepEqual(E.effectsV10.descriptions(d,3,true),['Victory heal +3']);
});
