'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,definition,effectsV10}=require('../dist/engine'),{Run}=require('../dist/run');
function fixture(keys=['combo','whip'],{version=19,chain=3,wildStrength=true}={}){
 const b=new Battle({seed:'FRIENDSHIP19',deck:keys.map((key,i)=>({id:i+1,key,gems:[]})),enemies:[{key:'ghost',name:'Target',health:100000,armor:0,slot:{column:0,row:0},intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'wait'}]}]}],settings:{attackRulesVersion:13,friendshipRulesVersion:version,dealCount:0,handLimit:20,startingMana:20,wildStrength}});
 b.piles.hand=b.piles.draw;b.piles.draw=[];b.combo=chain;b.previousCost=9;return b;
}
test('Friendship adds exactly two extra combo levels at any starting chain, independent of Wild Strength',()=>{
 for(const chain of [0,3,9,50])for(const wildStrength of [true,false]){
  const b=fixture(undefined,{chain,wildStrength}),card=b.piles.hand.find(c=>c.key==='combo'),before=b.snapshot(),p=b.cardPreview(card);
  assert.equal(p.multiplier,chain+1);assert.equal(p.comboBonus,2);assert.equal(p.resultCombo,chain+3);assert.equal(p.payment,0);assert.deepEqual(b.snapshot(),before);
  assert.ok(b.play(card.id).ok);assert.equal(b.combo,chain+3);assert.equal(b.previousWild,true);assert.equal(b.player.mana,20);
  assert.deepEqual(b.events.find(e=>e.type==='friendship_boost').bonus,2);
 }
});
test('next attack consumes the stronger combo and matches its displayed damage',()=>{
 const b=fixture();b.play(1);const card=b.piles.hand[0],p=b.cardPreview(card);assert.equal(p.multiplier,7);assert.equal(p.continues,true);
 const health=b.enemies[0].health;b.play(card.id);assert.equal(health-b.enemies[0].health,p.damage*p.hits);assert.equal(b.combo,7);assert.equal(b.previousWild,false);
});
test('two amulets add fixed increments, and end turn clears the combo normally',()=>{
 const b=fixture(['combo','combo'],{chain:0});b.play(1);assert.equal(b.combo,3);b.play(2);assert.equal(b.combo,6);assert.equal(b.events.filter(e=>e.type==='friendship_boost').length,2);b.endTurn();assert.equal(b.combo,0);assert.equal(b.previousWild,false);
});
test('all other Wild cards keep the original one-step progression and bridge',()=>{
 for(const [key,def]of Object.entries(catalog.cards).filter(([,c])=>c.costType==='wild'&&c.key!=='combo')){const b=fixture([key]),p=b.cardPreview(b.piles.hand[0]);assert.equal(p.comboBonus,0,key);assert.equal(p.resultCombo,4,key);}
 const b=fixture(['wildDefence','whip']);b.play(1);assert.equal(b.combo,4);assert.equal(b.previousWild,true);assert.equal(b.cardPreview(b.piles.hand[0]).multiplier,5);assert.ok(!b.events.some(e=>e.type==='friendship_boost'));
});
test('save/load preserves an awarded boost, cannot replay a spent card and does not add it again',()=>{
 const b=fixture();b.play(1);const restored=Battle.restore(b.snapshot());assert.equal(restored.combo,6);assert.equal(restored.play(1).ok,false);assert.equal(restored.combo,6);assert.equal(restored.events.filter(e=>e.type==='friendship_boost').length,1);assert.equal(restored.cardPreview(restored.piles.hand[0]).multiplier,7);
 const waiting=fixture();waiting.beginEnemyTurn();const before=waiting.snapshot();assert.equal(waiting.play(1).ok,false);assert.deepEqual(waiting.snapshot(),before);
});
test('old run upgrade retains existing combo, deck and events; only future amulet plays get the boost',()=>{
 const r=new Run({exploration:false,friendshipRulesVersion:0});r.deck.push(r.makeCard('combo'));r.enter(r.available()[0].id);const b=r.battle,cards=Object.values(b.piles).flat();for(const k of Object.keys(b.piles))b.piles[k]=[];b.piles.hand=cards;b.combo=4;b.previousWild=true;
 const original={deck:JSON.stringify(r.deck),events:JSON.stringify(b.events),piles:JSON.stringify(b.piles)},old=Run.restore(r.snapshot());assert.equal(old.battle.cardPreview(old.battle.piles.hand.find(c=>c.key==='combo')).comboBonus,0);
 assert.equal(old.enableFriendshipV19(),true);assert.equal(old.enableFriendshipV19(),false);assert.equal(old.battle.combo,4);assert.equal(JSON.stringify(old.deck),original.deck);assert.equal(JSON.stringify(old.battle.events),original.events);assert.equal(JSON.stringify(old.battle.piles),original.piles);
 old.battle.play(old.battle.piles.hand.find(c=>c.key==='combo').id);assert.equal(old.battle.combo,7);assert.equal(Run.restore(old.snapshot()).battle.combo,7);assert.equal(old.combatSettings().friendshipRulesVersion,19);
});
test('current runs enable the buff while explicit historical battles retain native ComboEffect',()=>{
 const r=new Run({exploration:false});assert.equal(r.combatSettings().friendshipRulesVersion,19);r.enter(r.available()[0].id);assert.equal(r.battle.settings.friendshipRulesVersion,19);
 const b=fixture(undefined,{version:0});b.play(1);assert.equal(b.combo,4);assert.ok(!b.events.some(e=>e.type==='friendship_boost'));
 assert.equal(catalog.cards.combo.effects[0].condition,'CardGemsModel.CanReturnToHand');assert.equal(catalog.cards.combo.prototypeBuff.extraCombo,2);
});
test('bilingual descriptions distinguish the fixed bonus from the normal W bridge',()=>{
 const d=definition({key:'combo'});for(const en of [false,true]){const a=effectsV10.descriptions(d,1,en,{friendshipBonus:2}),b=effectsV10.descriptions(d,99,en,{friendshipBonus:2});assert.deepEqual(a,b);assert.ok(a[0].includes('+2'));assert.equal(a.length,1);}
 assert.deepEqual(effectsV10.descriptions(d,5,true),['Continue any combo']);
});
