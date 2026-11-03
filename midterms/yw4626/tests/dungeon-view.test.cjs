'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const V=require('../dist/dungeon-view.js'),D=require('../dist/dungeon.js'),{Run}=require('../dist/run.js');
const key=p=>`${p.x},${p.y}`;
function canvas(){
  const calls={labels:[],pixels:null},ctx={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:p=>{calls.pixels=Buffer.from(p.data);},fillRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},measureText:t=>({width:t.length*10}),fillText:t=>calls.labels.push(t)};
  return {canvas:{width:480,height:270,getContext:()=>ctx},calls};
}
test('visual expansion keeps every logical boundary and camera/prop within their own tile',()=>{
  let scenes=0,narrowCorridors=0;
  for(let seed=0;seed<20;seed++){
    const r=new Run({seed:'SCENE-'+seed});
    for(let floor=1;floor<=3;floor++){
      const d=D.build(r.seed,floor,r.maps[floor-1]),scene=V.sceneFor(d),scale=scene.scale;scenes++;
      assert.equal(scale,4);assert.deepEqual(scene.camera,{x:(d.x+.5)*4,y:(d.y+.5)*4});
      const rooms=new Set(d.generation.zones.flatMap(z=>z.cells.map(key)));
      for(let y=0;y<d.grid.length;y++)for(let x=0;x<d.grid[y].length;x++)if(D.passable(d,x,y)){
        let open=0;for(let v=0;v<4;v++)for(let u=0;u<4;u++)if(scene.grid[y*4+v][x*4+u]==='.')open++;
        if(rooms.has(`${x},${y}`))assert.ok(open>=4&&open<=16);else {assert.ok(open<=12);if(open===8)narrowCorridors++;}
        const p=scene.anchor(x,y,true);assert.equal(Math.floor(p.x/4),x);assert.equal(Math.floor(p.y/4),y);assert.equal(scene.grid[Math.floor(p.y)][Math.floor(p.x)],'.');
        for(let dir=0;dir<4;dir++){
          const v=D.dirs[dir],nx=x+v.x,ny=y+v.y;
          let crossings=0;
          for(let edge=0;edge<4;edge++){
            const mx=x*4+(dir===1?3:dir===3?0:edge),my=y*4+(dir===0?0:dir===2?3:edge);
            if(scene.masks[my*scene.width+mx]&(1<<dir))crossings++;
          }
          assert.equal(crossings>0,D.canTraverse(d,x,y,nx,ny));
          if(crossings>0)assert.ok(crossings>=2&&crossings<=4);
        }
      }
    }
  }
  assert.ok(narrowCorridors>0);console.log('Visual topology:',{scenes,narrowCorridors});
});
test('closed interior logical edge occludes offset props and labels in the expanded scene',()=>{
  const grid=['######','#....#','#....#','#....#','######'],connections={};
  for(let y=0;y<grid.length;y++)for(let x=0;x<grid[y].length;x++)if(grid[y][x]==='.')connections[`${x},${y}`]=D.dirs.reduce((m,v,i)=>grid[y+v.y]?.[x+v.x]==='.'?m|(1<<i):m,0);
  connections['2,2']&=~2;connections['3,2']&=~8;
  const calls=[],state={grid,connections,x:1,y:2,dir:1,objectAt:(x,y)=>y===2&&[2,4].includes(x)?{type:'barrel'}:null,objectInfo:(x,y)=>{calls.push(`${x},${y}`);return {viewText:x===2?'可见木桶':'隔墙木桶'};}};
  const c=canvas();V.draw(c.canvas,state);assert.deepEqual(calls,['2,2']);assert.deepEqual(c.calls.labels,['可见木桶']);
});
test('battle background shares the same expanded room and respects an encounter visualKey',()=>{
  const r=new Run({seed:'SCENE-BATTLE'}),d=r.dungeon,cell=d.generation.zones.find(z=>z.role==='battle').cells[0];
  const state={...d,x:cell.x,y:cell.y,dir:0},a=canvas(),b=canvas();
  V.draw(a.canvas,state,{entities:false,lantern:false,horizon:.27,eyeHeight:.5,retreat:1.1});V.drawBattle(b.canvas,state);assert.deepEqual(a.calls.pixels,b.calls.pixels);
  const open={grid:['#####','#...#','#...#','#...#','#####'],x:2,y:3,dir:0,roomAt:(x,y)=>x===2&&y===2?{type:'battle',visualKey:'zombie'}:null};
  V.draw(a.canvas,open,{lantern:false});V.draw(b.canvas,{...open,roomAt:(x,y)=>x===2&&y===2?{type:'battle',visualKey:'ghost'}:null},{lantern:false});assert.notDeepEqual(a.calls.pixels,b.calls.pixels);
  assert.ok(a.calls.pixels.every((value,i)=>i%4!==3||value===255));
});
test('rendering does not mutate movement, interaction range or old serialized maps',()=>{
  const r=new Run({seed:'SCENE-IMMUTABLE'}),d=r.dungeon,before=JSON.stringify(d),c=canvas();
  const state={...d,objectAt:(x,y)=>D.objectAt(d,x,y),roomAt:(x,y)=>D.roomAt(d,x,y)};
  for(let dir=0;dir<4;dir++)V.draw(c.canvas,{...state,dir});assert.equal(JSON.stringify(d),before);
  const legacy=D.buildLegacy('OLD',1,r.maps[0]),old=JSON.stringify(legacy);V.draw(c.canvas,legacy);assert.equal(JSON.stringify(legacy),old);
});

test('cached backgrounds reuse static pixels and invalidate when an interior connection opens',()=>{
  const state={grid:['#####','#...#','#...#','#...#','#####'],x:1,y:2,dir:1,connections:{}};
  for(let y=1;y<=3;y++)for(let x=1;x<=3;x++)state.connections[`${x},${y}`]=D.dirs.reduce((m,v,i)=>state.grid[y+v.y]?.[x+v.x]==='.'?m|(1<<i):m,0);
  state.connections['2,2']&=~2;state.connections['3,2']&=~8;
  const c=canvas();V.drawBattle(c.canvas,state);const before=V.metrics(),closed=Buffer.from(c.calls.pixels);
  V.drawBattle(c.canvas,state);assert.equal(V.metrics().draws,before.draws);
  state.connections['2,2']|=2;state.connections['3,2']|=8;V.drawBattle(c.canvas,state);
  assert.equal(V.metrics().draws,before.draws+1);assert.notDeepEqual(c.calls.pixels,closed);
});
