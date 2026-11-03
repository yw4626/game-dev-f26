'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine.js');
function fixture(resistance=0){
 const deck=['clockLancet','knife','clockLancet','armor'].map((key,i)=>({id:i+1,key,level:0,gems:[]}));
 const b=new E.Battle({seed:'LANCET-REGRESSION',deck,enemies:[{key:'ghost',name:'Target',health:100,freezeResistance:resistance,slot:{row:0,column:0},intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'attack',value:7}]}]}],settings:{attackRulesVersion:13,dealCount:0,health:100,startingMana:100}});
 b.piles.hand=b.piles.draw.splice(0);return b;
}
test('Clock Lancet freezes without damage and suppresses the enemy turn',()=>{
 const b=fixture();assert.ok(b.play(1).ok);assert.equal(b.enemies[0].health,100);assert.equal(b.enemies[0].freezeStacks,1);assert.equal(b.enemies[0].intent,null);b.endTurn();assert.equal(b.player.health,100);assert.equal(b.enemies[0].freezeStacks,0);assert.ok(b.enemies[0].intent);
});
test('Clock Lancet combo adds freezing shots without consuming existing stacks',()=>{
 const b=fixture();b.combo=2;b.previousWild=true;assert.equal(b.cardPreview(b.piles.hand.find(c=>c.id===1)).hits,3);b.play(1);assert.equal(b.enemies[0].freezeStacks,3);assert.equal(b.events.filter(e=>e.type==='freeze').length,3);assert.equal(b.events.filter(e=>e.type==='freeze_consumed').length,0);
});
test('Attacking a Lancet-frozen target doubles damage and restores its intent',()=>{
 const b=fixture();b.play(1);const c=b.piles.hand.find(c=>c.id===2),d=E.definition(c);E.effectsV10.hit(b,c,d,b.enemies[0],5,{wave:1,hit:1});assert.equal(b.enemies[0].health,90);assert.equal(b.enemies[0].freezeStacks,0);assert.ok(b.enemies[0].intent);b.endTurn();assert.equal(b.player.health,93);
});
test('Freeze resistance prevents Lancet status, reports resistance and preserves action',()=>{
 const b=fixture(100);b.play(1);assert.equal(b.enemies[0].freezeStacks||0,0);assert.ok(b.enemies[0].intent);assert.equal(b.events.filter(e=>e.type==='freeze_resisted').length,1);b.endTurn();assert.equal(b.player.health,93);
});
test('Lancet description states freeze, extra shots and the unfreezing tradeoff',()=>{
 const d=E.definition({key:'clockLancet',level:0}),s=E.specials.describe(d,{multiplier:3,en:true,rulesVersion:13});assert.match(s.lines.join(' '),/Combo adds shots/);assert.match(s.lines.join(' '),/restoring the intent/);assert.match(s.compact,/Freeze/);
});
