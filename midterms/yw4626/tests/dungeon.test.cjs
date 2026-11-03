'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run:BaseRun}=require('../dist/run.js'),D=require('../dist/dungeon.js');
class Run extends BaseRun {constructor(options={}){super({...options,legacyProgression:true});}}
const clone=x=>JSON.parse(JSON.stringify(x));
function locate(r,type){const entry=Object.entries(r.dungeon.rooms).find(([,n])=>n.type===type);return {key:entry[0],...entry[1],xy:entry[0].split(',').map(Number)};}
function route(d,target){
  const queue=[[d.x,d.y,[]]],seen=new Set([D.key(d.x,d.y)]);
  for(let i=0;i<queue.length;i++){
    const [x,y,path]=queue[i];if(D.key(x,y)===target)return path;
    for(let dir=0;dir<4;dir++){const v=D.dirs[dir],nx=x+v.x,ny=y+v.y,k=D.key(nx,ny);if(D.canTraverse(d,x,y,nx,ny)&&!seen.has(k)){seen.add(k);queue.push([nx,ny,[...path,dir]]);}}
  }throw Error('unreachable '+target);
}
function fixtureAt(r,type){const node=locate(r,type);[r.dungeon.x,r.dungeon.y]=node.xy;D.reveal(r.dungeon);return node;}
function fixtureWin(r){r.battle.enemies.forEach(e=>e.health=0);r.battle.phase='victory';r.settleBattle();}
function approach(r,x,y){const d=r.dungeon,dir=D.dirs.findIndex(v=>D.canTraverse(d,x-v.x,y-v.y,x,y));assert.ok(dir>=0);d.x=x-D.dirs[dir].x;d.y=y-D.dirs[dir].y;d.dir=dir;D.reveal(d);}
function propFixture(r){const [k,obj]=Object.entries(r.dungeon.objects)[0],xy=k.split(',').map(Number);approach(r,...xy);return {k,obj,xy};}
function enterBattle(r){const n=locate(r,'battle');approach(r,...n.xy);assert.ok(r.walk('forward').ok);assert.equal(r.phase,'battle');}
function playBattle(r,pass=false){
  let n=0;const b=r.battle;
  while(['player','enemy'].includes(b.phase)&&n++<2000){
    if(b.phase==='enemy'){b.resolveNextEnemy();continue;}
    const cards=b.piles.hand.filter(c=>b.canPlay(c.id).ok).map(c=>({c,p:b.cardPreview(c)}));
    cards.sort((a,z)=>{const score=x=>(x.p.continues?20:0)+(x.p.damage*x.p.hits||x.p.draw*15||x.p.armor||0)-x.p.payment*3;return score(z)-score(a);});
    if(!pass&&cards.length)b.play(cards[0].c.id);else b.endTurn();
  }assert.ok(n<2000);r.settleBattle();
}
test('100 seeded maps connect all events using a tree plus loops; seed changes topology',()=>{
  const layouts=new Set();
  for(let seed=0;seed<100;seed++)for(let floor=1;floor<=3;floor++){
    const r=new Run({seed:'GRID'+seed});r.floor=floor;r.dungeon=D.build(r.seed,floor,r.maps[floor-1]);
    assert.deepEqual(r.dungeon,D.build(r.seed,floor,r.maps[floor-1]));
    for(const target of Object.keys(r.dungeon.rooms))assert.ok(route(r.dungeon,target).length);
    assert.equal(r.dungeon.generation.mst.length,r.dungeon.generation.rooms.length-1);
    assert.equal(r.dungeon.generation.rooms.length,4);
    assert.equal(r.dungeon.grid.length,[12,14,16][floor-1]);
    assert.ok(Object.keys(r.dungeon.connections).length>=25);
    assert.equal(r.dungeon.gemSites.length,2);
    for(const p of r.dungeon.gemSites){const k=D.key(p.x,p.y);assert.ok(route(r.dungeon,k).length);assert.ok(!r.dungeon.rooms[k]);assert.ok(!r.dungeon.objects[k]);}
    assert.equal(Object.keys(r.dungeon.rooms).length,8);assert.equal(Object.keys(r.dungeon.secrets).length,0);
    assert.ok(r.dungeon.exit.roomId&&r.dungeon.rooms[r.dungeon.exit.key].isExit);
    layouts.add(r.dungeon.grid.join(''));
  }assert.ok(layouts.size>200);
});
test('turning changes orientation; walls block without mutating position',()=>{
  const r=new Run(),d=r.dungeon;const wall=D.dirs.findIndex(v=>!D.canTraverse(d,d.x,d.y,d.x+v.x,d.y+v.y));d.dir=wall;const before=clone(r.snapshot());assert.equal(r.walk('forward').ok,false);assert.deepEqual(r.snapshot(),before);
  const start=d.dir;assert.ok(r.turn(1).ok);assert.equal(d.dir,(start+1)%4);r.turn(-1);assert.equal(d.dir,start);
  const open=D.dirs.findIndex(v=>D.canTraverse(d,d.x,d.y,d.x+v.x,d.y+v.y)),v=D.dirs[open],x=d.x,y=d.y;d.dir=open;D.move(d,'forward');assert.deepEqual([d.x,d.y],[x+v.x,y+v.y]);assert.equal(d.steps,1);D.move(d,'back');assert.deepEqual([d.x,d.y],[x,y]);
});
test('template rotations preserve internal edge walls and corridors only open declared exits',()=>{
  const L=require('../dist/room-layout.js'),T=require('../dist/room-templates.js');
  for(let seed=0;seed<50;seed++){
    const r=new Run({seed:'TEMPLATES'+seed}),d=r.dungeon;
    assert.deepEqual([d.grid[0].length,d.grid.length],[12,12]);
    for(const room of d.generation.rooms){
      const template=T.templates.find(t=>t.id===room.id),shape=L.rotated(template,room.rotation);
      assert.equal(room.sourceHash,template.sourceHash);
      for(const cell of shape.cells){const x=room.x+cell.x,y=room.y+shape.height-1-cell.y;
        for(let dir=0;dir<4;dir++){const v=D.dirs[dir],nx=x+v.x,ny=y+v.y;
          if(nx>=room.x&&nx<room.x+shape.width&&ny>=room.y&&ny<room.y+shape.height)assert.equal(D.canTraverse(d,x,y,nx,ny),!!(cell.mask&(1<<dir)));
        }
        if(!cell.mask&&!cell.exitCandidate&&!shape.events.some(e=>e.x===cell.x&&e.y===cell.y)&&!shape.spawn.some(e=>e.x===cell.x&&e.y===cell.y))assert.equal(d.grid[y][x],'#');
      }
    }
    for(const [k,mask]of Object.entries(d.connections)){const [x,y]=k.split(',').map(Number);D.dirs.forEach((v,dir)=>{if(mask&(1<<dir))assert.ok(D.canTraverse(d,x,y,x+v.x,y+v.y));});}
  }
});
test('an interior edge wall blocks movement, object interaction and visibility',()=>{
  let r,edge;
  for(let seed=0;seed<30&&!edge;seed++){r=new Run({seed:'WALL'+seed});const d=r.dungeon;for(const k of Object.keys(d.connections)){const [x,y]=k.split(',').map(Number);for(let dir=0;dir<4;dir++){const v=D.dirs[dir],nx=x+v.x,ny=y+v.y;if(D.passable(d,nx,ny)&&!D.canTraverse(d,x,y,nx,ny)){edge={x,y,nx,ny,dir};break;}}if(edge)break;}}
  assert.ok(edge);const d=r.dungeon;Object.assign(d,{x:edge.x,y:edge.y,dir:edge.dir,seen:[],visited:[]});d.rooms={};d.objects={};d.objects[D.key(edge.nx,edge.ny)]={id:'wall-test',type:'pickup',active:true,reward:{kind:'gold',amount:10}};
  const gold=r.gold;assert.equal(r.walk('forward').ok,false);assert.equal(r.interact().ok,false);assert.equal(r.useObject(edge.nx,edge.ny).ok,false);assert.equal(r.gold,gold);D.reveal(d);assert.ok(!d.seen.includes(D.key(edge.nx,edge.ny)));
});
test('breaking and collecting are separate, stationary and never pay twice after reload',()=>{
  let r=new Run();const {k,obj,xy}=propFixture(r),gold=r.gold,health=r.health;
  r.walk('forward');assert.equal(obj.type,'pickup');assert.equal(r.gold,gold);assert.equal(r.health,health);assert.equal(r.dungeon.steps,0);
  r=Run.restore(clone(r.snapshot()));r.walk('forward');const after=clone(r.snapshot());assert.equal(r.dungeon.objects[k].active,false);
  r=Run.restore(after);assert.equal(r.useObject(...xy).ok,false);assert.equal(r.gold,after.data.gold);r.walk('forward');assert.deepEqual([r.dungeon.x,r.dungeon.y],xy);
});
test('loot uses inclusive coin bounds, one chicken cap and floor-two priority chicken',()=>{
  const amounts=new Set();
  for(let seed=0;seed<60;seed++)for(const floor of [1,2,3]){
    const r=new Run({seed:'LOOT'+seed}),d=D.build(r.seed,floor,r.maps[floor-1]),objects=Object.values(d.objects),chickens=objects.filter(o=>o.reward.kind==='heal');
    assert.ok(chickens.length<=1);if(floor===2)assert.equal(chickens.length,1);
    for(const o of objects)if(o.reward.kind==='gold'){assert.ok(o.reward.amount>=2&&o.reward.amount<=10);amounts.add(o.reward.amount);}else assert.equal(o.reward.amount,10);
  }assert.ok(amounts.has(2)&&amounts.has(10));
});
test('chicken heals ten, caps at max health and remains consumed',()=>{
  const r=new Run(),{k,xy}=propFixture(r);r.dungeon.objects[k]={id:'chicken-fixture',type:'pickup',active:true,broken:false,reward:{kind:'heal',amount:10}};r.health=46;r.useObject(...xy);assert.equal(r.health,50);assert.equal(r.dungeon.objects[k].active,false);assert.equal(r.useObject(...xy).ok,false);
});
test('walking into uncleared enemies locks exploration and returns to the same tile',()=>{
  const r=new Run();enterBattle(r);const pos=[r.dungeon.x,r.dungeon.y,r.dungeon.dir],before=clone(r.snapshot());
  assert.equal(r.walk('forward').ok,false);assert.equal(r.turn(1).ok,false);assert.deepEqual(r.snapshot(),before);fixtureWin(r);r.claimReward(-1);assert.equal(r.phase,'map');assert.deepEqual([r.dungeon.x,r.dungeon.y,r.dungeon.dir],pos);
  const gold=r.gold;r.walk('back');r.walk('forward');assert.equal(r.phase,'map');assert.equal(r.gold,gold);
});
test('remote rooms and remote props cannot be used; fog does not expose the whole map',()=>{
  const r=new Run(),shop=locate(r,'shop');assert.equal(r.enter(shop.id).ok,false);assert.equal(r.useObject(1,1).ok,false);assert.ok(r.dungeon.seen.length<30);
});
test('shop revisits preserve purchases through save',()=>{
  let r=new Run(),shop=fixtureAt(r,'shop');r.interact();assert.equal(r.phase,'shop');r.buy(0);const gold=r.gold,count=r.deck.length;r.leave();r=Run.restore(clone(r.snapshot()));r.interact();assert.equal(r.shop.offers[0].sold,true);assert.equal(r.buy(0).ok,false);assert.equal(r.gold,gold);assert.equal(r.deck.length,count);r.leave();assert.deepEqual([r.dungeon.x,r.dungeon.y],shop.xy);
});
test('leaving an unused camp preserves its one-time service',()=>{
  const r=new Run(),camp=fixtureAt(r,'camp');r.interact();r.leave();assert.ok(!r.completed.includes(camp.id));r.interact();r.upgrade(r.deck[0].id);assert.ok(r.completed.includes(camp.id));r.interact();assert.notEqual(r.phase,'camp');assert.equal(r.completed.filter(id=>id===camp.id).length,1);
});
test('only a completed exit event spawns a shovel; reward claim is required',()=>{
  const r=new Run();fixtureAt(r,'boss');assert.equal(D.objectAt(r.dungeon),null);r.interact();fixtureWin(r);assert.equal(r.dungeon.exit.ready,false);assert.equal(r.interact().ok,false);r.claimReward(-1);assert.equal(D.objectAt(r.dungeon).type,'shovel');assert.equal(r.nextFloor(),false);
});
test('digging pays 33,33,34 once, survives reload, locks movement, and descends without healing',()=>{
  let r=new Run();fixtureAt(r,'boss');r.interact();fixtureWin(r);r.claimReward(-1);r.health=25;const gold=r.gold,deck=clone(r.deck);r.interact();assert.equal(r.phase,'digging');assert.equal(r.dig.durationMs,2500);
  assert.equal(r.walk('back').ok,false);assert.equal(r.turn(1).ok,false);assert.equal(r.interact().ok,false);
  r.digStep();assert.equal(r.gold,gold+33);r=Run.restore(clone(r.snapshot()));r.digStep();assert.equal(r.gold,gold+66);r=Run.restore(clone(r.snapshot()));r.digStep();assert.equal(r.gold,gold+100);
  assert.equal(r.floor,2);assert.equal(r.phase,'map');assert.equal(r.health,25);assert.deepEqual(r.deck,deck);assert.equal(r.dungeon.version,8);assert.equal(r.dungeon.steps,0);assert.equal(r.digStep(),false);assert.equal(r.gold,gold+100);
});
test('v0.2 and v0.3 saves preserve old map/current event; next floor adopts generated map',()=>{
  const r=new Run({exploration:false});r.enter(r.available()[0].id);fixtureWin(r);const save=clone(r.snapshot());delete save.data.dungeon;const migrated=Run.restore(save);
  assert.equal(migrated.phase,'reward');assert.equal(migrated.gold,r.gold);assert.equal(D.roomAt(migrated.dungeon).id,r.current);assert.equal(migrated.dungeon.version,undefined);
  const old=new Run();old.dungeon=D.buildLegacy(old.seed,1,old.maps[0]);fixtureAt(old,'boss');old.interact();fixtureWin(old);old.claimReward(-1);fixtureAt(old,'stairs');old.interact();const restored=Run.restore(clone(old.snapshot()));assert.ok(restored.nextFloor());assert.equal(restored.dungeon.version,8);
  const v4=new Run();v4.dungeon=require('../dist/world-gen.js').generateV4(v4.seed,1,v4.maps[0]);D.reveal(v4.dungeon);const saved=clone(v4.snapshot());assert.deepEqual(Run.restore(saved).snapshot(),saved);
});
test('position and prop states restore exactly, corrupt dig progress is rejected',()=>{
  const r=new Run();r.interact();r.turn(1);const save=clone(r.snapshot());assert.deepEqual(Run.restore(save).snapshot(),save);save.data.dungeon.x=0;assert.throws(()=>Run.restore(save),/地牢存档/);
  const missing=clone(r.snapshot());delete missing.data.dungeon.connections;assert.throws(()=>Run.restore(missing),/地牢连接存档/);
  const s=new Run();fixtureAt(s,'boss');s.interact();fixtureWin(s);s.claimReward(-1);s.interact();const corrupt=clone(s.snapshot());corrupt.data.dig.paid=99;assert.throws(()=>Run.restore(corrupt),/挖掘存档/);
});
test('defeat stops traversal, props and interaction',()=>{
  const r=new Run();enterBattle(r);playBattle(r,true);assert.equal(r.phase,'lost');assert.equal(r.walk('back').ok,false);assert.equal(r.interact().ok,false);assert.equal(r.useObject(r.dungeon.x,r.dungeon.y).ok,false);
});
test('eight generated-map journeys use real combat, props, saved digging and full endings',()=>{
  const outcomes={won:0,lost:0};let moves=0,shops=0,digs=0;
  for(let seed=0;seed<8;seed++){
    let r=new Run({seed:'WORLD-'+seed}),floor=1,targetIndex=0,steps=0;const targets=['treasure','shop','camp','boss'];
    while(!['won','lost'].includes(r.phase)&&steps++<2000){
      if(r.floor!==floor){floor=r.floor;targetIndex=0;}
      if(r.phase==='battle')playBattle(r);
      else if(r.phase==='reward')r.claimReward(r.reward.choices.findIndex(c=>c.key==='wand'));
      else if(r.phase==='treasure')r.openTreasure('gold');
      else if(r.phase==='shop'){shops++;if(r.health<35)r.buyHeal();const c=r.deck.find(c=>c.key==='wand'&&r.canUpgrade(c));if(c)r.upgrade(c.id);r.leave();}
      else if(r.phase==='camp'){if(r.health<35)r.rest();else {const c=r.deck.find(c=>c.key==='wand'&&r.canUpgrade(c));if(c)r.upgrade(c.id);else r.rest();}}
      else if(r.phase==='digging'){digs++;r.digStep();}
      else if(r.phase==='map'){
        const dest=locate(r,targets[Math.min(targetIndex,3)]);
        if(D.key(r.dungeon.x,r.dungeon.y)===dest.key){if(targetIndex===3){assert.ok(r.interact().ok);}else targetIndex++;}
        else{const step=route(r.dungeon,dest.key)[0],delta=(step-r.dungeon.dir+4)%4;assert.ok(r.walk(['forward','right','back','left'][delta]).ok);moves++;}
      }
      r=Run.restore(clone(r.snapshot()));assert.ok(r.gold>=0);assert.equal(new Set(r.deck.map(c=>c.id)).size,r.deck.length);
    }assert.ok(steps<2000);outcomes[r.phase]++;
  }assert.ok(outcomes.won>0);assert.ok(moves>100&&shops>0&&digs>=6);console.log('Generated journeys:',outcomes,{moves,shops,digs});
});
