'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js');
const {gems,cost}=require('../dist/engine.js');
function station({materials=true,floor=1}={}){
 const r=new Run({seed:'REWARDS-V10',combatVersion:10,exploration:false,profile:'demo',character:'imelda'});
 r.floor=floor;r.current=r.maps[floor-1].find(n=>n.type==='boss').id;r.completed.push(r.current);r.phase='gate';
 if(materials)r.deck.push(r.makeCard('tome'));
 assert.equal(r.openBossReward(),true);return r;
}
function roundtrip(r){const save=r.snapshot(),restored=Run.restore(save);assert.deepEqual(restored.snapshot(),save);return restored;}
function assertConsumed(r){
 assert.equal(r.phase,'gate');assert.equal(r.bossReward,null);assert.deepEqual(r.bossRewardFloors,[r.floor]);
 assert.equal(r.openBossReward(),false);assert.equal(r.chooseBossReward('card').ok,false);assert.equal(r.claimBossCard(0).ok,false);assert.equal(r.chooseBossReward('gem').ok,false);assert.equal(r.chooseBossReward('evolution').ok,false);
 roundtrip(r);
}
function levelChoice({full=false,key='fire'}={}){
 const r=new Run({seed:'LEVEL-FREE-V10',combatVersion:10,exploration:false,profile:'demo'});
 assert.equal(r.enter(r.available()[0].id).ok,true);
 const b=r.battle;b.enemies.forEach(e=>{e.health=10000;e.maxHealth=10000;});
 if(full)b.settings.handLimit=b.piles.hand.length;else b.settings.handLimit=b.piles.hand.length+2;
 r.pendingLevels=[2];r.level=2;r.openLevelChoice();r.levelChoice.choices=[{key,level:0}];return r;
}
function choose(r){const id=r.nextCardId;assert.equal(r.chooseLevelCard(0).ok,true);return {id,card:Object.values(r.battle.piles).flat().find(c=>c.id===id),template:r.deck.find(c=>c.id===id)};}

