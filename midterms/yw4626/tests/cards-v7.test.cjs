'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,gems,definition}=require('../dist/engine.js');
const extra=require('../dist/extra-cards-v7.js');
function fixture(keys,reserve=[],settings={}){
  const deck=[...keys,...reserve].map((key,i)=>({id:i+1,key,gems:[]}));
  const b=new Battle({deck,settings:{dealCount:0,handLimit:7,startingMana:10,...settings},enemies:[{key:'target',name:'靶子',health:100000,intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}]});
  const all=Object.values(b.piles).flat(),byId=new Map(all.map(c=>[c.id,c]));
  b.piles={hand:keys.map((_,i)=>byId.get(i+1)),draw:reserve.map((_,i)=>byId.get(keys.length+i+1)),discard:[],combo:[],fcc:[],destroyed:[]};b.events=[];b.eventId=0;
  return b;
}
test('eleven distinct support assets preserve base values, gem restrictions and max level zero',()=>{
  assert.equal(Object.keys(extra.cards).length,11);
  for(const [key,card] of Object.entries(extra.cards)){
    assert.equal(catalog.cards[key].assetId,card.assetId);assert.equal(card.maxLevel,0);assert.equal(definition({key,level:2}).level,0);
    assert.equal(gems.metadata({key}),gems.catalog.cardSlots[card.assetId]);assert.equal(gems.validate({key,gems:[]}).ok,true);
  }
  assert.equal(catalog.cards.bracer.cost,0);assert.equal(catalog.cards.lightArmor.armor,2);assert.equal(catalog.cards.rainbowArmor.armor,6);
  assert.equal(gems.enabled.includes('might'),false);assert.equal(gems.enabled.includes('amount'),false);
});
test('mana cards pay first and then receive the escalating combo-scaled mana gain',()=>{
  const b=fixture(['tome','lightTome','weightyTome','ancientTome']);
  for(const [id,expectedGain,expectedMana] of [[1,1,11],[2,4,14],[3,9,21],[4,16,34]]){
    const c=b.piles.hand.find(c=>c.id===id);assert.equal(b.cardPreview(c).manaGain,expectedGain);assert.equal(b.play(id).ok,true);assert.equal(b.player.mana,expectedMana);
  }
  assert.deepEqual(b.events.filter(e=>e.type==='payment').map(e=>e.payment),[0,1,2,3]);
  const poor=fixture(['ancientTome'],[],{startingMana:2}),before=poor.snapshot();assert.equal(poor.play(1).ok,false);assert.deepEqual(poor.snapshot(),before);
});
test('might and amount affect later attacks, survive turn reset and do not carry into a fresh battle',()=>{
  const b=fixture(['tome','spinach','duDuplicator','whip']);b.play(1);
  assert.equal(b.cardPreview(b.piles.hand[0]).mightGain,20);b.play(2);
  assert.equal(b.cardPreview(b.piles.hand[0]).amountGain,6);b.play(3);
  assert.equal(b.player.might,20);assert.equal(b.player.amount,6);
  const attack=b.cardPreview(b.piles.hand[0]);assert.equal(attack.hits,catalog.cards.whip.baseAmount+6);assert.ok(attack.damage>catalog.cards.whip.baseDamage);
  b.endTurn();assert.equal(b.player.might,20);assert.equal(b.player.amount,6);
  const fresh=fixture(['spinach']);assert.equal(fresh.player.might,0);assert.equal(fresh.player.amount,0);
});
test('new armor card uses the original combo flag while appended armor gem stays fixed',()=>{
  const b=fixture(['tome','lightTome','rainbowArmor']);b.piles.hand[2].gemSlots=1;b.piles.hand[2].gems=['armor'];
  b.play(1);b.play(2);assert.equal(b.cardPreview(b.piles.hand[0]).armor,20);b.play(3);assert.equal(b.player.armor,20);
  assert.deepEqual(b.events.filter(e=>e.type==='armor'||e.type==='gem_effect').map(e=>e.amount),[18,2]);
});
test('bracer modifies future dealing and finite hand capacity without an immediate draw',()=>{
  const b=fixture(['bracer'],Array(10).fill('whip'),{dealCount:3,handLimit:4});
  assert.equal(b.cardPreview(b.piles.hand[0]).dealGain,1);b.play(1);
  assert.equal(b.settings.dealCount,4);assert.equal(b.settings.handLimit,5);assert.equal(b.events.some(e=>e.type==='draw_request'),false);
  b.endTurn();assert.equal(b.events.findLast(e=>e.type==='draw_request').count,4);assert.equal(b.piles.hand.length,4);
  const capped=fixture(['bracer'],[],{handLimit:6});capped.combo=4;capped.previousCost=-1;assert.equal(capped.cardPreview(capped.piles.hand[0]).dealGain,5);capped.play(1);assert.equal(capped.settings.handLimit,7);assert.equal(capped.settings.dealCount,5);
});
test('new support effects preserve deterministic snapshot round trips before subsequent turns',()=>{
  const b=fixture(['tome','spinach','duDuplicator','bracer'],Array(8).fill('whip'),{dealCount:3,handLimit:4});
  for(const id of [1,2,3,4])b.play(id);
  const restored=Battle.restore(JSON.parse(JSON.stringify(b.snapshot())));assert.deepEqual(restored.snapshot(),b.snapshot());
  b.endTurn();restored.endTurn();assert.deepEqual(restored.snapshot(),b.snapshot());
});
