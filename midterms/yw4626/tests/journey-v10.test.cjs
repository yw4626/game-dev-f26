'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js'),E=require('../dist/engine.js');
function route(d,target){const seen=new Set([D.key(d.x,d.y)]),q=[[d.x,d.y,[]]];for(let i=0;i<q.length;i++){const[x,y,path]=q[i];if(D.key(x,y)===target)return path;for(let dir=0;dir<4;dir++){const v=D.dirs[dir],nx=x+v.x,ny=y+v.y,k=D.key(nx,ny);if(!seen.has(k)&&D.canTraverse(d,x,y,nx,ny)){seen.add(k);q.push([nx,ny,[...path,dir]]);}}}throw Error('unreachable '+target);}
function value(key){const d=E.definition({key}),p=d.kind==='attack'?E.attackSummary(d):{};return d.kind==='attack'?(p.totalDamage||0)/(d.cost+1):d.kind==='mana'?25:d.kind==='draw'?30:d.kind==='might'?15:d.kind==='amount'?30:5;}
function best(choices){return choices.reduce((best,c,i,a)=>value(c.key)>value(a[best].key)?i:best,0);}
function journey(profile,character){
 let r=new Run({seed:'FIVE-PLAY-0',combatVersion:10,profile,character}),floor=0,target=0,steps=0,moves=0,levels=0,reloads=0;const bosses=[],dimensions=[];
 const targets=['treasure','shop','camp','boss'];
 while(!['won','lost'].includes(r.phase)&&steps++<15000){
  if(r.floor!==floor){floor=r.floor;target=0;dimensions.push(r.dungeon.grid.length);assert.equal(r.dungeon.grid.length,10+floor*2);D.validate(r.dungeon);for(const k of Object.keys(r.dungeon.rooms))route(r.dungeon,k);}
  if(r.phase==='battle'){
   const b=r.battle;if(b.phase==='player'){
    const score=c=>{const p=b.cardPreview(c);return (p.character?1000:0)+(p.wildcard?800:0)+(p.totalDamage||p.damage*p.hits||0)+(p.draw||0)*20+(p.manaGain||0)*20+(p.mightGain||0)*3+(p.amountGain||0)*30+(p.armor||0)-(p.payment||0);};
    const c=b.piles.hand.filter(c=>b.canPlay(c.id).ok).sort((a,z)=>score(z)-score(a))[0];if(c)assert.ok(b.play(c.id).ok);else assert.ok(b.endTurn());
   }else if(b.phase==='enemy')b.resolveNextEnemy();r.syncExperience();r.settleBattle();
  }else if(r.phase==='levelup'){assert.ok(r.chooseLevelCard(best(r.levelChoice.choices)).ok);levels++;}
  else if(r.phase==='bossreward'){bosses.push(r.floor);assert.ok(r.floor<5);assert.ok(r.chooseBossReward('card').ok);}
  else if(r.phase==='bosscard'){assert.ok(r.claimBossCard(best(r.bossReward.cards)).ok);assert.equal(r.chooseBossReward('gem').ok,false);}
  else if(r.phase==='evolution'){if(r.evolution.choices.length)assert.ok(r.fuse(0).ok);else assert.ok(r.skipEvolution().ok);}
  else if(r.phase==='gem')assert.ok(r.cancelGem());
  else if(r.phase==='treasure')assert.ok(r.openTreasure('vitality').ok);
  else if(r.phase==='shop'){const wild=r.shop.offers.find(o=>o.key==='cloverPetal'&&!o.sold);if(wild)r.buy(wild.id);if(r.health<r.maxHealth-10)r.buyHeal();const offer=r.shop.offers.filter(o=>!o.sold&&r.gold>=o.price).sort((a,z)=>value(z.key)-value(a.key))[0];if(offer)r.buy(offer.id);r.leave();}
  else if(r.phase==='camp')r.rest();
  else if(r.phase==='digging')assert.ok(r.digStep());
  else if(r.phase==='gate')assert.ok(r.nextFloor());
  else if(r.phase==='map'){
   const supply=Object.entries(r.dungeon.objects).find(([,o])=>o.active&&!o.broken&&['mana','deal'].includes(o.reward?.kind));
   const entry=supply||Object.entries(r.dungeon.rooms).find(([,n])=>n.type===targets[Math.min(target,3)]);assert.ok(entry);const dest=entry[0];
   if(D.key(r.dungeon.x,r.dungeon.y)===dest){if(supply)assert.ok(r.useObject(r.dungeon.x,r.dungeon.y).ok);else if(target===3)assert.ok(r.interact().ok);else target++;}
   else{const direction=route(r.dungeon,dest)[0],delta=(direction-r.dungeon.dir+4)%4;assert.ok(r.walk(['forward','right','back','left'][delta]).ok);moves++;}
  }else assert.fail('unexpected '+r.phase);
  if(steps%23===0){const save=r.snapshot();r=Run.restore(save);assert.deepEqual(r.snapshot(),save);reloads++;}
 }
 assert.ok(steps<15000,'journey must terminate');return {r,bosses,dimensions,steps,moves,levels,reloads};
}
test('five floors increase each encounter class HP and maximum attack budget without multiplying XP by swarm count',()=>{
 const r=new Run({combatVersion:10,exploration:false});assert.equal(r.maps.length,5);assert.equal(r.totalFloors,5);
 for(const type of ['battle','elite','boss'])for(const stage of [0,3]){let previous={health:0,attack:0};for(let floor=1;floor<=5;floor++){r.floor=floor;const enemies=r.encounter({id:`${floor}-${type}-${stage}`,floor,type,stage}),budget=enemies[0].encounterBudget;assert.ok(budget.health>previous.health,`${type} HP floor${floor}`);assert.ok(budget.attack>previous.attack,`${type} threat floor${floor}`);assert.equal(enemies.reduce((n,e)=>n+e.health,0),budget.health);assert.equal(enemies.reduce((n,e)=>n+e.xpOverride,0),budget.xp);assert.equal(enemies.reduce((n,e)=>n+Math.max(0,...e.intents.flatMap(i=>i.actions.filter(a=>a.kind==='attack').map(a=>a.value))),0),budget.attack);previous=budget;}}
});
for(const profile of ['demo','base'])for(const character of ['antonio','imelda'])test(`v10 five-floor journey ${profile}/${character}: real combat, four boss rewards, fifth-floor ending and reloads`,()=>{
 const result=journey(profile,character),{r}=result;console.log('Five-floor journey',{profile,character,outcome:r.phase,floor:r.floor,health:r.health,steps:result.steps,moves:result.moves,levels:result.levels,reloads:result.reloads});
 if(profile==='demo'||character==='antonio')assert.equal(r.phase,'won');else assert.ok(['won','lost'].includes(r.phase));assert.equal(r.floor,5);assert.deepEqual(result.dimensions,[12,14,16,18,20]);assert.deepEqual(result.bosses,[1,2,3,4]);assert.deepEqual(r.bossRewardFloors,[1,2,3,4]);assert.equal(r.bossReward,null);assert.equal(r.openBossReward(),false);assert.equal(r.nextFloor(),false);assert.ok(result.levels>0);assert.ok(result.moves>30);assert.ok(result.reloads>5);assert.ok(r.growth.mana>=5);if(r.phase==='won')assert.ok(r.completed.includes(r.maps[4].find(n=>n.type==='boss').id));else{assert.equal(r.health,0);assert.equal(r.battle.phase,'defeat');const before=r.snapshot();assert.equal(r.walk('forward').ok,false);assert.deepEqual(r.snapshot(),before);}assert.deepEqual(Run.restore(r.snapshot()).snapshot(),r.snapshot());
});
