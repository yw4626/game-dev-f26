'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Battle,catalog,roundEven,cost,damageProfile,resolveEnemyHit,selectIntent,rng}=require('../dist/engine.js');
function fixture(keys) {
  const b=new Battle();
  const all=Object.values(b.piles).flat();b.piles={hand:[],draw:[],discard:[],combo:[]};
  for(const key of keys){const i=all.findIndex(c=>c.key===key);assert.ok(i>=0);b.piles.hand.push(...all.splice(i,1));}
  b.piles.draw=all;b.player.mana=3;b.combo=0;b.previousCost=null;b.events=[];b.eventId=0;b.actions=[];
  return b;
}
function conserved(b) {
  const cards=Object.values(b.piles).flat();assert.equal(cards.length,14);assert.equal(new Set(cards.map(c=>c.id)).size,14);
  assert.ok(b.player.health>=0&&b.player.mana>=0&&b.player.armor>=0);
  for(const e of b.enemies)assert.ok(e.health>=0&&e.armor>=0);
}

test('catalog uses the extracted zero-upgrade values and exact enemy weights',()=>{
  assert.deepEqual([catalog.cards.wand.cost,catalog.cards.wand.baseDamage,catalog.cards.wand.baseAmount],[0,30,1]);
  assert.deepEqual([catalog.cards.fire.cost,catalog.cards.fire.baseDamage,catalog.cards.fire.baseAmount],[1,15,3]);
  assert.deepEqual([catalog.enemies.ghost.health,...catalog.enemies.ghost.intents.map(i=>i.weight)],[100,70,30]);
  assert.deepEqual([catalog.enemies.lion.health,...catalog.enemies.lion.intents.map(i=>i.actions[0].value)],[170,2,34]);
});
test('bankers rounding includes positive and negative ties',()=>{assert.deepEqual([2.5,3.5,4.5,-2.5,-3.5].map(roundEven),[2,4,4,-2,-4]);});
test('base profile starts with extracted 50 HP / 2 mana / 3 draws',()=>{
  const b=new Battle({profile:'base'});assert.equal(b.player.health,50);assert.equal(b.player.mana,2);assert.equal(b.piles.hand.length,3);conserved(b);
});
test('insufficient mana rejects atomically; no effects, RNG or events change',()=>{
  const b=fixture(['cross']);b.player.mana=1;const before=JSON.stringify(b.export());assert.equal(b.play(b.piles.hand[0].id).ok,false);assert.equal(JSON.stringify(b.export()),before);conserved(b);
});
test('card not in hand and enemy phase both reject play without mutation',()=>{
  const b=fixture(['whip']);assert.equal(b.play(1000).ok,false);b.beginEnemyTurn();const before=JSON.stringify(b.export());assert.equal(b.play(1).ok,false);assert.equal(JSON.stringify(b.export()),before);
});
test('0 -> 1 -> 2 combo uses pre-update multiplier and charges 3 total',()=>{
  const b=fixture(['whip','fire','cross']),ids=b.piles.hand.map(c=>c.id);
  assert.equal(b.play(ids[0]).ok,true);assert.equal(b.combo,1);
  assert.deepEqual(b.cardPreview(b.piles.hand[0]).hits,6);
  b.play(ids[1]);assert.equal(b.combo,2);assert.equal(b.player.mana,2);
  b.play(ids[2]);assert.equal(b.combo,3);assert.equal(b.player.mana,0);
  assert.deepEqual(b.events.filter(e=>e.type==='payment').map(e=>e.payment),[0,1,2]);conserved(b);
});
test('chain break moves previous combo cards to discard and restarts at one',()=>{
  const b=fixture(['fire','whip']);const [a,c]=b.piles.hand;b.play(a.id);b.play(c.id);assert.equal(b.combo,1);assert.equal(b.previousCost,0);assert.ok(b.piles.discard.some(x=>x.id===a.id));conserved(b);
});
test('free payment remains separate from combo cost',()=>{
  const b=fixture(['whip','fire']);const [a,c]=b.piles.hand;c.free=true;b.play(a.id);assert.equal(cost(c,b.player.mana),0);assert.equal(cost(c,b.player.mana,true),1);b.play(c.id);assert.equal(b.player.mana,3);assert.equal(b.combo,2);conserved(b);
});
test('signed modifiers permit negative payment and restore mana',()=>{
  const b=fixture(['armor']);const c=b.piles.hand[0];c.modifiers=[0,0,-3,0];assert.equal(cost(c,b.player.mana),-2);b.play(c.id);assert.equal(b.player.mana,5);assert.equal(b.player.armor,4);
});
test('normal damage applies Might and hit-count combo independently',()=>{
  const p={might:50,amount:1};assert.deepEqual(damageProfile(catalog.cards.fire,p,3),{damage:22,hits:10});
  assert.deepEqual(damageProfile({...catalog.cards.fire,damageScalesWithCombo:true,damageScalesWithAmount:true},p,3),{damage:90,hits:9});
});
test('enemy armor, HP and overkill resolve one hit at a time',()=>{
  const e={health:10,armor:3};const first=resolveEnemyHit(e,8);assert.deepEqual([e.health,e.armor,first.overkill],[5,0,0]);const second=resolveEnemyHit(e,8);assert.deepEqual([e.health,second.healthDamage,second.actualLoss,second.overkill],[0,8,5,3]);
});
test('captured Ghost overkill example matches',()=>{
  const e={health:26.83999939024448,armor:0};const r=resolveEnemyHit(e,62);assert.equal(e.health,0);assert.equal(r.overkill,35.16000060975552);
});
test('chosen target receives first hit; remaining hits retarget after death',()=>{
  const b=fixture(['fire']);b.enemies[1].health=5;b.chooseTarget(2);b.play(b.piles.hand[0].id);
  const hits=b.events.filter(e=>e.type==='enemy_damage');assert.equal(hits[0].enemyId,2);assert.equal(hits[1].enemyId,1);assert.equal(b.enemies[1].health,0);conserved(b);
});
test('recycling preserves existing top cards before recycled ordinary cards',()=>{
  const b=fixture([]);const all=b.piles.draw;b.piles.draw=[all[0]];b.piles.discard=all.slice(1);const top=b.piles.draw[0];b.draw(3);assert.equal(b.piles.hand[0].id,top.id);assert.equal(b.piles.discard.length,0);conserved(b);
});
test('draw shortage also recycles combo pile without resetting numeric combo',()=>{
  const b=fixture([]);b.piles.combo=b.piles.draw;b.piles.draw=[];b.combo=3;b.previousCost=2;b.draw(2);assert.equal(b.combo,3);assert.equal(b.piles.hand.length,2);assert.equal(b.piles.combo.length,0);conserved(b);
});
test('hand cap stops drawing and leaves remainder intact',()=>{
  const b=fixture(['whip','fire','cross']);b.settings.handLimit=4;const count=b.piles.draw.length;assert.equal(b.draw(5),1);assert.equal(b.piles.draw.length,count-1);assert.equal(b.piles.hand.length,4);conserved(b);
});
test('playing draw card at hand cap temporarily frees its own slot',()=>{
  const b=fixture(['draw','whip','fire']);b.settings.handLimit=3;const c=b.piles.hand[0];b.play(c.id);assert.equal(b.piles.hand.length,3);assert.equal(b.piles.combo[0].id,c.id);conserved(b);
});
test('combo draw uses multiplier; no unsupported extra draw is invented',()=>{
  const b=fixture(['whip','draw']);const [whip,orb]=b.piles.hand;b.play(whip.id);b.play(orb.id);assert.equal(b.events.filter(e=>e.type==='draw').length,2);assert.equal(b.events.filter(e=>e.type==='draw_request').length,1);conserved(b);
});
test('empty available deck returns partial draw without duplicating cards',()=>{
  const b=fixture([]);b.piles.hand=b.piles.draw.splice(1);b.settings.handLimit=30;assert.equal(b.draw(3),1);assert.equal(b.piles.draw.length,0);conserved(b);
});
test('intent selection filters repeat restrictions and honors weighted boundaries',()=>{
  const options=[{id:1,weight:70,consecutive:false},{id:2,weight:30,consecutive:true}];
  assert.equal(selectIntent(options,null,()=>.6999).id,1);assert.equal(selectIntent(options,null,()=>.7).id,2);assert.equal(selectIntent(options,1,()=>0).id,2);
  assert.equal(selectIntent([{id:1,weight:1,consecutive:true},{id:2,weight:1,consecutive:true,priority:true}],null,()=>0,true).id,2);
});
test('selected intent is retained during player turn and executed in reverse enemy order',()=>{
  const b=fixture(['armor']);const selected=b.enemies.map(e=>e.intent);b.play(b.piles.hand[0].id);assert.deepEqual(b.enemies.map(e=>e.intent),selected);
  b.beginEnemyTurn();while(b.phase==='enemy')b.resolveNextEnemy();assert.deepEqual(b.events.filter(e=>e.type==='enemy_action').map(e=>e.enemyId),[3,2,1]);conserved(b);
});
test('captured player damage example: 10 damage consumes 9 armor then 1 HP',()=>{
  const b=fixture([]);b.player.health=55;b.player.armor=9;b.beginEnemyTurn();b.enemyQueue=[1];b.enemies[0].intent={id:0,actions:[{kind:'attack',value:10}]};b.resolveNextEnemy();assert.equal(b.player.armor,0);assert.equal(b.player.health,54);
});
test('fully absorbed hit preserves HP; enemy armor persists into next turn',()=>{
  const b=fixture([]);b.player.armor=9;b.beginEnemyTurn();b.enemyQueue=[1];b.enemies[0].intent={id:0,actions:[{kind:'attack',value:1},{kind:'armor',value:15}]};b.resolveNextEnemy();assert.equal(b.player.health,50);assert.equal(b.player.armor,8);assert.equal(b.enemies[0].armor,15);b.resolveNextEnemy();assert.equal(b.enemies[0].armor,15);assert.equal(b.player.armor,0);
});
test('end turn discards hand and combo then resets mana, not adds it',()=>{
  const b=fixture(['whip','draw']);b.play(b.piles.hand[0].id);b.player.mana=1;b.player.armor=100;
  b.beginEnemyTurn();assert.equal(b.piles.hand.length,0);assert.equal(b.piles.combo.length,0);assert.equal(b.combo,0);assert.equal(b.beginEnemyTurn(),false);
  while(b.phase==='enemy')b.resolveNextEnemy();assert.equal(b.player.mana,3);assert.equal(b.player.armor,0);assert.equal(b.piles.hand.length,5);assert.equal(b.turn,2);conserved(b);
});
test('dead enemies are skipped and defeat stops remaining enemy actions',()=>{
  const b=fixture([]);b.enemies[0].health=0;b.player.health=1;b.enemies[2].intent={id:0,actions:[{kind:'attack',value:10}]};b.endTurn();assert.equal(b.phase,'defeat');assert.equal(b.player.health,0);assert.equal(b.events.filter(e=>e.type==='enemy_action').length,1);assert.equal(b.turn,1);assert.equal(b.endTurn(),false);
});
test('victory blocks any additional enemy turn',()=>{
  const b=fixture(['fire']);b.enemies.forEach(e=>e.health=1);b.play(b.piles.hand[0].id);assert.equal(b.phase,'victory');assert.equal(b.endTurn(),false);conserved(b);
});
test('same seed plus recorded actions exactly replays battle events',()=>{
  const a=new Battle({seed:'REPLAY'});for(let t=0;t<5&&a.phase==='player';t++){for(const c of [...a.piles.hand])if(a.canPlay(c.id).ok)a.play(c.id);if(a.phase==='player')a.endTurn();}
  const b=new Battle({seed:'REPLAY'});for(const action of a.actions){if(action.type==='play'){b.chooseTarget(action.target);assert.ok(b.play(action.cardId).ok);}else b.endTurn();}assert.deepEqual(a.export(),b.export());
});
test('100 seeded complete games conserve all 14 unique cards, terminate, and keep valid resources',()=>{
  const results={victory:0,defeat:0};
  for(let i=0;i<100;i++){
    const b=new Battle({seed:'SIM-'+i,profile:i%2?'demo':'base'}),random=rng('policy-'+i);let steps=0;
    // Every tenth policy deliberately passes to exercise natural defeat as well as victory.
    while(b.phase==='player'&&steps++<1000){conserved(b);const available=b.piles.hand.filter(c=>b.canPlay(c.id).ok);if(i%10!==0&&available.length&&random()>.12)b.play(available[Math.floor(random()*available.length)].id);else b.endTurn();}
    conserved(b);assert.ok(['victory','defeat'].includes(b.phase),'Simulation must reach a terminal outcome');results[b.phase]++;
  }
  assert.ok(results.victory>0);assert.ok(results.defeat>0);
});
