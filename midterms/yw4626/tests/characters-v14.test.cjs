'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../dist/characters-v14.js'),E=require('../dist/engine.js'),{Run}=require('../dist/run.js');

function battle(keys,settings={}){
 const b=new E.Battle({deck:keys.map((key,i)=>({id:i+1,key,gems:[]})),enemies:[{key:'ghost',name:'Fixture',health:100000,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}],settings:{attackRulesVersion:13,startingMana:100,dealCount:0,handLimit:20,...settings}});
 b.piles.hand=b.piles.draw.sort((a,z)=>a.id-z.id);b.piles.draw=[];return b;
}
test('new FCC/deck resource objects match fresh original Unity object hashes',()=>{
 assert.equal(data.originalObjects.length,4);assert.ok(data.originalObjects.every(x=>x.matchesSavedDecode&&/^[a-f0-9]{64}$/.test(x.objectSha256)));
 assert.deepEqual(Object.keys(data.characters),['arca','poe']);
 assert.equal(data.cards.fccArca.firstEffect.effect,'mana');assert.equal(data.cards.fccArca.firstEffect.amount,3);
 assert.equal(data.cards.fccPoe.firstEffect.effect,'area');assert.equal(data.cards.fccPoe.firstEffect.amount,20);
});
test('Arca and Poe preserve exact five-card starters, base modifiers and saves',()=>{
 const a=new Run({profile:'base',character:'arca'}),p=new Run({profile:'base',character:'poe'});
 for(const r of [a,p]){
  assert.deepEqual(r.deck.map(c=>E.catalog.cards[c.key].assetId),data.characters[r.character].deckAssetIds);
  assert.deepEqual(Run.restore(r.snapshot()).snapshot(),r.snapshot());
  assert.ok(!r.availableCards().some(k=>E.catalog.cards[k].kind==='character'));
 }
 assert.equal(a.maxHealth,E.profiles.base.health+5);assert.equal(a.combatSettings().startingMana,3);assert.equal(a.combatSettings().might,30);
 assert.equal(p.combatSettings().area,20);assert.equal(p.combatSettings().dealCount,a.combatSettings().dealCount+1);
});
test('Arca restores mana immediately and only Mana cards consume five fixed reactions',()=>{
 const b=battle(['fccArca','armor','tome','tome','tome','tome','tome']);
 const before=b.player.mana;b.play(1);assert.equal(b.player.mana,before+2);assert.equal(b.activeFCC[0].remaining,5);
 b.play(2);assert.equal(b.activeFCC[0].remaining,5);
 for(const id of [3,4,5,6,7])assert.ok(b.play(id).ok);
 const triggers=b.events.filter(e=>e.type==='character_trigger');assert.equal(triggers.length,5);assert.ok(triggers.every(e=>e.amount===1));
 assert.equal(b.activeFCC.length,0);assert.ok(b.piles.discard.some(c=>c.key==='fccArca'));
});
test('Poe immediate Area scales with combo, lifetime does not, Defense response draws with Magnet',()=>{
 const b=battle(['fccPoe','armor','whip','armor','armor','knife','knife','knife'],{magnet:1});
 b.piles.draw=b.piles.hand.splice(5);b.combo=2;b.previousCost=-1;
 const preview=b.cardPreview(b.piles.hand[0]);assert.equal(preview.duration,3);
 b.play(1);assert.equal(b.player.area,60);assert.equal(b.activeFCC[0].remaining,3);
 const count=b.piles.hand.length;b.play(2);assert.equal(b.piles.hand.length,count-1+2);assert.equal(b.activeFCC[0].remaining,2);
 b.play(3);assert.equal(b.activeFCC[0].remaining,2);
 const restored=E.Battle.restore(b.snapshot());assert.deepEqual(restored.snapshot(),b.snapshot());
 restored.play(4);restored.play(5);assert.equal(restored.activeFCC.length,0);assert.ok(restored.piles.discard.some(c=>c.key==='fccPoe'));
});
