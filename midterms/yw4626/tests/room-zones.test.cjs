'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js');
const clone=v=>JSON.parse(JSON.stringify(v)),k=p=>D.key(p.x,p.y);
function reachable(d){const seen=new Set([k(d)]),queue=[d];for(let i=0;i<queue.length;i++)for(const v of D.dirs){const p={x:queue[i].x+v.x,y:queue[i].y+v.y};if(!seen.has(k(p))&&D.canTraverse(d,queue[i].x,queue[i].y,p.x,p.y)){seen.add(k(p));queue.push(p);}}return seen;}
test('300 maps use template-owned battle/service zones and clear connecting corridors',()=>{
  let separated=0,maxAttempts=0,minCorridors=Infinity;
  for(let seed=0;seed<100;seed++){
    const r=new Run({seed:'ZONES-'+seed});
    for(let floor=1;floor<=3;floor++){
      const d=D.build(r.seed,floor,r.maps[floor-1]),g=d.generation,seen=reachable(d),owners=new Map();
      assert.equal(d.version,8);assert.equal(g.zones.length,4);assert.equal(Object.keys(d.rooms).length,8);
      assert.deepEqual(g.zones.map(z=>z.role).sort(),['battle','battle','boss','service']);
      for(const z of g.zones){
        const b=z.bounds,room=g.rooms[z.roomIndex];assert.deepEqual(b,{x:room.x,y:room.y,width:room.width,height:room.height});assert.equal(z.templateId,room.id);
        for(const p of z.cells){assert.ok(seen.has(k(p)));assert.ok(!owners.has(k(p)));assert.ok(p.x>=b.x&&p.x<b.x+b.width&&p.y>=b.y&&p.y<b.y+b.height);owners.set(k(p),z);}
        const events=Object.entries(d.rooms).filter(([,e])=>e.zoneId===z.id);assert.deepEqual(events.map(([,e])=>e.id).sort(),[...z.eventIds].sort());
        assert.equal(events.length,z.role==='battle'?2:z.role==='boss'?1:3);
        for(const [key,event] of events){assert.equal(owners.get(key),z);assert.ok((z.role==='battle'?['battle','elite']:z.role==='boss'?['boss']:['shop','camp','treasure']).includes(event.type));}
        assert.equal(z.clearCells.length,1);
      }
      const planned=[...Object.keys(d.objects),...d.gemSites.map(k),...g.supplySites.map(k)],occupied=[...Object.keys(d.rooms),...planned];
      assert.equal(Object.keys(d.objects).length,2);assert.equal(d.gemSites.length,2);assert.equal(g.supplySites.length,2);
      assert.equal(new Set(occupied).size,occupied.length);assert.ok(!occupied.includes(k(d)));
      for(const cell of occupied){assert.ok(owners.has(cell));assert.ok(seen.has(cell));}
      for(const z of g.zones){for(const p of z.clearCells)assert.ok(!occupied.includes(k(p)));assert.ok(occupied.filter(cell=>owners.get(cell)===z).length<z.cells.length);assert.deepEqual(z.supplyCells.map(k).sort(),planned.filter(cell=>owners.get(cell)===z).sort());}
      const corridors=new Set(g.corridorCells.map(k));assert.ok(corridors.size>0);
      for(const cell of corridors){assert.ok(seen.has(cell));assert.ok(!owners.has(cell));assert.ok(!occupied.includes(cell));}
      assert.equal(owners.size+corridors.size,seen.size);assert.equal(owners.get(k(d)).role,'service');assert.equal(owners.get(k(d)).entry,true);
      if(g.roomsSeparated){separated++;for(let i=0;i<g.rooms.length;i++)for(let j=i+1;j<g.rooms.length;j++){const a=g.rooms[i],b=g.rooms[j];assert.ok(a.x+a.width<b.x||b.x+b.width<a.x||a.y+a.height<b.y||b.y+b.height<a.y);}}
      maxAttempts=Math.max(maxAttempts,g.attempts);minCorridors=Math.min(minCorridors,corridors.size);
    }
  }
  console.log('Room-zone generation:',{maps:300,separated,maxAttempts,minCorridors});
});
test('serialized pre-zone map keeps its grid, events and props when restored',()=>{
  const r=new Run({seed:'OLD-ZONE-COMPAT'}),saved=clone(r.snapshot()),d=saved.data.dungeon;d.version=6;
  for(const field of ['zones','corridorCells','supplySites','roomsSeparated'])delete d.generation[field];
  for(const room of Object.values(d.rooms))delete room.zoneId;
  const before=clone(d),restored=Run.restore(saved);assert.deepEqual(restored.dungeon,before);assert.equal(restored.dungeon.generation.zones,undefined);
});
test('run populates both carts only at planned room supply sites and preserves empty corridors',()=>{
  for(let seed=0;seed<30;seed++){
    const r=new Run({seed:'SUPPLY-ZONES-'+seed});
    for(let floor=1;floor<=3;floor++){
      r.floor=floor;r.dungeon=D.build(r.seed,floor,r.maps[floor-1]);r.populateGems();r.populateGrowth();
      const d=r.dungeon,g=d.generation,carts=Object.entries(d.objects).filter(([,o])=>['manaCart','bracerCart'].includes(o.type));
      assert.equal(carts.length,2);assert.deepEqual(carts.map(([key])=>key).sort(),g.supplySites.map(k).sort());
      assert.deepEqual(carts.map(([,o])=>o.type).sort(),['bracerCart','manaCart']);assert.equal(Object.keys(d.objects).length,6);
      for(const p of g.corridorCells){assert.equal(d.objects[k(p)],undefined);assert.equal(d.rooms[k(p)],undefined);}
      for(const z of g.zones)for(const p of z.clearCells){assert.equal(d.objects[k(p)],undefined);assert.equal(d.rooms[k(p)],undefined);}
    }
  }
});

