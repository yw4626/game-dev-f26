'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,gems,cost}=require('../dist/engine.js'),{Run}=require('../dist/run.js'),D=require('../dist/dungeon.js');
function battle(keys,reserve=[]){
  const deck=[...keys,...reserve].map((key,i)=>({id:i+1,key,level:0,gems:[]}));
  const b=new Battle({seed:'WILD',deck,settings:{attackRulesVersion:9,startingMana:20,dealCount:0,handLimit:20},enemies:[{key:'ghost',name:'fixture',health:100000,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}]});
  const all=Object.values(b.piles).flat().sort((a,z)=>a.id-z.id);b.piles.hand=all.slice(0,keys.length);b.piles.draw=all.slice(keys.length);return b;
}
test('Clover Petal retains pickup provenance, zero wild cost and fixed luck/draw effects',()=>{
  const c=catalog.cards.cloverPetal;assert.equal(c.assetId,'Card_E_CloverPetal');assert.equal(c.isPickup,true);assert.equal(c.addToRewardPool,false);assert.equal(c.costType,'wild');assert.equal(c.luck,5);assert.equal(c.drawCount,1);assert.equal(c.receivesComboMultiplier,false);assert.equal(c.cardType,'Void');
  assert.equal(gems.slotCount({key:'cloverPetal'}),0);assert.equal(cost({key:'cloverPetal',modifiers:[10]},0),0);
});
test('W bridges any previous and following cost, increments combo, then resumes the next ordinary cost staircase',()=>{
  const b=battle(['axe','cloverPetal','whip','fire'],['armor']);b.play(1);assert.equal(b.previousCost,2);assert.equal(b.combo,1);
  const w=b.cardPreview(b.piles.hand.find(c=>c.id===2));assert.equal(w.payment,0);assert.equal(w.multiplier,2);assert.equal(w.wildcard,true);b.play(2);
  assert.equal(b.previousWild,true);assert.equal(b.previousCost,0);assert.equal(b.combo,2);assert.equal(b.player.luck,5);
  const next=b.cardPreview(b.piles.hand.find(c=>c.id===3));assert.equal(next.followsWild,true);assert.equal(next.continues,true);assert.equal(next.multiplier,3);b.play(3);
  assert.equal(b.previousWild,false);assert.equal(b.previousCost,0);assert.equal(b.comboPreview(b.piles.hand.find(c=>c.id===4)).multiplier,4);
});
test('wild immediate effects ignore a high combo and respect the resolving-card hand slot',()=>{
  const b=battle(['cloverPetal','whip'],['armor','wand']);b.combo=8;b.previousCost=5;b.player.mana=0;b.settings.handLimit=2;
  const p=b.cardPreview(b.piles.hand[0]);assert.equal(p.draw,1);assert.equal(p.luckGain,5);assert.ok(b.play(1).ok);assert.equal(b.player.luck,5);assert.equal(b.piles.hand.length,2);assert.equal(b.piles.draw.length,1);
  assert.equal(b.combo,9);assert.equal(b.piles.combo[0].pendingDestroy,true);assert.equal(b.piles.destroyed.length,0);
});
test('leaving combo destroys the card permanently for this battle and never recycles it',()=>{
  let b=battle(['cloverPetal','axe'],['armor']);b.play(1);const save=b.snapshot();b=Battle.restore(save);assert.deepEqual(b.snapshot(),save);
  b.play(2);b.endTurn();assert.equal(b.piles.destroyed.length,1);assert.equal(b.previousWild,false);assert.equal(b.events.filter(e=>e.type==='card_destroy').length,1);
  for(let i=0;i<3;i++){b.draw(20);b.endTurn();}
  assert.equal(b.events.filter(e=>e.type==='card_destroy').length,1);assert.ok(!['draw','hand','combo','discard'].some(k=>b.piles[k].some(c=>c.key==='cloverPetal')));assert.equal(Object.values(b.piles).flat().length,b.cardCount);
});
test('draw shortage can destroy an earlier W without losing its numeric combo bridge',()=>{
  const b=battle(['cloverPetal','draw','axe']);b.play(1);b.draw(1);assert.equal(b.piles.destroyed.length,1);assert.equal(b.previousWild,true);assert.equal(b.comboPreview(b.piles.hand.find(c=>c.key==='axe')).multiplier,2);
});
test('first-floor W shop offer is affordable in both profiles, one-time, and does not alter starters or ordinary level pools',()=>{
  for(const profile of ['base','demo']){
    // This assertion preserves the historical guaranteed v9/v12 shop adapter.
    const r=new Run({profile,shopRulesVersion:12});assert.equal(r.deck.length,5);assert.ok(!r.availableCards().includes('cloverPetal'));
    r.shop=r.makeShop(r.maps[0].find(n=>n.type==='shop'));r.phase='shop';const offer=r.shop.offers.find(c=>c.key==='cloverPetal');assert.ok(offer);assert.equal(offer.price,15);assert.ok(r.buy(offer.id).ok);assert.equal(r.deck.length,6);assert.equal(r.buy(offer.id).ok,false);
  }
});
test('run removes destroyed UID once and carries Luck into subsequent encounters and saved runs',()=>{
  let r=new Run({exploration:false}),w=r.makeCard('cloverPetal');r.deck.push(w);r.enter(r.available()[0].id);let b=r.battle;
  const all=Object.values(b.piles).flat(),card=all.find(c=>c.id===w.id);b.piles.draw=all.filter(c=>c!==card);b.piles.hand=[card];b.settings.handLimit=20;b.play(w.id);r.syncExperience();assert.equal(r.deck.length,6);
  b.endTurn();r.syncExperience();assert.equal(r.deck.length,5);assert.ok(!r.deck.some(c=>c.id===w.id));const saved=r.snapshot();r=Run.restore(saved);assert.deepEqual(r.snapshot(),saved);r.syncExperience();assert.equal(r.deck.length,5);
  b=r.battle;b.enemies.forEach(e=>e.health=0);b.phase='victory';r.settleBattle();assert.equal(r.combatBonuses.luck,5);assert.equal(r.combatSettings().luck,5);assert.equal(new Battle({deck:r.deck,settings:r.combatSettings()}).player.luck,5);
});
test('victory also clears pending destroy without discarding or duplicating it',()=>{
  const b=battle(['cloverPetal','whip'],['armor']);b.play(1);b.enemies[0].health=1;b.play(2);assert.equal(b.phase,'victory');assert.equal(b.piles.destroyed.length,1);assert.equal(b.events.filter(e=>e.type==='card_destroy').length,1);
});
test('Luck has its native extra gem-choice probability; offers are fixed on first opening and persist on cancellation',()=>{
  let r=new Run();assert.equal(r.gemLuckChance(),0);r.combatBonuses.luck=5;assert.ok(Math.abs(r.gemLuckChance()-.005)<1e-8);
  r.combatBonuses.luck=1000;assert.equal(r.gemOffers('guaranteed').length,4);const [k,obj]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='gemchest');const [x,y]=k.split(',').map(Number);
  const dir=D.dirs.findIndex(v=>D.canTraverse(r.dungeon,x-v.x,y-v.y,x,y));r.dungeon.x=x-D.dirs[dir].x;r.dungeon.y=y-D.dirs[dir].y;r.dungeon.dir=dir;
  assert.ok(r.interact().ok);assert.equal(obj.offers.length,4);const offers=[...obj.offers];r=Run.restore(r.snapshot());r.cancelGem();r.combatBonuses.luck=0;r.interact();assert.deepEqual(r.dungeon.objects[k].offers,offers);assert.equal(new Set(offers).size,4);
});
