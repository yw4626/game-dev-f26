'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,gems,characters,cardTypes,profiles}=require('../dist/engine.js');
const {Run:CurrentRun}=require('../dist/run.js');
// This suite covers the pre-v10 three-floor automatic evolution workflow.
class Run extends CurrentRun{constructor(options={}){super({combatVersion:9,...options});}}
function battle(keys,settings={}){
  const deck=keys.map((key,i)=>({id:i+1,key,level:0,gems:[]}));
  const b=new Battle({deck,settings:{startingMana:100,dealCount:0,handLimit:30,...settings},enemies:[{key:'ghost',name:'fixture',health:100000,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'wait',value:0}]}]}]});
  b.piles.hand=b.piles.draw.sort((a,z)=>a.id-z.id);b.piles.draw=[];return b;
}
function station(character='imelda'){
  const r=new Run({character,exploration:false});
  r.current=r.maps[0].find(n=>n.type==='boss').id;r.completed.push(r.current);r.phase='gate';return r;
}
test('two shipped characters have exact five-card starters and independent base stat modifiers',()=>{
  const a=new Run({character:'antonio',profile:'base'}),i=new Run({character:'imelda',profile:'base'});
  for(const r of [a,i]){assert.equal(r.deck.length,5);assert.deepEqual(r.deck.map(c=>catalog.cards[c.key].assetId),characters[r.character].deckAssetIds);assert.deepEqual(Run.restore(r.snapshot()).snapshot(),r.snapshot());assert.ok(!r.availableCards().some(k=>catalog.cards[k].kind==='character'||catalog.cards[k].isEvolved));}
  assert.equal(a.maxHealth,profiles.base.health+10);assert.equal(i.maxHealth,profiles.base.health);
  assert.equal(a.combatSettings().startingMana,2);assert.equal(i.combatSettings().startingMana,3);assert.equal(i.combatSettings().growth,20);
  assert.throws(()=>new Run({character:'unsupported'}));
});
test('card type and color come from original assets rather than effect or mana cost',()=>{
  assert.equal(catalog.cards.spinach.cardType,'Special');assert.equal(catalog.cards.tome.cardType,'Mana');assert.equal(catalog.cards.armor.cardType,'Defense');assert.equal(catalog.cards.fccAntonio.cardType,'Character');
  assert.deepEqual(catalog.cards.whip.color,cardTypes.Attack.color);assert.deepEqual(catalog.cards.draw.color,cardTypes.Special.color);
});
test('Antonio reacts after attack damage, five times, and fifth reaction discards the FCC',()=>{
  const b=battle(['fccAntonio','whip','whip','whip','whip','whip','whip']);
  assert.ok(b.play(1).ok);assert.equal(b.player.armor,3);assert.equal(b.activeFCC[0].remaining,5);assert.equal(b.piles.fcc[0].id,1);
  assert.ok(b.play(2).ok);assert.equal(b.player.might,10);assert.equal(b.events.find(e=>e.type==='enemy_damage').actualLoss,8);
  assert.ok(b.play(3).ok);assert.equal(b.events.filter(e=>e.type==='enemy_damage').at(-1).actualLoss,9);
  for(const id of [4,5,6])assert.ok(b.play(id).ok);
  assert.equal(b.player.might,50);assert.equal(b.activeFCC.length,0);assert.equal(b.piles.fcc.length,0);assert.ok(b.piles.discard.some(c=>c.id===1));
  assert.ok(b.play(7).ok);assert.equal(b.player.might,50);assert.equal(b.events.filter(e=>e.type==='character_trigger').length,5);
  assert.equal(Object.values(b.piles).flat().length,b.cardCount);
});
test('FCC duration is reaction count, consumes Duration bonus once, survives turns and snapshots',()=>{
  let b=battle(['fccAntonio','armor','whip'],{duration:2});b.combo=2;b.previousCost=-1;
  assert.equal(b.cardPreview(b.piles.hand[0]).duration,7);b.play(1);assert.equal(b.player.armor,9);assert.equal(b.activeFCC[0].remaining,7);assert.equal(b.player.duration,0);
  b.play(2);assert.equal(b.activeFCC[0].remaining,7);b.endTurn();assert.equal(b.activeFCC[0].remaining,7);
  const save=b.snapshot();b=Battle.restore(save);assert.deepEqual(b.snapshot(),save);
  b.draw(1);const attack=Object.values(b.piles).flat().find(c=>c.key==='whip');
  b.piles.hand=Object.values(b.piles).flat().filter(c=>c.key!=='fccAntonio');b.piles.draw=[];b.piles.discard=[];b.piles.combo=[];
  b.play(attack.id);assert.equal(b.activeFCC[0].remaining,6);
});
test('Imelda first effect applies combo and growth while Special reactions add fixed one afterwards',()=>{
  const b=battle(['fccImelda','spinach','armor','whip'],{growth:20});b.combo=2;b.previousCost=-1;
  assert.equal(b.cardPreview(b.piles.hand[0]).experience,54);b.play(1);
  assert.equal(b.events.find(e=>e.type==='experience_gain').amount,54);assert.equal(b.activeFCC[0].remaining,5);
  b.play(2);assert.equal(b.player.growth,21);assert.equal(b.activeFCC[0].remaining,4);
  b.play(3);b.play(4);assert.equal(b.player.growth,21);assert.equal(b.activeFCC[0].remaining,4);
});
test('Imelda XP queues ordinary character levels once, and reaction growth carries into next encounter',()=>{
  const r=new Run({character:'imelda',exploration:false});r.enter(r.available()[0].id);const b=r.battle;
  b.piles.hand=Object.values(b.piles).flat();b.piles.draw=[];b.piles.discard=[];b.piles.combo=[];b.settings.handLimit=20;
  const fcc=b.piles.hand.find(c=>c.key==='fccImelda');b.play(fcc.id);r.syncExperience();
  assert.equal(r.phase,'levelup');assert.equal(r.level,2);assert.equal(r.xp,13);r.chooseLevelCard(0);r.syncExperience();assert.equal(r.level,2);assert.equal(r.xp,13);
  const draw=b.piles.hand.find(c=>c.key==='draw');b.play(draw.id);assert.equal(b.player.growth,21);
  b.enemies.forEach(e=>e.health=0);b.phase='victory';r.settleBattle();assert.equal(r.combatBonuses.growth,1);assert.equal(r.combatSettings().growth,21);
});
test('boss evolution follows pending XP selections and is available only once on floors one and two',()=>{
  const r=new Run({exploration:false});r.current=r.maps[0].find(n=>n.type==='boss').id;r.phase='battle';r.battle=battle(['fccAntonio','whip']);r.battle.phase='victory';r.battle.log('experience_gain','fixture',{amount:5});
  assert.equal(r.settleBattle(),false);assert.equal(r.phase,'levelup');r.chooseLevelCard(0);r.settleBattle();assert.equal(r.phase,'evolution');assert.equal(r.reward,null);
  assert.ok(r.skipEvolution().ok);assert.equal(r.phase,'gate');assert.equal(r.openEvolution(),false);assert.equal(r.skipEvolution().ok,false);
  const third=station();third.floor=3;third.current=third.maps[2].find(n=>n.type==='boss').id;third.completed.push(third.current);assert.equal(third.openEvolution(),false);
});
test('fusion consumes both selected instances, creates new UID and copies only weapon gems plus occupying evolve gem',()=>{
  let r=station();const weapon=r.deck.find(c=>c.key==='wand');weapon.gemSlots=2;weapon.gems=['double'];
  const support=r.makeCard('tome');support.gemSlots=1;support.gems=['armor'];r.deck.push(support);assert.ok(r.openEvolution());
  const choice=r.evolution.choices.find(c=>c.weaponId===weapon.id&&c.supportId===support.id);assert.deepEqual(choice.lostSupportGems,['armor']);
  r=Run.restore(r.snapshot());const size=r.deck.length,uid=r.nextCardId;const result=r.fuse(choice.id);assert.ok(result.ok);assert.equal(result.card.id,uid);assert.equal(r.deck.length,size-1);
  assert.ok(!r.deck.some(c=>[weapon.id,support.id].includes(c.id)));assert.equal(result.card.key,'holyWand');assert.equal(result.card.baseKey,'wand');assert.deepEqual(result.card.gems,['double','evolve']);assert.equal(result.card.gemSlots,2);
  assert.equal(gems.modifiers(result.card).damageMultiplier,2);assert.equal(gems.canInsert(result.card,'armor').ok,false);assert.equal(r.phase,'gate');assert.equal(r.fuse(choice.id).ok,false);
  assert.deepEqual(Run.restore(r.snapshot()).snapshot(),r.snapshot());assert.doesNotThrow(()=>new Battle({deck:r.deck}));
});
test('evolution checks actual groups and empty slot without requiring ordinary card upgrades',()=>{
  const r=station();r.deck.push(r.makeCard('lightTome'));const wands=r.deck.filter(c=>c.key==='wand');wands[0].gems=['double'];
  r.openEvolution();assert.equal(r.evolution.choices.length,1);assert.equal(r.evolution.choices[0].weaponId,wands[1].id);
  const save=r.snapshot();assert.equal(r.fuse('holyWand:999:888').ok,false);assert.deepEqual(r.snapshot(),save);
  assert.ok(r.fuse(0).ok);assert.equal(r.deck.at(-1).level,0);assert.deepEqual(r.deck.at(-1).gems,['evolve']);
});
test('evolved cards can unlock remaining base slots and socket after evolution while preserving inherited base progression',()=>{
  const r=station();r.deck.push(r.makeCard('tome'));r.openEvolution();const result=r.fuse(0).card;
  r.phase='shop';r.gold=200;assert.ok(r.addGemSlot(result.id).ok);const evolved=r.deck.find(c=>c.id===result.id);assert.equal(evolved.gemSlots,2);assert.equal(r.slotUpgrades.wand,2);
  assert.ok(gems.canInsert(evolved,'armor').ok);evolved.gems.push('armor');assert.ok(gems.validate(evolved).ok);assert.equal(r.makeCard('wand').gemSlots,2);
  assert.doesNotThrow(()=>Run.restore(r.snapshot()));
});
test('forged fusion source and active character states fail restoration',()=>{
  const r=station();r.deck.push(r.makeCard('tome'));r.openEvolution();r.fuse(0);const save=r.snapshot();save.data.deck.at(-1).baseKey='whip';assert.throws(()=>Run.restore(save));
  const b=battle(['fccAntonio','whip']);b.play(1);const bad=b.snapshot();bad.data.activeFCC[0].remaining=0;assert.throws(()=>Battle.restore(bad));
});
test('v7 saves retain fourteen-card starter and do not acquire a character on migration',()=>{
  const r=new Run({rulesVersion:7});const save=r.snapshot();delete save.data.character;delete save.data.evolution;delete save.data.evolutionFloors;delete save.data.combatBonuses;
  const restored=Run.restore(save);assert.equal(restored.deck.length,14);assert.equal(restored.character,undefined);assert.equal(restored.progressionVersion,7);assert.ok(!restored.deck.some(c=>catalog.cards[c.key].kind==='character'));
});
test('eight v8 journeys with both starters use real combat, reloads and level choices until a complete ending',()=>{
  const endings={won:0,lost:0};let selections=0;
  for(const character of ['antonio','imelda'])for(let seed=0;seed<4;seed++){
    let r=new Run({character,seed:'FCC'+seed,exploration:false}),steps=0;
    while(!['won','lost'].includes(r.phase)&&steps++<2500){
      if(r.phase==='map')r.enter(r.available()[0].id);
      else if(r.phase==='battle'){
        const b=r.battle;
        if(b.phase==='player'){
          const cards=b.piles.hand.filter(c=>b.canPlay(c.id).ok).sort((a,z)=>{
            const score=c=>{const p=b.cardPreview(c);return (p.character?1000:0)+(p.damage*p.hits||0)+p.draw*20+p.manaGain*20+p.mightGain*3+p.amountGain*30+p.armor-p.payment;};
            return score(z)-score(a);
          });
          if(cards.length)b.play(cards[0].id);else b.endTurn();
        }else if(b.phase==='enemy')b.resolveNextEnemy();
        r.syncExperience();r.settleBattle();
      }else if(r.phase==='levelup'){r.chooseLevelCard(0);selections++;}
      else if(r.phase==='evolution'){if(r.evolution.choices.length)r.fuse(0);else r.skipEvolution();}
      else if(r.phase==='treasure')r.openTreasure('gold');else if(r.phase==='camp')r.rest();else if(r.phase==='shop')r.leave();else if(r.phase==='gate')r.nextFloor();else assert.fail('unexpected '+r.phase);
      r=Run.restore(r.snapshot());
    }
    assert.ok(steps<2500,'journey must terminate');assert.equal(r.reward,null);endings[r.phase]++;
  }
  assert.equal(endings.won+endings.lost,8);assert.ok(selections>0);
});