test('v10 boss menu and each card/gem/evolution branch survive save/restore without consumption',()=>{
 let r=roundtrip(station());const initial=r.snapshot();
 for(const kind of ['card','gem','evolution']){
  assert.equal(r.chooseBossReward(kind).ok,true);assert.equal(r.phase,{card:'bosscard',gem:'gem',evolution:'evolution'}[kind]);r=roundtrip(r);
  if(kind==='gem'){assert.equal(r.chooseGem(r.gemObject().offers[0]).ok,true);r=roundtrip(r);assert.equal(r.cancelGem(),true);initial.data.bossReward.gem.inspected=true;}
  else if(kind==='evolution')assert.equal(r.skipEvolution().ok,true);
  else assert.equal(r.returnToBossReward(),true);
  assert.equal(r.phase,'bossreward');assert.deepEqual(r.snapshot(),initial);
 }
});
test('boss card reward is granted once and blocks the two alternative rewards',()=>{
 let r=station();assert.equal(r.chooseBossReward('card').ok,true);r=roundtrip(r);const n=r.deck.length,key=r.bossReward.cards[0].key;
 assert.equal(r.claimBossCard(-1).ok,false);assert.equal(r.claimBossCard(0).ok,true);assert.equal(r.deck.length,n+1);assert.equal(r.deck.at(-1).key,key);assert.equal(r.deck.at(-1).free,false);assertConsumed(r);
});
test('boss gem selection only consumes the reward after successful socket, once',()=>{
 let r=station();assert.equal(r.chooseBossReward('gem').ok,true);
 const key=r.gemObject().offers.find(g=>r.deck.some(c=>gems.canInsert(c,g).ok)),card=r.deck.find(c=>gems.canInsert(c,key).ok);assert.ok(key);assert.ok(card);
 assert.equal(r.chooseGem(key).ok,true);r=roundtrip(r);assert.equal(r.socketGem(-1).ok,false);assert.ok(r.bossReward);assert.equal(r.bossRewardFloors.length,0);
 const n=r.deck.length;assert.equal(r.socketGem(card.id).ok,true);assert.equal(r.deck.length,n);assert.ok(r.deck.find(c=>c.id===card.id).gems.includes(key));assert.equal(r.socketGem(card.id).ok,false);assertConsumed(r);
});
test('boss evolution consumes two actual materials, creates one evolved card and consumes only one reward',()=>{
 let r=station();assert.equal(r.chooseBossReward('evolution').ok,true);r=roundtrip(r);
 const choice=r.evolution.choices[0],n=r.deck.length;assert.ok(choice);assert.equal(r.fuse('invalid').ok,false);assert.ok(r.bossReward);
 const result=r.fuse(choice.id);assert.equal(result.ok,true);assert.equal(r.deck.length,n-1);assert.equal(result.card.key,choice.resultKey);assert.ok(choice.componentIds.every(id=>!r.deck.some(c=>c.id===id)));assert.deepEqual(r.evolutionFloors,[1]);assert.equal(r.fuse(choice.id).ok,false);assertConsumed(r);
});
test('missing fusion materials never block either the card or gem reward',()=>{
 for(const kind of ['card','gem']){const r=station({materials:false});assert.equal(r.evolutionChoices().length,0);assert.equal(r.chooseBossReward('evolution').ok,false);assert.equal(r.phase,'bossreward');assert.equal(r.bossRewardFloors.length,0);assert.equal(r.chooseBossReward(kind).ok,true);
  if(kind==='card')assert.equal(r.claimBossCard(0).ok,true);else{const key=r.gemObject().offers.find(g=>r.deck.some(c=>gems.canInsert(c,g).ok)),card=r.deck.find(c=>gems.canInsert(c,key).ok);assert.ok(card);assert.equal(r.chooseGem(key).ok,true);assert.equal(r.socketGem(card.id).ok,true);}assertConsumed(r);
 }
});
test('floor two can grant its own boss reward after floor one has been claimed',()=>{
 const r=station();r.chooseBossReward('card');r.claimBossCard(0);assert.equal(r.nextFloor(),true);r.current=r.maps[1].find(n=>n.type==='boss').id;r.completed.push(r.current);r.phase='gate';assert.equal(r.openBossReward(),true);r.chooseBossReward('card');assert.equal(r.claimBossCard(0).ok,true);assert.deepEqual(r.bossRewardFloors,[1,2]);roundtrip(r);
});
test('upgraded player level creates a free hand instance but a permanently paid deck template',()=>{
 let r=roundtrip(levelChoice());const n=r.deck.length,{id,card,template}=choose(r);assert.equal(r.deck.length,n+1);assert.ok(r.battle.piles.hand.some(c=>c.id===id));assert.equal(card.free,true);assert.equal(card.rewardFreeTurn,r.battle.turn);assert.equal(template.free,false);assert.equal(template.rewardFreeTurn,undefined);assert.equal(r.chooseLevelCard(0).ok,false);
 r=roundtrip(r);assert.equal(r.battle.piles.hand.find(c=>c.id===id).free,true);assert.equal(r.deck.find(c=>c.id===id).free,false);
});
test('full-hand level reward goes into draw without a free flag',()=>{
 const r=levelChoice({full:true}),n=r.battle.piles.draw.length,{id,card,template}=choose(r);assert.equal(r.battle.piles.draw.length,n+1);assert.ok(r.battle.piles.draw.some(c=>c.id===id));assert.equal(card.free,false);assert.equal(card.rewardFreeTurn,undefined);assert.equal(template.free,false);roundtrip(r);
});
test('free level card can be played at zero mana while combo keeps its original cost',()=>{
 const r=levelChoice(),b=r.battle;b.player.mana=0;b.combo=1;b.previousCost=0;
 const {id,card,template}=choose(r);assert.equal(cost(card,0),0);assert.equal(cost(card,0,true),1);assert.equal(b.cardPreview(card).multiplier,2);assert.equal(b.canPlay(id).ok,true);
 assert.equal(b.play(id).ok,true);assert.equal(b.player.mana,0);assert.equal(b.combo,2);assert.equal(b.previousCost,1);assert.equal(card.free,false);assert.equal(card.rewardFreeTurn,undefined);assert.equal(template.free,false);roundtrip(r);
});
test('ending the turn clears unplayed level-reward free state before the next hand',()=>{
 let r=levelChoice();const {id}=choose(r);r=roundtrip(r);const b=r.battle;assert.equal(b.beginEnemyTurn(),true);
 const c=Object.values(b.piles).flat().find(c=>c.id===id);assert.ok(c);assert.equal(c.free,false);assert.equal(c.rewardFreeTurn,undefined);assert.equal(cost(c,0),1);r=roundtrip(r);
 while(r.battle.phase==='enemy')r.battle.resolveNextEnemy();const next=Object.values(r.battle.piles).flat().find(c=>c.id===id);assert.equal(next.free,false);assert.equal(next.rewardFreeTurn,undefined);
});
test('reward cleanup does not remove independent free flags on other cards',()=>{
 const r=levelChoice(),b=r.battle,other=b.piles.hand[0];other.free=true;const {id}=choose(r);b.beginEnemyTurn();assert.equal(other.free,true);assert.equal(Object.values(b.piles).flat().find(c=>c.id===id).free,false);
});
