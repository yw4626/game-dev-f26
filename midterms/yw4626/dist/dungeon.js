(function(root){
  'use strict';
  const dirs=[{x:0,y:-1,name:'北'},{x:1,y:0,name:'东'},{x:0,y:1,name:'南'},{x:-1,y:0,name:'西'}];
  const key=(x,y)=>`${x},${y}`;
  function buildLegacy(seed,floor,nodes){
    const cells=Array.from({length:17},()=>Array(15).fill('#'));
    for(let y=1;y<=15;y++)cells[y][7]='.';
    for(const y of [7,11])for(let x=2;x<=12;x++)cells[y][x]='.';
    // An authored tile layout; it is not the original game's map generator.
    if(floor>1)for(let y=7;y<=11;y++)cells[y][2]='.';
    const flip=[...seed].reduce((s,c)=>s+c.charCodeAt(0),floor)%2===0;
    const coord={treasure:[2,11],shop:[12,11],camp:[2,7],elite:[12,7],boss:[7,3]};
    const rooms={};
    for(const n of nodes){
      let [x,y]=n.type==='battle'?(n.stage===0?[7,13]:n.stage===1?[3,11]:[7,9]):coord[n.type];
      if(flip)x=14-x;
      rooms[key(x,y)]={id:n.id,type:n.type,name:n.name};
    }
    rooms['7,1']={id:`${floor}-stairs`,type:'stairs',name:floor===3?'封印之门':'下行楼梯'};
    const d={grid:cells.map(row=>row.join('')),rooms,x:7,y:15,dir:0,floor,seen:[],visited:[],steps:0,shops:{}};
    reveal(d);return d;
  }
  function build(seed,floor,nodes){
    const world=typeof module!=='undefined'&&module.exports?require('./world-gen.js'):root.CrawlerWorld;
    const d=world.generate(seed,floor,nodes);reveal(d);return d;
  }
  function objectAt(d,x=d.x,y=d.y){
    const k=key(x,y),obj=d.objects?.[k];if(obj?.active!==false&&!obj?.broken&&obj)return obj;
    if(d.floor===1&&d.themeVersion!==0&&d.exit?.key===k&&!d.exit.used)return {type:'mansionDoor',active:true,locked:!d.exit.ready,id:'mansion-entrance'};
    if(d.exit?.key===k&&d.exit.ready)return {type:d.exit.used?'hole':d.floor===1&&d.themeVersion!==0?'mansionDoor':'shovel',active:true,id:'exit-shovel'};
    return null;
  }
  function landmark(d){
    if(d?.floor!==1||d.themeVersion===0||!d.exit)return null;
    const [x,y]=d.exit.key.split(',').map(Number),entry=d.generation?.zones?.find(z=>z.entry)?.bounds||{x:0,y:d.grid.length-2,width:1,height:1};
    const dx=x-(entry.x+entry.width/2),dy=y-(entry.y+entry.height/2),dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0),v=dirs[dir];
    return {x,y,dir,worldX:x+.5+v.x*1.2,worldY:y+.5+v.y*1.2,locked:!d.exit.ready};
  }
  function facing(d){const v=dirs[d.dir];return {x:d.x+v.x,y:d.y+v.y};}
  function interaction(d){
    const own=objectAt(d);if(own)return {kind:'object',object:own,x:d.x,y:d.y};
    const front=facing(d);if(!canTraverse(d,d.x,d.y,front.x,front.y))return null;
    const secret=d.secrets?.[key(front.x,front.y)];
    if(secret&&!secret.opened)return {kind:'secret',secret,...front};
    const object=objectAt(d,front.x,front.y);if(object)return {kind:'object',object,...front};
    return null;
  }
  function refreshExit(d,completed){if(d?.exit&&completed.includes(d.exit.roomId)){if(!d.exit.ready){const house=landmark(d);d.exit.facing=house?.dir??d.dir;if(house)d.dir=house.dir;}d.exit.ready=true;}}
  function openSecret(d,x,y){
    const s=d.secrets?.[key(x,y)];if(!s||s.opened)return false;
    s.discovered=true;s.opened=true;const row=[...d.grid[y]];row[x]='.';d.grid[y]=row.join('');reveal(d);return true;
  }
  function passable(d,x,y){return d.grid[y]?.[x]==='.';}
  function canTraverse(d,x,y,nx,ny){
    if(!passable(d,x,y)||!passable(d,nx,ny))return false;
    const dir=dirs.findIndex(v=>x+v.x===nx&&y+v.y===ny);if(dir<0)return false;
    if(!d.connections)return true;
    return !!(d.connections[key(x,y)]&(1<<dir))&&!!(d.connections[key(nx,ny)]&(1<<((dir+2)%4)));
  }
  function reveal(d){
    const seen=new Set(d.seen);seen.add(key(d.x,d.y));
    for(const direction of dirs)for(let distance=1;distance<=4;distance++){
      const x=d.x+direction.x*distance,y=d.y+direction.y*distance;
      if(!d.grid[y]||d.grid[y][x]===undefined)break;
      if(passable(d,x,y)&&!canTraverse(d,x-direction.x,y-direction.y,x,y))break;
      seen.add(key(x,y));if(!passable(d,x,y))break;
    }
    d.seen=[...seen];const here=key(d.x,d.y);if(!d.visited.includes(here))d.visited.push(here);
  }
  function move(d,relative){
    const offsets={forward:0,right:1,back:2,left:3};
    if(!(relative in offsets))return {ok:false,reason:'未知移动方向'};
    const direction=dirs[(d.dir+offsets[relative])%4],x=d.x+direction.x,y=d.y+direction.y;
    if(!canTraverse(d,d.x,d.y,x,y))return {ok:false,reason:'前方是石墙，换个方向试试',bump:true};
    d.x=x;d.y=y;d.steps++;reveal(d);return {ok:true};
  }
  function turn(d,amount){if(![-1,1].includes(amount))return false;d.dir=(d.dir+amount+4)%4;reveal(d);return true;}
  function roomAt(d,x=d.x,y=d.y){return d.rooms[key(x,y)]||null;}
  function validate(d){
    const width=d?.grid?.[0]?.length,height=d?.grid?.length;
    const dimensions=d?.version>=5?Number.isInteger(width)&&width>=5&&width<=64&&height>=5&&height<=64:width===15&&height===17;
    if(!d||!Array.isArray(d.grid)||!dimensions||d.grid.some(r=>typeof r!=='string'||r.length!==width||/[^#.]/.test(r))||!Number.isInteger(d.x)||!Number.isInteger(d.y)||!passable(d,d.x,d.y)||!Number.isInteger(d.dir)||d.dir<0||d.dir>3||!Array.isArray(d.seen)||!Array.isArray(d.visited)||!d.rooms||!d.shops)throw Error('地牢存档无效');
    if(d.version>=5){
      if(!d.connections||typeof d.connections!=='object')throw Error('地牢连接存档无效');
      for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(passable(d,x,y)){
        const mask=d.connections[key(x,y)];if(!Number.isInteger(mask)||mask<0||mask>15)throw Error('地牢连接存档无效');
        dirs.forEach((v,dir)=>{if((mask&(1<<dir))&&!canTraverse(d,x,y,x+v.x,y+v.y))throw Error('地牢连接存档无效');});
      }
    }
    return d;
  }
  const api={dirs,key,build,buildLegacy,move,turn,reveal,roomAt,passable,canTraverse,validate,objectAt,facing,interaction,refreshExit,openSecret,landmark};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerDungeon=api;
})(typeof globalThis!=='undefined'?globalThis:this);
