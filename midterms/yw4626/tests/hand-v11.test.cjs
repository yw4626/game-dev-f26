'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),{Battle}=require('../dist/engine.js'),Fx=require('../dist/effects-v10.js'),{fan,capacity}=require('../dist/hand-layout.js');
function start(){const r=new Run({seed:'HAND-V11',exploration:false});for(let i=0;i<30;i++)r.deck.push(r.makeCard('armor'));assert.ok(r.enter(r.available()[0].id).ok);return r;}
test('fan preserves reachable card edges from 1 to 20 at narrow, medium and wide sizes',()=>{
 for(const width of [280,600,1000])for(let count=1;count<=capacity;count++)for(let selected=-1;selected<count;selected++){
  const layout=fan({count,width,cardWidth:174,selected});assert.equal(layout.cards.length,count);
  for(const [i,c]of layout.cards.entries()){assert.ok(c.x>=0);assert.ok(c.x+174<=layout.contentWidth);if(i)assert.ok(c.x-layout.cards[i-1].x>=24);if(i===selected){assert.equal(c.lift,0);assert.equal(c.angle,0);assert.ok(c.order>count);}}
 }
});
test('twenty-card fan overlaps at desktop widths and scrolls instead of shrinking on narrow screens',()=>{
 const wide=fan({count:20,width:1000,cardWidth:174}),narrow=fan({count:20,width:320,cardWidth:174});
 assert.ok(wide.step<174);assert.equal(wide.contentWidth,1000);assert.ok(narrow.contentWidth>320);assert.ok(narrow.step>=36);
});
test('new runs use 20 capacity but retain starting draw and mana in both profiles',()=>{
 for(const profile of ['base','demo']){const r=new Run({profile}),settings=r.combatSettings();assert.equal(settings.handLimit,20);assert.equal(settings.handLimitCeiling,20);assert.equal(settings.dealCount,profile==='base'?3:5);assert.equal(settings.startingMana,profile==='base'?2:3);}
});
test('draw fills twenty slots and leaves overflow cards in the draw pile',()=>{
 const r=start(),b=r.battle;const initial=b.piles.hand.length,n=b.piles.draw.length;
 assert.equal(b.draw(100),20-initial);assert.equal(b.piles.hand.length,20);assert.equal(b.piles.draw.length,n-(20-initial));assert.equal(b.draw(1),0);
 assert.equal(new Set(Object.values(b.piles).flat().map(c=>c.id)).size,b.cardCount);
});
test('resolving a draw card frees one slot, without losing an overflow card',()=>{
 const r=start(),b=r.battle;b.draw(100);const card=b.piles.hand[0],n=b.piles.draw.length;b.resolvingCard=card.id;
 assert.equal(b.draw(5),1);assert.equal(b.piles.hand.length,21);assert.equal(b.piles.draw.length,n-1);
 b.piles.hand=b.piles.hand.filter(c=>c.id!==card.id);b.piles.combo.push(card);b.resolvingCard=null;assert.equal(b.piles.hand.length,20);
});
test('growth carts increase requested draw past seven, independently from hand capacity',()=>{
 const r=new Run();r.growth.deal=10;assert.equal(r.combatSettings().dealCount,15);assert.equal(r.combatSettings().handLimit,20);
 r.growth.deal=100;assert.equal(r.combatSettings().dealCount,20);
});
test('deal effects do not reduce an expanded hand back to the old seven-card cap',()=>{
 const r=start(),b=r.battle;Fx.stat(b,b.piles.hand[0],'dealCount',3);assert.equal(b.settings.handLimit,20);assert.equal(b.settings.dealCount,8);
});
test('old v10 save expansion is explicit, idempotent and preserves existing cards',()=>{
 const r=start();delete r.handRulesVersion;r.growth.deal=10;r.battle.settings.handLimit=7;r.battle.settings.dealCount=7;delete r.battle.settings.handLimitCeiling;
 const restored=Run.restore(r.snapshot()),ids=Object.values(restored.battle.piles).flat().map(c=>c.id);assert.equal(restored.battle.settings.handLimit,7);
 assert.equal(restored.enableExpandedHand(),true);assert.equal(restored.battle.settings.handLimit,20);assert.equal(restored.battle.settings.dealCount,15);assert.deepEqual(Object.values(restored.battle.piles).flat().map(c=>c.id),ids);
 assert.equal(restored.enableExpandedHand(),false);assert.equal(restored.battle.settings.dealCount,15);assert.deepEqual(Run.restore(restored.snapshot()).snapshot(),restored.snapshot());
});
test('twenty-card live hand survives save and restore without truncation',()=>{const r=start();r.battle.draw(100);const restored=Run.restore(r.snapshot());assert.equal(restored.battle.piles.hand.length,20);assert.deepEqual(restored.snapshot(),r.snapshot());});
test('explicit legacy rule runs preserve their existing hand limits',()=>{const r=new Run({combatVersion:9,profile:'base'});assert.equal(r.combatSettings().handLimit,4);assert.equal(r.enableExpandedHand(),false);});
test('draw card combo preview and actual new draws agree when more than seven cards can be held',()=>{
 const r=start(),b=r.battle,card=r.makeCard('draw');b.cardCount++;b.piles.hand.push(card);b.combo=2;b.previousWild=true;
 assert.equal(b.cardPreview(card).draw,3);const count=b.piles.hand.length;assert.ok(b.play(card.id).ok);assert.equal(b.piles.hand.length,count-1+3);
});
