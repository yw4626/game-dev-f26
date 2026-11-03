'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run:RunEngine}=require('../dist/run.js');
// Preserve the v0.2 economy/combat regression suite; dungeon traversal is tested separately.
class Run extends RunEngine {constructor(options={}){super({...options,exploration:false,legacyProgression:true});}}
const {Battle,definition,damageProfile}=require('../dist/engine.js');
const clone=x=>JSON.parse(JSON.stringify(x));
function fight(run,pass=false){
  let steps=0;const b=run.battle;
  while(['player','enemy'].includes(b.phase)&&steps++<2000){
    if(b.phase==='enemy'){b.resolveNextEnemy();continue;}
    const cards=b.piles.hand.filter(c=>b.canPlay(c.id).ok).map(c=>({c,p:b.cardPreview(c),d:definition(c)}));
    cards.sort((a,z)=>{
      const score=x=>(x.p.continues?20:0)+(x.d.kind==='attack'?x.p.damage*x.p.hits:x.d.kind==='draw'&&b.piles.hand.length<6?40:5)-(x.p.payment*3);
      return score(z)-score(a);
    });
    if(!pass&&cards.length)b.play(cards[0].c.id);else b.endTurn();
    const all=Object.values(b.piles).flat();assert.equal(all.length,run.deck.length);assert.equal(new Set(all.map(c=>c.id)).size,all.length);
  }
  assert.ok(steps<2000,'battle must terminate');assert.ok(run.settleBattle());
}
function winFixture(r){const b=r.battle;b.enemies.forEach(e=>e.health=0);b.phase='victory';return r.settleBattle();}
function room(r,type){
  // Traverse only legal nodes, using a terminal fixture for unrelated battles.
  for(let i=0;i<30;i++){
    if(r.phase===type)return;
    if(r.phase==='map'){const choices=r.available();r.enter((choices.find(n=>n.type===type)||choices[0]).id);}
    else if(r.phase==='battle')winFixture(r);
    else if(r.phase==='reward')r.claimReward(-1);
    else if(r.phase==='gate')r.nextFloor();
    else if(r.phase==='treasure')r.openTreasure('gold');
    else if(['camp','shop'].includes(r.phase))r.leave();
    else break;
  }
  assert.equal(r.phase,type);
}
test('new run starts on map with persistent inventory and legal first room',()=>{
  const r=new Run();assert.equal(r.phase,'map');assert.equal(r.deck.length,14);assert.equal(r.gold,60);assert.equal(r.available().length,1);assert.equal(r.available()[0].type,'battle');
  assert.equal(r.enter('1-4-0').ok,false);assert.equal(r.stage,-1);
});
test('completed rooms cannot be re-entered or farmed and alternate branch locks',()=>{
  const r=new Run();r.enter(r.available()[0].id);winFixture(r);r.claimReward(-1);const first=r.completed[0];assert.equal(r.enter(first).ok,false);
  const next=r.available(),chosen=next.find(n=>n.type==='treasure'),other=next.find(n=>n.type!=='treasure');r.enter(chosen.id);r.openTreasure('gold');assert.equal(r.enter(other.id).ok,false);assert.equal(r.stage,1);
});
test('battle starts with run HP, max HP and upgraded card instances',()=>{
  const r=new Run();r.health=23;r.maxHealth=55;r.deck[0].level=2;r.enter(r.available()[0].id);assert.equal(r.battle.player.health,23);assert.equal(r.battle.player.maxHealth,55);assert.equal(Object.values(r.battle.piles).flat().find(c=>c.id===1).level,2);
});
test('victory settles gold once, card reward once, and carries health',()=>{
  const r=new Run();r.enter(r.available()[0].id);r.battle.player.health=31;winFixture(r);assert.equal(r.health,31);assert.equal(r.gold,85);assert.equal(r.phase,'reward');assert.equal(r.settleBattle(),false);assert.equal(r.gold,85);
  const before=r.deck.length;r.claimReward(0);assert.equal(r.deck.length,before+1);assert.equal(r.claimReward(0).ok,false);assert.equal(r.deck.length,before+1);
});
test('reward can be skipped without changing deck, and invalid indexes do nothing',()=>{
  const r=new Run();r.enter(r.available()[0].id);winFixture(r);const state=JSON.stringify(r.snapshot());assert.equal(r.claimReward(9).ok,false);assert.equal(JSON.stringify(r.snapshot()),state);r.claimReward(-1);assert.equal(r.deck.length,14);assert.equal(r.phase,'map');
});
test('shop rejects insufficient gold and double purchase atomically',()=>{
  const r=new Run();room(r,'shop');const o=r.shop.offers[0];r.gold=o.price-1;const before=JSON.stringify(r.snapshot());assert.equal(r.buy(o.id).ok,false);assert.equal(JSON.stringify(r.snapshot()),before);
  r.gold=100;assert.ok(r.buy(o.id).ok);assert.equal(r.gold,100-o.price);const n=r.deck.length;assert.equal(r.buy(o.id).ok,false);assert.equal(r.deck.length,n);
});
test('healing is capped, charged once, and unavailable at full health',()=>{
  const r=new Run();room(r,'shop');const gold=r.gold;assert.equal(r.buyHeal().ok,false);assert.equal(r.gold,gold);r.health=46;assert.ok(r.buyHeal().ok);assert.equal(r.health,50);assert.equal(r.gold,gold-25);assert.equal(r.buyHeal().ok,false);
});
test('upgrade affects only selected copy and exact extracted attack level',()=>{
  const r=new Run();room(r,'shop');r.gold=200;const wands=r.deck.filter(c=>c.key==='wand');r.upgrade(wands[0].id);assert.equal(wands[0].level,1);assert.equal(wands[1].level,0);assert.equal(r.gold,155);
  assert.deepEqual([definition(wands[0]).baseDamage,definition(wands[0]).baseAmount],[30,2]);
  r.upgrade(wands[0].id);assert.equal(r.gold,90);assert.equal(wands[0].level,2);assert.equal(r.upgrade(wands[0].id).ok,false);assert.equal(r.gold,90);
});
test('support upgrades change actual draw and armor effects',()=>{
  const r=new Run();room(r,'camp');const c=r.deck.find(c=>c.key==='draw');r.upgrade(c.id);assert.equal(definition(c).drawCount,2);
  const b=new Battle({deck:r.deck});const all=Object.values(b.piles).flat();const picked=all.find(x=>x.id===c.id);b.piles={hand:[picked],draw:all.filter(x=>x.id!==c.id),discard:[],combo:[]};b.play(c.id);assert.equal(b.piles.hand.length,2);
  assert.equal(definition({key:'armor',level:2}).armor,10);
});
test('unsupported-only upgrade does not consume coins or a camp action',()=>{
  const r=new Run();room(r,'camp');const c=r.deck.find(c=>c.key==='axe'),before=JSON.stringify(r.snapshot());assert.equal(r.canUpgrade(c),false);assert.equal(r.upgrade(c.id).ok,false);assert.equal(JSON.stringify(r.snapshot()),before);
  let axes=0;
  for(let seed=0;seed<40;seed++){
    const s=new Run({seed:'NO-EMPTY-UPGRADE-'+seed});s.floor=2;
    const offers=s.makeShop({id:'2-2-0'}).offers;
    for(const offer of offers)if(offer.key==='axe'){axes++;assert.equal(offer.level,0);assert.equal(offer.price,35);}
    room(s,'battle');s.current=s.maps[1].find(n=>n.type==='boss').id;winFixture(s);
    for(const offer of s.reward.choices)if(offer.key==='axe')assert.equal(offer.level,0);
  }
  assert.ok(axes>0);
});
test('camp rest or free upgrade consumes exactly one room action',()=>{
  const r=new Run();room(r,'camp');r.health=20;const gold=r.gold;r.rest();assert.equal(r.health,38);assert.equal(r.gold,gold);assert.equal(r.rest().ok,false);assert.equal(r.upgrade(r.deck[0].id).ok,false);
  const s=new Run();room(s,'camp');const before=s.gold;assert.ok(s.upgrade(s.deck[0].id).ok);assert.equal(s.phase,'map');assert.equal(s.gold,before);assert.equal(s.upgrade(s.deck[1].id).ok,false);
});
test('shop card removal preserves IDs and cannot exceed service or minimum limits',()=>{
  const r=new Run();room(r,'shop');r.gold=100;const id=r.deck[0].id;assert.ok(r.removeCard(id).ok);assert.equal(r.deck.length,13);assert.equal(r.gold,70);assert.equal(r.removeCard(r.deck[0].id).ok,false);assert.ok(!r.deck.some(c=>c.id===id));
  r.shop.removed=false;r.deck=r.deck.slice(0,8);assert.equal(r.removeCard(r.deck[0].id).ok,false);assert.equal(r.gold,70);
});
test('treasure choices are mutually exclusive and permanently carried',()=>{
  const r=new Run();room(r,'treasure');const gold=r.gold;r.openTreasure('vitality');assert.equal(r.maxHealth,55);assert.equal(r.health,55);assert.equal(r.gold,gold);assert.equal(r.openTreasure('gold').ok,false);assert.equal(r.gold,gold);
});
test('leaving shop is always possible even with no gold',()=>{const r=new Run();room(r,'shop');r.gold=0;assert.ok(r.leave());assert.equal(r.phase,'map');assert.equal(r.available().length,2);});
test('gate requires guardian win and reward resolution, and preserves growth',()=>{
  const r=new Run();assert.equal(r.nextFloor(),false);room(r,'gate');r.health=20;r.maxHealth=55;r.deck[0].level=1;const gold=r.gold;r.nextFloor();assert.equal(r.floor,2);assert.equal(r.health,28);assert.equal(r.maxHealth,55);assert.equal(r.deck[0].level,1);assert.equal(r.gold,gold);assert.equal(r.stage,-1);assert.equal(r.available()[0].floor,2);
});
test('save restores reward without rerolling or granting coins again',()=>{
  const r=new Run();r.enter(r.available()[0].id);winFixture(r);const restored=Run.restore(clone(r.snapshot()));assert.deepEqual(restored.reward,r.reward);assert.equal(restored.gold,r.gold);assert.equal(restored.settleBattle(),false);restored.claimReward(1);assert.equal(restored.deck.length,15);
});
test('save restores shop inventory, service use and card upgrades',()=>{
  const r=new Run();room(r,'shop');r.gold=250;r.buy(0);r.upgrade(r.deck[0].id);r.health=40;r.buyHeal();const restored=Run.restore(clone(r.snapshot()));assert.deepEqual(restored.snapshot(),r.snapshot());assert.equal(restored.buy(0).ok,false);assert.equal(restored.buyHeal().ok,false);
});
test('mid-enemy-turn save resumes remaining enemies without duplicate hits or draws',()=>{
  const r=new Run();r.enter(r.available()[0].id);r.battle.beginEnemyTurn();r.battle.resolveNextEnemy();const restored=Run.restore(clone(r.snapshot()));
  while(r.battle.phase==='enemy')r.battle.resolveNextEnemy();while(restored.battle.phase==='enemy')restored.battle.resolveNextEnemy();assert.deepEqual(restored.battle.export(),r.battle.export());
  for(let i=0;i<3;i++){r.battle.endTurn();restored.battle.endTurn();}assert.deepEqual(restored.battle.export(),r.battle.export());
});
test('saved player turn preserves draw RNG through later recycling',()=>{
  const r=new Run();r.enter(r.available()[0].id);r.battle.endTurn();const restored=Run.restore(clone(r.snapshot()));
  for(let i=0;i<5;i++){r.battle.endTurn();restored.battle.endTurn();}assert.deepEqual(restored.battle.export(),r.battle.export());
});
test('invalid and old save schemas fail explicitly',()=>{
  assert.throws(()=>Run.restore({format:'v1'}));const r=new Run();const s=r.snapshot();s.data.deck[0].key='not-a-card';assert.throws(()=>Run.restore(s));const t=r.snapshot();t.data.gold=-1;assert.throws(()=>Run.restore(t));
});
test('passive play loses the entire run; it cannot collect rewards or progress',()=>{
  const r=new Run();r.enter(r.available()[0].id);fight(r,true);assert.equal(r.phase,'lost');assert.equal(r.health,0);assert.equal(r.claimReward(0).ok,false);assert.equal(r.nextFloor(),false);assert.equal(r.available().length,0);assert.equal(r.settleBattle(),false);
});
test('20 seeded end-to-end journeys exercise battles, rewards, shops, upgrades and all three floors',()=>{
  const endings={won:0,lost:0};let shopVisits=0,campVisits=0;
  for(let seed=0;seed<20;seed++){
    let r=new Run({seed:'JOURNEY-'+seed});let steps=0;
    while(!['won','lost'].includes(r.phase)&&steps++<100){
      if(r.phase==='map'){
        const choices=r.available(),preferred=r.health<32?'camp':seed%2?'camp':'shop';const n=choices.find(x=>x.type===preferred)||choices.find(x=>x.type==='treasure')||choices.find(x=>x.type==='battle')||choices[0];assert.ok(r.enter(n.id).ok);
      }else if(r.phase==='battle')fight(r);
      else if(r.phase==='reward')r.claimReward(-1);
      else if(r.phase==='shop'){shopVisits++;if(r.health<35)r.buyHeal();const c=r.deck.filter(c=>c.level<2&&definition(c).kind==='attack').sort((a,b)=>definition(b).baseDamage-definition(a).baseDamage)[0];if(c)r.upgrade(c.id);r.leave();}
      else if(r.phase==='camp'){campVisits++;if(r.health<25)r.rest();else{const c=r.deck.find(c=>c.key==='wand'&&c.level<2)||r.deck.find(c=>c.level<2);c?r.upgrade(c.id):r.leave();}}
      else if(r.phase==='treasure')r.openTreasure('vitality');else if(r.phase==='gate')r.nextFloor();
      assert.ok(r.gold>=0);assert.equal(new Set(r.deck.map(c=>c.id)).size,r.deck.length);
      r=Run.restore(clone(r.snapshot())); // Every boundary also exercises persistence.
    }
    assert.ok(steps<100);endings[r.phase]++;if(r.phase==='won'){assert.equal(r.floor,3);assert.ok(r.completed.includes('3-4-0'));assert.equal(r.stats.rooms,15);}
  }
  assert.ok(endings.won>0,'At least one complete seed must be winnable');assert.ok(shopVisits>0&&campVisits>0);
  console.log('Journey outcomes:',endings,'shops',shopVisits,'camps',campVisits);
});
