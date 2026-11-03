'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),{Battle,gems}=require('../dist/engine.js');
function station(version=13){const r=new Run({character:'imelda',exploration:false,combatVersion:version});r.current=r.maps[0].find(n=>n.type==='boss').id;r.completed.push(r.current);r.phase='gate';r.deck.push(r.makeCard('tome'));return r;}
test('full and zero socket weapons fuse, preserving all weapon slots and gems without an evolve gem',()=>{
 for(const slots of [0,1,2]){const r=station(),w=r.deck.find(c=>c.key==='wand');w.gemSlots=slots;w.gems=['double','armor'].slice(0,slots);
 const expected=[...w.gems];assert.ok(r.openEvolution());const choice=r.evolution.choices.find(c=>c.weaponId===w.id);assert.ok(choice);
 const result=r.fuse(choice.id);assert.ok(result.ok,result.reason);assert.equal(result.card.gemSlots,slots);assert.deepEqual(result.card.gems,expected);assert.equal(result.card.evolved,true);assert.ok(gems.validate(result.card).ok);
 assert.deepEqual(Run.restore(r.snapshot()).snapshot(),r.snapshot());assert.doesNotThrow(()=>new Battle({deck:r.deck}));
 }
});
test('evolution reserves no extra socket and reward recipe hints accept a full weapon',()=>{
 const r=station(),w=r.deck.find(c=>c.key==='wand');w.gemSlots=2;w.gems=['double'];
 const hint=r.rewardEvolutionHints({key:'tome'}).find(h=>h.recipeId==='holyWand');assert.equal(hint.status,'ready');
 r.openEvolution();const c=r.fuse(r.evolution.choices.find(x=>x.weaponId===w.id).id).card;assert.ok(gems.canInsert(c,'armor').ok);c.gems.push('armor');assert.ok(gems.validate(c).ok);assert.equal(gems.canInsert(c,'draw').ok,false);
 const full=station();for(const c of full.deck.filter(c=>c.key==='wand'))c.gems=['double'];assert.equal(full.rewardEvolutionHints({key:'tome'}).find(h=>h.recipeId==='holyWand').status,'ready');
});
test('legacy evolved deck and battle cards migrate once without losing gems, health, or identities',()=>{
 let r=station(12);r.openEvolution();const c=r.fuse(0).card;assert.deepEqual(c.gems,['evolve']);
 r.battle=new Battle({deck:r.deck});const hp=r.battle.player.health,ids=r.deck.map(c=>c.id);assert.equal(r.enableGemV14(),true);assert.equal(r.enableGemV14(),false);
 assert.deepEqual(r.deck.map(c=>c.id),ids);assert.equal(r.battle.player.health,hp);assert.deepEqual(r.deck.find(x=>x.id===c.id).gems,[]);
 const battleCard=Object.values(r.battle.piles).flat().find(x=>x.id===c.id);assert.ok(battleCard.evolved);assert.equal(gems.canInsert(battleCard,'armor').ok,true);
 r=Run.restore(r.snapshot());assert.ok(r.deck.find(x=>x.id===c.id).evolved);assert.doesNotThrow(()=>Battle.restore(r.battle.snapshot()));
});
test('new evolution marker validates ownership and rejects stale occupying gems or forged recipes',()=>{
 const r=station();r.openEvolution();const c=r.fuse(0).card;
 assert.equal(gems.validate({...c,evolved:false}).ok,false);assert.equal(gems.validate({...c,gems:['evolve']}).ok,false);
 const save=r.snapshot();save.data.deck.at(-1).baseKey='whip';assert.throws(()=>Run.restore(save));
});
