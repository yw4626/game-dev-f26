'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Battle,catalog,gems,cost,damageProfile}=require('../dist/engine.js');
function card(key,gemKeys=[],gemSlots){return {key,gems:gemKeys,...(gemSlots===undefined?{}:{gemSlots})};}
function battle(cards,draw=[]){
  const deck=[...cards,...draw].map((c,i)=>({...c,id:i+1}));
  const b=new Battle({deck,settings:{dealCount:0,handLimit:20,startingMana:20},enemies:[{key:'dummy',name:'靶子',health:100000,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}]});
  const indexed=Object.fromEntries(b.piles.draw.map(c=>[c.id,c]));
  b.piles.hand=cards.map((_,i)=>indexed[i+1]);b.piles.draw=draw.map((_,i)=>indexed[cards.length+i+1]);
  b.events=[];b.eventId=0;return b;
}
test('eight shipped attacks are merged and use their exact level two values',()=>{
  const legacyKeys=[...new Set(['catalog','extra-cards','extra-cards-v7'].flatMap(file=>Object.keys(require('../dist/'+file+'.js').cards)))];
  assert.equal(legacyKeys.length,26);assert.ok(legacyKeys.every(key=>catalog.cards[key]&&!['character','wild'].includes(catalog.cards[key].kind)&&!catalog.cards[key].isEvolved));
  assert.deepEqual(catalog.cards.phiera.levels[2],{baseDamage:35,baseAmount:8});
  assert.equal(catalog.cards.phiera.cost,3);
  assert.deepEqual(catalog.cards.runetracer.levels[2],{baseDamage:20,baseAmount:3});
});
test('slots are instance data; basic support cards require an unlocked slot',()=>{
  assert.equal(gems.slotCount(card('whip')),1);assert.equal(gems.slotCount(card('draw')),0);
  assert.equal(gems.canInsert(card('draw'),'draw').ok,false);
  assert.equal(gems.canInsert(card('draw',[],1),'draw').ok,true);
  assert.equal(gems.canInsert(card('whip',['double']),'draw').ok,false);
  assert.equal(gems.validate(card('whip',[],3)).ok,false);
  assert.equal(gems.validate(card('whip',['might'])).ok,false);
  assert.equal(gems.validate({key:'whip',gems:'double'}).ok,false);
  const a=card('whip',['double']);const copied=gems.installed(a);copied.push('triple');assert.deepEqual(a.gems,['double']);
});
test('card exclusion and installed dynamic tags prevent incompatible insertions',()=>{
  assert.equal(gems.canInsert(card('armor',[],1),'double').ok,false);
  assert.equal(gems.canInsert(card('draw',[],1),'triple').ok,false);
  assert.equal(gems.canInsert(card('whip',['costDown'],2),'costUp').ok,false);
  assert.equal(gems.canInsert(card('whip',['costUp'],2),'costDown').ok,false);
  assert.equal(gems.canInsert(card('whip',['reverse'],2),'reverse').ok,false);
  assert.equal(gems.canInsert(card('whip',['free'],2),'reverse').ok,false);
  assert.equal(gems.canInsert(card('whip',['double'],2),'double').ok,true);
  assert.equal(gems.canInsert(card('whip',['costDown'],2),'free').ok,true);
});
test('dynamic inclusions run after every exclusion, regardless of installed order',()=>{
  const gem=gems.catalog.gems.costDown,original=gem.inclusions;
  try{
    gem.inclusions=['GemTag_Reverse'];
    assert.ok(gems.availableTags(card('whip',['costDown','reverse'],2)).includes('GemTag_Reverse'));
  }finally{gem.inclusions=original;}
});
test('damage multiplier uses sum and participates before round-to-even',()=>{
  assert.equal(gems.modifiers(card('whip')).damageMultiplier,1);
  assert.equal(gems.modifiers(card('whip',['double','triple'],2)).damageMultiplier,5);
  assert.equal(gems.modifiers(card('whip',['double','double'],2)).damageMultiplier,4);
  const b=battle([card('fire',['double'])]);b.player.might=50;
  assert.equal(b.cardPreview(b.piles.hand[0]).damage,45); // 15 * 1.5 * 2; not round(22.5) * 2 = 44
  b.play(1);assert.equal(b.events.find(e=>e.type==='enemy_damage').healthDamage,45);
  assert.equal(damageProfile(catalog.cards.fire,{might:50,amount:0},1).damage,22);
});
test('cost gems alter payment and combo, but free gem only alters payment',()=>{
  assert.equal(cost(card('whip',['costDown']),3),-1);
  assert.equal(cost(card('fire',['free']),3),0);assert.equal(cost(card('fire',['free']),3,true),1);
  const b=battle([card('whip',['costUp']),card('cross',['free'])]);
  b.play(1);assert.equal(b.previousCost,1);assert.equal(b.player.mana,19);
  assert.equal(b.cardPreview(b.piles.hand[0]).continues,true);b.play(2);
  assert.equal(b.combo,2);assert.equal(b.previousCost,2);assert.equal(b.player.mana,19);
  const negative=battle([card('whip',['costDown'])]);negative.play(1);assert.equal(negative.player.mana,21);
});
test('reverse belongs to previous card; ordinary next card consumes it',()=>{
  const b=battle([card('cross',['reverse']),card('fire'),card('whip')]);
  b.play(1);assert.equal(b.reverseCombo,true);assert.equal(b.cardPreview(b.piles.hand[0]).multiplier,2);
  b.play(2);assert.equal(b.combo,2);assert.equal(b.reverseCombo,false);
  assert.equal(b.cardPreview(b.piles.hand[0]).continues,false);b.play(3);assert.equal(b.combo,1);
  const c=battle([card('cross'),card('fire',['reverse'])]);c.play(1);
  assert.equal(c.cardPreview(c.piles.hand[0]).continues,false);c.play(2);assert.equal(c.reverseCombo,true);
});
test('reverse still permits upward step and is cleared on end turn',()=>{
  const b=battle([card('fire',['reverse']),card('cross')]);b.play(1);
  assert.equal(b.cardPreview(b.piles.hand[0]).continues,true);b.beginEnemyTurn();assert.equal(b.reverseCombo,false);
});
test('post-play draw and armor gems preserve order and do not multiply with combo',()=>{
  const b=battle([card('whip'),card('fire',['draw','armor'],2)],[card('knife'),card('wand'),card('cat')]);
  b.play(1);const c=b.piles.hand[0],preview=b.cardPreview(c);
  assert.equal(preview.multiplier,2);assert.equal(preview.draw,1);assert.equal(preview.armor,2);
  b.events=[];b.play(c.id);
  assert.deepEqual(b.events.filter(e=>e.type==='gem_effect').map(e=>[e.gem,e.amount]),[['draw',1],['armor',2]]);
  const firstGem=b.events.findIndex(e=>e.type==='gem_effect');
  assert.equal(b.events.slice(firstGem).some(e=>e.type==='enemy_damage'),false);
  assert.equal(b.events.filter(e=>e.type==='draw').length,1);assert.equal(b.player.armor,2);
});
test('draw gem on draw card adds a separate unmultiplied effect using magnet snapshot',()=>{
  const b=battle([card('whip'),card('draw',['draw'],1)],Array.from({length:10},()=>card('knife')));
  b.player.magnet=1;b.play(1);const c=b.piles.hand[0];assert.equal(b.cardPreview(c).draw,5);
  b.events=[];b.play(c.id);assert.deepEqual(b.events.filter(e=>e.type==='draw_request').map(e=>e.count),[3,2]);
});
test('gem draws respect resolving-card hand slot and preserve instance card data',()=>{
  const b=battle([card('whip',['draw']),card('fire')],[card('knife')]);b.settings.handLimit=2;b.play(1);
  assert.equal(b.piles.hand.length,2);assert.deepEqual(b.piles.combo[0].gems,['draw']);
  assert.equal(new Set(Object.values(b.piles).flat().map(c=>c.id)).size,b.cardCount);
});
test('save restore preserves reverse and sockets, and rejects unsupported gem state',()=>{
  const b=battle([card('cross',['reverse']),card('fire',['double','triple'],2)]);b.play(1);
  const restored=Battle.restore(b.snapshot());assert.equal(restored.reverseCombo,true);
  assert.equal(restored.cardPreview(restored.piles.hand[0]).damageMultiplier,5);
  assert.deepEqual(restored.piles.hand[0].gems,['double','triple']);
  const invalid=b.snapshot();invalid.data.piles.hand[0].gems=['might'];assert.throws(()=>Battle.restore(invalid),/Invalid saved deck/);
  const old=b.snapshot();delete old.data.reverseCombo;assert.equal(Battle.restore(old).reverseCombo,false);
});

