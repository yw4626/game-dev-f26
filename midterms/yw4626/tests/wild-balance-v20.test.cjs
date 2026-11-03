'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine'),{Run}=require('../dist/run'),Fx=E.effectsV10;
const wilds=Object.keys(E.catalog.cards).filter(k=>E.catalog.cards[k].costType==='wild');
function fixture(key,{chain=3,on=true,version=20}={}){
 const b=new E.Battle({seed:'WILD20',deck:[key,...Array(24).fill('whip')].map((key,i)=>({id:i+1,key,gems:[]})),enemies:[0,1,2,3].map(i=>({key:'ghost',name:'Target',health:100000,armor:0,slot:{column:i%2,row:Math.floor(i/2)},intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'attack',value:3}]}]})),settings:{wildBalanceVersion:version,friendshipRulesVersion:19,attackRulesVersion:13,wildStrength:on,handLimit:20,dealCount:0,startingMana:20}});
 const all=b.piles.draw;b.piles.hand=[all.find(c=>c.id===1)];b.piles.draw=all.filter(c=>c.id!==1);b.combo=chain-1;b.previousWild=true;Object.assign(b.player,{health:20,maxHealth:60,armor:0,luck:0,greed:20,might:50,amount:2});return b;
}
test('all fifteen Wilds have distinct roles and numerical identities; extracted data stays unchanged',()=>{
 assert.equal(wilds.length,15);assert.equal(new Set(wilds.map(k=>Fx.balance.cards[k].role[0])).size,15);
 assert.equal(E.wildV10.cards.vacuum.drawCount,1);assert.equal(E.wildV10.cards.littleHeart.heal,1);assert.equal(E.wildV10.cards.wildDefence.armor,1);
 assert.equal(Fx.effects(E.definition({key:'vacuum'}),{wildBalanceVersion:20})[0].amount,3);
});
test('every Wild preview is pure and agrees with actual stats, gold, draw and combo at x1/x3/x10',()=>{
 for(const key of wilds)for(const chain of [1,3,10])for(const on of [true,false]){
  const b=fixture(key,{chain,on}),card=b.piles.hand[0],state=b.snapshot(),p=b.cardPreview(card),old={...b.player};assert.deepEqual(b.snapshot(),state,key);
  assert.ok(b.play(card.id).ok,key);assert.equal(b.combo,key==='combo'?chain+2:chain,key);assert.equal(b.previousWild,true,key);
  for(const [stat,field]of [['luck','luckGain'],['greed','greedGain'],['mana','manaGain'],['armor','armor']])assert.equal(b.player[stat]-old[stat],p[field],key+' '+field);
  assert.equal(b.player.health-old.health,p.actualHealGain,key+' healing');assert.equal(b.events.filter(e=>e.type==='draw').length,p.actualDraw,key+' drawing');assert.equal(b.events.filter(e=>e.type==='coins_gain').reduce((s,e)=>s+e.amount,0),p.coinsGain,key+' coins');
  if(p.wildHits)assert.equal(b.events.filter(e=>e.type==='enemy_damage').reduce((s,e)=>s+e.actualLoss,0),p.wildDamage*p.wildHits,key+' damage');
  assert.deepEqual(E.Battle.restore(b.snapshot()).snapshot(),b.snapshot());
 }
});
test('gold, cycling, luck, healing and shield specializations have defined gains',()=>{
 const expected={coinCard:{coinsGain:18,manaGain:1},coinPurse:{coinsGain:36,draw:3},bagOfCoins:{coinsGain:90,greedGain:5},largeBagOfCoins:{coinsGain:180},vacuum:{draw:9},littleClover:{luckGain:45},cloverPetal:{luckGain:15,draw:3},littleHeart:{healGain:15},wildDefence:{armor:9},rawMana:{manaGain:3}};
 for(const [key,values]of Object.entries(expected)){const b=fixture(key),p=b.cardPreview(b.piles.hand[0]);for(const[field,value]of Object.entries(values))assert.equal(p[field],value,key+' '+field);}
 for(const key of ['coinCard','bagOfCoins'])for(const chain of [1,9,99]){const b=fixture(key,{chain}),p=b.cardPreview(b.piles.hand[0]);assert.equal(p[key==='coinCard'?'manaGain':'greedGain'],key==='coinCard'?1:5);}
});
test('draw preview respects full hands, exhausted piles, pending destruction and bonus gems',()=>{
 for(const key of ['vacuum','cloverPetal','coinPurse']){
  const b=fixture(key,{chain:10}),card=b.piles.hand[0];b.piles.hand.push(...b.piles.draw.splice(0,19));let p=b.cardPreview(card);assert.equal(p.actualDraw,1);b.play(1);assert.equal(b.piles.hand.length,20);assert.equal(b.events.filter(e=>e.type==='draw').length,1);
  const short=fixture(key);short.piles.destroyed=short.piles.draw.splice(0);short.piles.combo=[short.piles.destroyed.pop()];short.piles.combo[0].pendingDestroy=true;p=short.cardPreview(short.piles.hand[0]);assert.equal(p.actualDraw,0);short.play(1);assert.equal(short.events.filter(e=>e.type==='draw').length,0);
 }
 const gemmed=fixture('vacuum'),c=gemmed.piles.hand[0];c.gemSlots=1;c.gems=['draw'];gemmed.player.magnet=2;const p=gemmed.cardPreview(c);assert.equal(p.draw,14);assert.equal(p.actualDraw,14);assert.equal(p.gemDraw,3);gemmed.play(c.id);assert.equal(gemmed.events.filter(e=>e.type==='draw').length,14);
});
test('healing preview clamps at missing HP and cannot increase max HP',()=>{
 for(const hp of [59,60]){const b=fixture('littleHeart');b.player.health=hp;const p=b.cardPreview(b.piles.hand[0]);assert.equal(p.healGain,15);assert.equal(p.actualHealGain,60-hp);b.play(1);assert.equal(b.player.health,60);assert.equal(b.player.maxHealth,60);}
});
test("Bracelet preview uses actual banker's rounding with fractional Might",()=>{
 for(const [might,expected]of [[13,23],[12.5,22],[17.5,24]]){const b=fixture('bracelet');b.player.might=might;const p=b.cardPreview(b.piles.hand[0]);assert.equal(p.wildDamage,expected);b.play(1);assert.ok(b.events.filter(e=>e.type==='enemy_damage').every(e=>e.actualLoss===expected));}
});
test('gold and investment persist exactly once across synchronization, victory and reload',()=>{
 let r=new Run({exploration:false});const c=r.makeCard('bagOfCoins');r.deck.push(c);r.enter(r.available()[0].id);let b=r.battle;const all=Object.values(b.piles).flat();for(const k of Object.keys(b.piles))b.piles[k]=[];b.piles.hand=[all.find(x=>x.id===c.id)];b.piles.draw=all.filter(x=>x.id!==c.id);b.player.greed=20;b.combo=2;b.previousWild=true;b.play(c.id);
 const old=r.gold;r=Run.restore(r.snapshot());assert.equal(r.syncExperience(),true);assert.equal(r.gold,old+90);assert.equal(r.battle.player.greed,25);r=Run.restore(r.snapshot());r.syncExperience();assert.equal(r.gold,old+90);
 b=r.battle;b.enemies.forEach(e=>e.health=0);b.phase='victory';r.settleBattle();assert.equal(r.combatSettings().greed,25);assert.equal(Run.restore(r.snapshot()).combatSettings().greed,25);
});
test('legacy saves keep stats and piles; migration only changes future plays and remains idempotent',()=>{
 const r=new Run({exploration:false,wildBalanceVersion:0}),c=r.makeCard('wildDefence');r.deck.push(c);r.enter(r.available()[0].id);const b=r.battle,all=Object.values(b.piles).flat();for(const k of Object.keys(b.piles))b.piles[k]=[];b.piles.hand=all;b.combo=4;b.previousWild=true;
 const old=Run.restore(r.snapshot()),piles=JSON.stringify(old.battle.piles),events=JSON.stringify(old.battle.events),stats=JSON.stringify(old.battle.player);assert.equal(old.enableWildBalanceV20(),true);assert.equal(old.enableWildBalanceV20(),false);assert.equal(JSON.stringify(old.battle.piles),piles);assert.equal(JSON.stringify(old.battle.events),events);assert.equal(JSON.stringify(old.battle.player),stats);assert.equal(old.battle.combo,4);assert.equal(old.battle.cardPreview(old.battle.piles.hand.find(x=>x.id===c.id)).armor,15);
 const legacy=fixture('wildDefence',{version:0});assert.equal(legacy.cardPreview(legacy.piles.hand[0]).armor,3);assert.equal(new Run().combatSettings().wildBalanceVersion,20);
});
test('English and Chinese descriptions show real preview and fixed bonuses without altering original effects',()=>{
 for(const key of wilds)for(const en of [true,false]){const b=fixture(key),card=b.piles.hand[0],def=E.definition(card),p=b.cardPreview(card),lines=Fx.descriptions(def,p.effectMultiplier,en,{settings:b.settings,preview:p,friendshipBonus:p.comboBonus}),notes=Fx.wildNotes(def,p,en);assert.ok(lines.length,key);assert.ok(!/NaN|undefined/.test([...lines,...notes].join(' ')),key);if(key==='coinCard'||key==='bagOfCoins')assert.ok(lines.some(l=>/fixed|固定/.test(l)),key);if(key==='bracelet')assert.ok(lines[0].includes('30 × 17'));if(key==='rosary')assert.ok(notes.some(n=>/resistance|抗性/.test(n)));}
});
