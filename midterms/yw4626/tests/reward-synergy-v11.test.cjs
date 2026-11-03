'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js');
const {catalog,evolutionRecipes,gems}=require('../dist/engine.js');
function run(keys=[]){const r=new Run({seed:'REWARD-SYNERGY-V11',combatVersion:10,exploration:false,profile:'demo'});r.deck=keys.map(k=>r.makeCard(k));return r;}
function hint(r,key,recipe){return r.rewardEvolutionHints({key}).find(h=>h.recipeId===recipe);}

test('reward preview is pure and identifies the exact offered ingredient in a complete recipe',()=>{
 const r=run(['wand']),before=r.snapshot(),offer=Object.freeze({key:'tome',level:0}),h=hint(r,offer.key,'holyWand');
 assert.equal(h.status,'ready');assert.equal(h.resultKey,'holyWand');assert.equal(h.missingCards.length,0);assert.equal(h.slotIssue,null);
 assert.deepEqual(h.components.map(c=>[c.key,c.isOffer,c.missing]),[['wand',false,false],['tome',true,false]]);
 assert.equal(h.weaponId,r.deck[0].id);assert.equal(h.gemSlots,1);assert.equal(h.resultEnglish,'Holy Wand');
 assert.deepEqual(r.rewardEvolutionHints(offer),r.rewardEvolutionHints(offer));assert.deepEqual(r.snapshot(),before);
 assert.doesNotThrow(()=>JSON.stringify(r.rewardEvolutionHints(offer)));
});

test('an existing unrelated complete recipe never highlights a new unrelated card',()=>{
 const r=run(['wand','tome']);assert.ok(r.evolutionChoices().some(c=>c.recipeId==='holyWand'));
 const hints=r.rewardEvolutionHints({key:'axe'});assert.ok(hints.length);assert.ok(hints.every(h=>h.recipeId!=='holyWand'));
 assert.equal(hints.find(h=>h.recipeId==='deathSpiral').status,'progress');assert.deepEqual(r.rewardEvolutionHints({key:'cloverPickup'}),[]);
});

test('all matching cost variants qualify by CardGroup, not the representative card key',()=>{
 for(const key of ['tome','lightTome','weightyTome','ancientTome'])assert.equal(hint(run(['wand']),key,'holyWand').status,'ready');
 for(const key of ['candelabrador','candelabrador1','candelabrador2'])assert.equal(hint(run(['axe']),key,'deathSpiral').status,'ready');
});

test('missing material names and groups are provided for a partial three-card recipe',()=>{
 const h=hint(run(['phiera']),'tirajisu','phieraggi');assert.equal(h.status,'progress');
 assert.deepEqual(h.missingGroups,['CardGroup_EightTheSparrow']);assert.equal(h.missingCards[0].key,'eightSparrow');assert.ok(h.missingCards[0].name);assert.ok(h.missingCards[0].english);
 assert.equal(h.components.filter(c=>c.isOffer).length,1);
});

test('a three-card recipe requires three distinct instances and includes a new copy even if its incoming ID collides',()=>{
 const r=run(['phiera','eightSparrow']);const offer={id:r.deck[0].id,key:'tirajisu'};
 const h=r.rewardEvolutionHints(offer).find(h=>h.recipeId==='phieraggi');assert.equal(h.status,'ready');
 assert.equal(h.components.filter(c=>c.isOffer).length,1);assert.equal(new Set(h.components.filter(c=>!c.isOffer).map(c=>c.id)).size,2);
 r.deck[1].id=r.deck[0].id;const invalid=hint(r,'tirajisu','phieraggi');assert.equal(invalid.status,'progress');assert.equal(invalid.missingCards.length,1);
});

test('duplicate copies of the same ingredient cannot substitute for another ingredient',()=>{
 const h=hint(run(['phiera','phiera']),'tirajisu','phieraggi');assert.equal(h.status,'progress');assert.equal(h.missingCards[0].key,'eightSparrow');
});

test('full weapon sockets produce needsSocket and an empty compatible alternative takes precedence',()=>{
 const r=run(['wand']);r.deck[0].gems=['armor'];let h=hint(r,'tome','holyWand');assert.equal(h.status,'needsSocket');assert.equal(h.slotIssue,'full');
 assert.deepEqual(h.inheritedGems,['armor']);assert.equal(h.missingCards.length,0);
 const empty=r.makeCard('wand');r.deck.push(empty);h=hint(r,'tome','holyWand');assert.equal(h.status,'ready');assert.equal(h.weaponId,empty.id);
});

test('expanded weapon sockets and inherited gems match the real fusion choice after acquisition',()=>{
 const r=run(['wand']);r.deck[0].gemSlots=2;r.deck[0].gems=['armor'];const h=hint(r,'tome','holyWand');assert.equal(h.status,'ready');assert.equal(h.gemSlots,2);assert.deepEqual(h.inheritedGems,['armor']);
 const offer=r.makeCard('tome');r.deck.push(offer);const actual=r.evolutionChoices().find(c=>c.recipeId==='holyWand');assert.ok(actual);assert.equal(actual.gemSlots,h.gemSlots);assert.deepEqual(actual.inheritedGems,h.inheritedGems);
 r.phase='evolution';r.evolution={returnPhase:'gate',choices:r.evolutionChoices()};const result=r.fuse(actual.id);assert.equal(result.ok,true);assert.equal(result.card.gemSlots,2);assert.deepEqual(result.card.gems,['armor','evolve']);assert.equal(gems.validate(result.card).ok,true);
});

test('a newly offered weapon uses owned global slot upgrades without allocating a card',()=>{
 const r=run(['tome']);r.slotUpgrades.wand=2;const next=r.nextCardId,h=hint(r,'wand','holyWand');assert.equal(h.status,'ready');assert.equal(h.gemSlots,2);assert.equal(h.weaponId,null);assert.equal(r.nextCardId,next);
 assert.equal(r.makeCard('wand').gemSlots,h.gemSlots);
});

test('an incompatible evolve tag is not advertised as ready even with an empty slot',()=>{
 const r=run(['wand']);Object.assign(r.deck[0],{gemSlots:2,gems:['evolve'],baseKey:'wand',evolutionRecipe:'wand'});
 const h=hint(r,'tome','holyWand');assert.equal(h.status,'needsSocket');assert.equal(h.slotIssue,'incompatible');assert.equal(r.evolutionChoices().length,0);
});

test('source-disabled and unsupported recipes are excluded from reward suggestions',()=>{
 for(const recipe of evolutionRecipes.filter(r=>!r.runtimeEnabled||r.sourceDisabled)){
  const keys=recipe.componentKeys.map(group=>group.find(k=>catalog.cards[k])),r=run(keys.slice(0,-1));
  assert.ok(r.rewardEvolutionHints({key:keys.at(-1)}).every(h=>h.recipeId!==recipe.id),recipe.id);
 }
 assert.deepEqual(run().rewardEvolutionHints({key:'unknown-card'}),[]);assert.deepEqual(run().rewardEvolutionHints(null),[]);
});

test('older combat versions retain their existing restricted recipe eligibility',()=>{
 const r=run(['axe','wand']);r.combatVersion=8;assert.equal(hint(r,'tome','holyWand').status,'ready');assert.equal(hint(r,'candelabrador','deathSpiral'),undefined);
});
