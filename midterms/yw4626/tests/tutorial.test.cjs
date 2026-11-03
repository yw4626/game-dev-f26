const {test}=require('node:test'),assert=require('node:assert/strict');
const T=require('../dist/tutorial.js'),{Run}=require('../dist/run.js'),E=require('../dist/engine.js'),D=require('../dist/dungeon.js');
function resume(r){const restored=Run.restore(r.snapshot());assert.ok(restored instanceof T.TutorialRun);return restored;}
function advance(r){const a=r.walk('forward');assert.equal(a.ok,true,a.reason);return resume(r);}
function win(r){let safety=0;while(r.phase==='battle'&&safety++<100){const b=r.battle;if(b.phase==='player'){const guided=r.tutorialCard();const c=guided||b.piles.hand.filter(c=>b.canPlay(c.id).ok).sort((a,c)=>b.cardPreview(c).multiplier-b.cardPreview(a).multiplier)[0];if(c){assert.ok(r.allowTutorial('play',c.id));assert.ok(b.play(c.id).ok);r.syncTutorial();}else b.endTurn();}r.syncExperience();r.settleBattle();if(r.phase==='levelup')r.chooseLevelCard(0);r=resume(r);}assert.notEqual(r.phase,'battle','battle terminates');assert.notEqual(r.phase,'lost');return r;}
for(const character of Object.keys(E.characters))test('tutorial completes and resumes every step: '+character,()=>{
 let r=T.create({seed:'TRAIN-'+character,character});D.validate(r.dungeon);assert.equal(r.tutorial.stage,'move');assert.equal(r.turn(-1).ok,false);assert.equal(r.walk('back').ok,false);
 r=advance(r);assert.equal(r.tutorial.stage,'pickup');const y=r.dungeon.y;r=advance(r);assert.equal(r.dungeon.y,y);assert.equal(r.dungeon.objects['4,16'].type,'pickup');r=advance(r);assert.equal(r.gold,160);assert.equal(r.tutorial.stage,'left');assert.equal(r.walk('forward').ok,false);
 assert.equal(D.canTraverse(r.dungeon,4,16,4,15),false);r.turn(-1);r=resume(r);assert.equal(r.tutorial.stage,'turnWalk');assert.equal(r.turn(1).ok,false);r=advance(r);r=advance(r);assert.equal(r.tutorial.stage,'right');assert.equal(D.canTraverse(r.dungeon,2,16,1,16),false);r.turn(1);r=resume(r);assert.equal(r.tutorial.stage,'approach');while(r.phase==='map')r=advance(r);
 for(const [i,key]of ['whip','fire','axe'].entries()){const c=r.tutorialCard();assert.equal(c.key,key);assert.equal(r.allowTutorial('endTurn'),false);assert.equal(r.battle.cardPreview(c).multiplier,i+1);assert.ok(r.battle.play(c.id).ok);r.syncTutorial();r=resume(r);}
 r=win(r);assert.equal(r.tutorial.stage,'shopApproach');while(r.phase==='map')r=advance(r);assert.equal(r.tutorial.stage,'buy');assert.equal(r.leave(),false);assert.equal(r.buy(0).ok,true);r=resume(r);assert.equal(r.tutorial.stage,'socket');const c=r.deck.find(c=>!r.slotExpansionInfo(c.id).full);const before=r.gold;assert.ok(r.addGemSlot(c.id).ok);assert.equal(before-r.gold,100);r=resume(r);assert.equal(r.tutorial.stage,'leave');assert.ok(r.leave());while(r.phase==='map')r=advance(r);assert.equal(r.phase,'gem');assert.equal(r.cancelGem(),false);assert.ok(r.chooseGem('draw').ok);r=resume(r);const socketCard=r.deck.find(c=>require('../dist/gems.js').canInsert(c,'draw').ok);assert.ok(r.socketGem(socketCard.id).ok);r=resume(r);assert.equal(r.dungeon.objects['2,6'].active,false);while(r.phase==='map')r=advance(r);assert.equal(r.tutorial.stage,'remove');const n=r.deck.length,gold=r.gold;assert.ok(r.removeCard(r.deck.find(c=>c.key==='armor').id).ok);assert.equal(r.deck.length,n-1);assert.equal(r.gold,gold);r=resume(r);
 while(r.phase==='map')r=advance(r);assert.equal(r.tutorial.stage,'boss');assert.ok(r.battle.enemies.some(e=>e.encounterRole==='boss'));r=win(r);assert.equal(r.tutorial.stage,'evolution');assert.equal(r.phase,'evolution');assert.equal(r.evolution.choices.length,1);assert.equal(r.allowTutorial('skipevolution'),false);assert.equal(r.skipEvolution().ok,false);r=resume(r);const choice=r.evolution.choices[0];assert.equal(choice.recipeId,'hellfire');const materials=choice.componentIds;const result=r.fuse(choice.id);assert.ok(result.ok);assert.equal(r.deck.some(c=>materials.includes(c.id)),false);assert.ok(r.deck.some(c=>c.key===result.card.key));r=resume(r);assert.equal(r.tutorial.stage,'complete');const normal=new Run(r.tutorial.options);assert.equal(normal.floor,1);assert.equal(normal.character,character);assert.equal(normal.seed,r.tutorial.options.seed);assert.equal(normal.tutorial,undefined);assert.equal(normal.deck.length,E.characters[character].deckAssetIds.length);assert.equal(normal.gold,60);
});
test('ordinary runs do not enter tutorial; invalid tutorial saves are rejected',()=>{const r=new Run({seed:'NORMAL'});assert.equal(r.tutorial,undefined);const s=T.create().snapshot();s.data.tutorial.stage='forged';assert.throws(()=>Run.restore(s));});
test('free-combat suggestions chain actual costs upward and match engine preview',()=>{
 const r=T.create();r.dungeon.x=2;r.dungeon.y=11;r.enter('tutorial-fight');r.tutorial.stage='combat';
 const b=r.battle;b.previousCost=null;b.combo=0;
 let hint=T.recommendation(r);assert.equal(hint.preview.cost,0);assert.ok(b.play(hint.card.id).ok);
 hint=T.recommendation(r);assert.equal(hint.preview.cost,1);assert.equal(hint.preview.multiplier,2);assert.ok(b.play(hint.card.id).ok);
 hint=T.recommendation(r);assert.equal(hint.preview.cost,2);assert.equal(hint.preview.multiplier,3);
 b.player.mana=0;hint=T.recommendation(r);assert.ok(hint&&hint.preview.payment===0);assert.equal(hint.preview.multiplier,b.cardPreview(hint.card).multiplier);
 b.phase='enemy';assert.equal(T.recommendation(r),null);
});
test('old tutorial saves migrate the turn lesson and keep collected loot',()=>{
 const s=T.create().snapshot();s.data.tutorial.version=1;s.data.tutorial.stage='right';s.data.dungeon.x=4;s.data.dungeon.y=16;s.data.dungeon.dir=3;s.data.dungeon.objects['4,16'].active=false;s.data.gold=160;
 const r=Run.restore(s);assert.equal(r.tutorial.version,3);assert.equal(r.tutorial.stage,'turnWalk');assert.equal(r.gold,160);assert.equal(r.dungeon.objects['4,16'].active,false);D.validate(r.dungeon);assert.ok(r.walk('forward').ok);assert.ok(r.walk('forward').ok);assert.equal(r.tutorial.stage,'right');
});
test('tutorial guardian grants a real level choice and a one-use free card',()=>{
 let r=T.create({seed:'TRAIN-LEVEL'});r.dungeon.x=2;r.dungeon.y=2;r.enter('tutorial-boss');r.tutorial.stage='boss';
 for(let i=0;i<50&&r.phase==='battle';i++){
  const b=r.battle,c=b.piles.hand.find(c=>b.canPlay(c.id).ok&&E.definition(c).kind==='attack');
  if(c)b.play(c.id);else b.endTurn();r.syncExperience();
 }
 assert.equal(r.phase,'levelup');assert.equal(r.level,2);assert.ok(r.levelChoice.choices.length);
 r=resume(r);assert.ok(r.chooseLevelCard(0).ok);const b=r.battle,c=b.piles.hand.find(c=>c.free&&c.rewardFreeTurn===b.turn);assert.ok(c);assert.equal(b.cardPreview(c).payment,0);
 const mana=b.player.mana;assert.ok(b.play(c.id).ok);assert.equal(b.player.mana,mana);assert.equal(c.free,false);assert.equal(c.rewardFreeTurn,undefined);
});

test('tutorial altar allows leaving without deleting or spending the chance',()=>{const r=T.create();r.dungeon.x=2;r.dungeon.y=6;r.tutorial.stage='altarApproach';r.walk('forward');assert.equal(r.phase,'removal');const n=r.deck.length;assert.ok(r.allowTutorial('removalcancel'));assert.ok(r.cancelRemoval());assert.equal(r.deck.length,n);assert.equal(r.dungeon.removalEvent.used,false);assert.equal(r.tutorial.stage,'bossApproach');assert.ok(r.walk('forward').ok);assert.equal(r.phase,'map');});