test('five-floor sizing grows grid and battle zones while reusing exact verified template edges',()=>{
  const L=require('../dist/room-layout.js'),T=require('../dist/room-templates.js'),before=clone(T.floors);
  const stats=[];
  for(let floor=1;floor<=5;floor++){
    let minCells=Infinity,maxCells=0,maxAttempts=0;
    for(let seed=0;seed<50;seed++){
      const r=new Run({seed:'FIVE-ZONES-'+seed,combatVersion:10,exploration:false});
      // Independent ten/twelve-event stress fixture, even before Run's floor extension.
      const nodes=r.buildMap(floor),wanted=4+2*Math.max(0,floor-3);
      for(let i=nodes.filter(n=>['battle','elite'].includes(n.type)).length;i<wanted;i++)nodes.push({id:`${floor}-stress-${i}`,floor,stage:4,lane:i,type:i%2?'elite':'battle'});
      const d=D.build(r.seed,floor,nodes),g=d.generation,seen=reachable(d),owners=new Map(g.zones.flatMap(z=>z.cells.map(p=>[k(p),z])));
      assert.equal(d.grid.length,10+floor*2);assert.equal(d.grid[0].length,10+floor*2);assert.equal(g.zones.length,4+Math.max(0,floor-3));assert.equal(g.zones.filter(z=>z.role==='battle').length,2+Math.max(0,floor-3));
      assert.equal(Object.keys(d.rooms).length,nodes.length);assert.equal(seen.size,Object.keys(d.connections).length);D.validate(d);
      for(const z of g.zones){assert.ok(z.clearCells.every(p=>!d.rooms[k(p)]&&!d.objects[k(p)]));if(z.role==='battle'){assert.equal(z.eventIds.length,2);assert.ok(z.eventIds.every(id=>nodes.some(n=>n.id===id&&['battle','elite'].includes(n.type))));}}
      for(const room of g.rooms){const t=L.rotated(T.templates.find(t=>t.id===room.id),room.rotation);assert.equal(t.sourceHash,room.sourceHash);
        for(const c of t.cells)for(let dir=0;dir<4;dir++){const [dx,dy]=L.dirs[dir],other=t.cells.find(p=>p.x===c.x+dx&&p.y===c.y+dy);if(!other)continue;
          const mask=d.connections[D.key(room.x+c.x,room.y+room.height-1-c.y)]||0;assert.equal(Boolean(mask&(1<<dir)),Boolean(c.mask&(1<<dir)),`floor${floor} ${room.id} internal edge ${c.x},${c.y}:${dir}`);
        }
      }
      r.floor=floor;r.dungeon=d;r.populateGems();r.populateGrowth();
      const occupied=[...Object.keys(d.rooms),...Object.keys(d.objects)];assert.equal(new Set(occupied).size,occupied.length);assert.ok(occupied.every(cell=>owners.has(cell)&&seen.has(cell)));assert.equal(Object.keys(d.objects).length,6);
      const carts=Object.entries(d.objects).filter(([,o])=>['manaCart','bracerCart'].includes(o.type));assert.deepEqual(carts.map(([key])=>key).sort(),g.supplySites.map(k).sort());
      assert.ok(g.corridorCells.length);for(const p of g.corridorCells){assert.ok(seen.has(k(p)));assert.equal(d.rooms[k(p)],undefined);assert.equal(d.objects[k(p)],undefined);}
      for(const z of g.zones)for(const p of z.clearCells){assert.equal(d.rooms[k(p)],undefined);assert.equal(d.objects[k(p)],undefined);}
      if(floor>=3){assert.equal(g.scaleAdapter.templateSourceFloor,3);assert.equal(g.scaleAdapter.addedBattleRooms,Math.max(0,floor-3));assert.deepEqual(g.scaleAdapter.sourceMaximum,{x:10,y:10});}else assert.equal(g.scaleAdapter,undefined);
      minCells=Math.min(minCells,seen.size);maxCells=Math.max(maxCells,seen.size);maxAttempts=Math.max(maxAttempts,g.attempts);
    }
    stats.push({floor,maps:50,minCells,maxCells,maxAttempts});
  }
  assert.deepEqual(T.floors,before);console.log('Five-floor geometry:',stats);
});
