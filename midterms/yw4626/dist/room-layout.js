/* Numeric reconstruction from ROOM_LAYOUT_NATIVE_EVIDENCE.md and template assets.
 * RNG, retry cap and event distribution are prototype adapters, not native replay. */
(function(root){
  'use strict';
  const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Crawler;
  const T=typeof module!=='undefined'&&module.exports?require('./room-templates.js'):root.CrawlerRoomTemplates;
  const dirs=[[0,1],[1,0],[0,-1],[-1,0]],key=(x,y)=>`${x},${y}`;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const tagsFor=tag=>T.multiTags?.[tag]||[tag];
  const hasTag=(t,tag)=>tagsFor(tag).some(wanted=>t.tags.some(v=>tagsFor(v).includes(wanted)));
  const rotateMask=(mask,r)=>((mask<<r)|(mask>>(4-r)))&15;
  function floorProfile(floor){
    if(!Number.isInteger(floor)||floor<1||floor>5)throw Error('Unsupported floor profile');
    const source=T.floors[Math.min(floor,3)-1];
    if(floor<3)return source;
    const f=JSON.parse(JSON.stringify(source)),size=6+floor*2;
    f.floor=floor;f.maximum={x:size,y:size};f.target={x:size-1,y:size-1};
    if(floor>3)f.requirements.find(r=>r.tags.some(t=>t.tag==='Tag_Room_Multi_2x3-3x3')).number+=floor-3;
    f.scaleAdapter={kind:'prototype-five-floor-progression',templateSourceFloor:3,sourceTarget:source.target,sourceMaximum:source.maximum,sourceProfile:source.sourceProfile,addedBattleRooms:Math.max(0,floor-3),note:'Verified template topology reused; dimensions and additional rooms are authored, not extracted floor 4/5 profiles.'};
    return f;
  }
  function rotated(t,r){
    const point=p=>{let x=p.x,y=p.y,w=t.width,h=t.height;for(let i=0;i<r;i++){[x,y]=[y,w-1-x];[w,h]=[h,w];}return {...p,x,y};};
    return {id:t.id,rotation:r,width:r%2?t.height:t.width,height:r%2?t.width:t.height,tags:t.tags,sourceHash:t.sourceHash,
      preferred:rotateMask(t.preferred,r),cells:t.cells.map(c=>({...point(c),mask:rotateMask(c.mask,r),exit:rotateMask(c.exit,r)})),exitOrder:t.exits.map(point),spawn:t.spawn.map(point),events:t.events.map(point)};
  }
  function chooseTemplates(f,random){
    const result=[];
    for(const req of f.requirements){
      const pool=T.templates.filter(t=>(!f.biome||hasTag(t,f.biome))&&req.tags.every(q=>hasTag(t,q.tag)!==q.inverted)),groups=new Map();
      if(!pool.length)throw Error('没有匹配房间模板：'+JSON.stringify(req.tags));
      for(const t of pool){const k=[t.width,t.height].sort().join(',');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t);}
      const values=[...groups.values()];
      for(let i=0;i<req.number;i++){const group=values[Math.floor(random()*values.length)];result.push(group[Math.floor(random()*group.length)]);}
    }return result;
  }
  function place(templates,f,random){
    const max=f.maximum,target=f.target,centre={x:max.x/2,y:max.y/2};
    const boxes=templates.map(t=>{const r=Math.floor(random()*4),shape=rotated(t,r),end=t.tags.includes('Tag_End');
      // Matching native tag rules multiply, including the large-room peripheral rule.
      let boundary=end?.2:1,pull=end?0:1,offset=1;
      if(hasTag(t,'Tag_Room_Multi_2x3-3x3')&&!end){pull*=1.2000000476837158;offset*=.800000011920929;}
      if(hasTag(t,'Tag_Room_Multi_4x3-4x4-5x3')){boundary=0;pull*= -.5;offset*=1.25;}
      return {t,...shape,cx:centre.x+(random()*2-1)*5*offset,cy:centre.y+(random()*2-1)*5*offset,vx:0,vy:0,fx:0,fy:0,boundary,pull};});
    function iterate(){
      const forces=boxes.map(b=>({x:0,y:0})),pairs=new Set();
      boxes.forEach((a,i)=>{let nearest=-1,best=Infinity;boxes.forEach((b,j)=>{if(i===j)return;const d=Math.hypot(b.cx-a.cx,b.cy-a.cy);if(d<best){best=d;nearest=j;}if(d<3.5)pairs.add([Math.min(i,j),Math.max(i,j)].join(','));});if(nearest>=0)pairs.add([Math.min(i,nearest),Math.max(i,nearest)].join(','));});
      for(const pair of pairs){const [i,j]=pair.split(',').map(Number),a=boxes[i],b=boxes[j],dx=b.cx-a.cx,dy=b.cy-a.cy,d=Math.hypot(dx,dy)||1e-8,ux=dx/d,uy=dy/d;
        const ray=b=>Math.min(Math.abs(ux)>1e-8?b.width/2/Math.abs(ux):Infinity,Math.abs(uy)>1e-8?b.height/2/Math.abs(uy):Infinity);
        const strength=(d-ray(a)-ray(b)-1.75)*40,sa=a.width*a.width+a.height*a.height,sb=b.width*b.width+b.height*b.height;
        forces[i].x+=ux*strength*sb/(sa+sb);forces[i].y+=uy*strength*sb/(sa+sb);forces[j].x-=ux*strength*sa/(sa+sb);forces[j].y-=uy*strength*sa/(sa+sb);
      }
      boxes.forEach((b,i)=>{const ox=Math.trunc((max.x-target.x)/2),oy=Math.trunc((max.y-target.y)/2),force=forces[i];
        force.x+=b.pull*.5*(centre.x-b.cx)+b.boundary*50*(clamp(b.cx,ox+b.width/2+.05,ox+target.x-b.width/2)-b.cx)-10*b.vx;
        force.y+=b.pull*.5*(centre.y-b.cy)+b.boundary*50*(clamp(b.cy,oy+b.height/2+.05,oy+target.y-b.height/2)-b.cy)-10*b.vy;
        const nx=b.cx+b.vx*.01+b.fx*.00005,ny=b.cy+b.vy*.01+b.fy*.00005;
        b.vx+=(force.x+b.fx)*.005;b.vy+=(force.y+b.fy)*.005;b.fx=force.x;b.fy=force.y;
        b.cx=clamp(nx,b.width/2,max.x-b.width/2);b.cy=clamp(ny,b.height/2,max.y-b.height/2);
      });
    }
    for(let n=0;n<200;n++)iterate();
    const boundsCentre={x:boxes.reduce((sum,b)=>sum+b.cx,0)/boxes.length,y:boxes.reduce((sum,b)=>sum+b.cy,0)/boxes.length};
    for(const b of boxes){
      const inside=Math.abs(boundsCentre.x-b.cx)<=b.width/2&&Math.abs(boundsCentre.y-b.cy)<=b.height/2;
      const score=r=>{const s=rotated(b.t,r),bits=s.preferred;if(!bits)return -Infinity;let score=0;for(let d=0;d<4;d++)if(bits&(1<<d)){const [dx,dy]=dirs[d],x=b.cx+dx*s.width/2,y=b.cy+dy*s.height/2,tx=boundsCentre.x-x,ty=boundsCentre.y-y;score+=(dx*tx+dy*ty)/(Math.hypot(tx,ty)||1);}return score;};
      let rotation=b.rotation;
      if(b.preferred&&!inside){let best=score(rotation);for(let r=0;r<4;r++){const v=score(r);if(v>best+1e-9){best=v;rotation=r;}}}
      else if(!inside){const choices=E.shuffle([0,1,2,3],random);rotation=choices.find(r=>{const s=rotated(b.t,r);return s.cells.some(c=>c.exitCandidate&&dirs.some(([dx,dy],d)=>(c.exit&(1<<d))&&(dx*(boundsCentre.x-(b.cx-s.width/2+c.x+.5))+dy*(boundsCentre.y-(b.cy-s.height/2+c.y+.5)))>0));})??rotation;}
      Object.assign(b,rotated(b.t,rotation));
    }
    for(let n=0;n<200;n++)iterate();
    boxes.forEach(b=>{b.x=E.roundEven(b.cx-b.width/2)+2;b.y=E.roundEven(b.cy-b.height/2)+2;b.cx=b.x+b.width/2;b.cy=b.y+b.height/2;});
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)return null;}
    let outsideRooms=0,outsideCells=0;const ox=Math.trunc((max.x-target.x)/2)+2,oy=Math.trunc((max.y-target.y)/2)+2;
    for(const b of boxes){let count=0;for(let y=b.y;y<b.y+b.height;y++)for(let x=b.x;x<b.x+b.width;x++)if(x<ox||x>=ox+target.x||y<oy||y>=oy+target.y)count++;if(count)outsideRooms++;outsideCells+=count;}
    if(outsideRooms>1&&outsideCells>4)return null;
    for(const b of boxes){b.exits=[];for(const p of b.exitOrder){const c=b.cells.find(c=>c.x===p.x&&c.y===p.y);for(let d=0;d<4;d++)if(c.exit&(1<<d)){const [dx,dy]=dirs[d],x=b.x+c.x,y=b.y+c.y,nx=x+dx,ny=y+dy;if(!boxes.some(o=>o!==b&&nx>=o.x&&nx<o.x+o.width&&ny>=o.y&&ny<o.y+o.height))b.exits.push({x,y,nx,ny,dir:d,uses:0});}}if(!b.exits.length)return null;}
    return boxes;
  }
  function pathfind(start,end,grid){
    const {width,height,blocked,costs}=grid,sk=key(start.x,start.y),ek=key(end.x,end.y),open=[sk],states=new Map([[sk,{x:start.x,y:start.y,g:0,h:0,parent:null}]]),closed=new Set();
    const heuristic=(node,to)=>{let turn=0;const p=states.get(node.parent),gp=p&&states.get(p.parent);if(p&&gp&&(node.x-p.x!==p.x-gp.x||node.y-p.y!==p.y-gp.y))turn=1;return (Math.abs(node.x-to.x)+Math.abs(node.y-to.y))*(costs[key(node.x,node.y)]??.5)+turn;};
    while(open.length){open.sort((a,b)=>{const x=states.get(a),y=states.get(b);return x.g+x.h-y.g-y.h;});const k=open.shift(),node=states.get(k);if(k===ek){const path=[];let at=node;while(at){path.unshift({x:at.x,y:at.y});at=states.get(at.parent);}return path;}
      closed.add(k);for(let d=0;d<4;d++){const [dx,dy]=dirs[d],x=node.x+dx,y=node.y+dy,nk=key(x,y);if(x<0||y<0||x>=width||y>=height||closed.has(nk)||(blocked.has(nk)&&nk!==sk&&nk!==ek))continue;
        if(grid.masks&&(!((grid.masks[k]??15)&(1<<d))||!((grid.masks[nk]??15)&(1<<((d+2)%4)))))continue;
        const g=node.g+heuristic(node,{x,y}),prev=states.get(nk);if(!prev||g<prev.g){const next={x,y,g,h:0,parent:k};next.h=heuristic(next,end);states.set(nk,next);if(!open.includes(nk))open.push(nk);}}
    }return null;
  }
  function generate(seed,floor,nodes,delaunayPairs){
    const random=E.rng(`${seed}:room-zones-v1:${floor}`),f=floorProfile(floor),width=f.maximum.x+4,height=f.maximum.y+4;
    for(let attempt=0;attempt<128;attempt++){
      const selected=chooseTemplates(f,random),boxes=place(selected,f,random);if(!boxes)continue;
      // Prefer a wall/corridor tile between physical rooms without enlarging the
      // extracted maximum grid. This bounded preference is a prototype adapter.
      const separated=boxes.every((a,i)=>boxes.every((b,j)=>i===j||a.x+a.width<b.x||b.x+b.width<a.x||a.y+a.height<b.y||b.y+b.height<a.y));
      if(attempt<48&&!separated)continue;
      const masks={},floorCells=new Set(),reserved=new Set(),costs={},blocked=new Set(),pathMasks={};
      for(const b of boxes)for(const c of b.cells){const k=key(b.x+c.x,b.y+c.y);reserved.add(k);pathMasks[k]=c.mask;costs[k]=.25;if(c.blocked)blocked.add(k);if(c.mask||c.exitCandidate||b.spawn.some(p=>p.x===c.x&&p.y===c.y)||b.events.some(p=>p.x===c.x&&p.y===c.y)){floorCells.add(k);masks[k]=c.mask;}}
      const connect=(a,b)=>{const d=dirs.findIndex(([dx,dy])=>a.x+dx===b.x&&a.y+dy===b.y);if(d<0)return;const ka=key(a.x,a.y),kb=key(b.x,b.y);floorCells.add(ka);floorCells.add(kb);masks[ka]=(masks[ka]||0)|(1<<d);masks[kb]=(masks[kb]||0)|(1<<((d+2)%4));};
      for(const [k,mask]of Object.entries(masks)){const [x,y]=k.split(',').map(Number);dirs.forEach(([dx,dy],d)=>{if(mask&(1<<d))connect({x,y},{x:x+dx,y:y+dy});});}
      const points=boxes.map(b=>({x:b.cx,y:b.cy})),candidates=delaunayPairs(points),edges=[];
      for(const p of candidates){const [a,b]=p.split(',').map(Number),A=boxes[a],B=boxes[b],length=Math.hypot(B.cx-A.cx,B.cy-A.cy);let rankA=0,rankB=0;
        const rank=dot=>dot>.707000017?2:dot>=-.707000017?1:0;
        for(const x of A.exits)for(const y of B.exits){const u=dirs[x.dir],v=dirs[y.dir],dx=y.x-x.x,dy=y.y-x.y,n=Math.hypot(dx,dy)||1;rankA=Math.max(rankA,rank((u[0]*dx+u[1]*dy)/n));rankB=Math.max(rankB,rank((-v[0]*dx-v[1]*dy)/n));}
        edges.push({a,b,length,weight:length*[2,1.5,1][rankA]*[2,1.5,1][rankB]});
      }
      edges.sort((a,b)=>a.weight-b.weight||a.a-b.a||a.b-b.b);const parents=boxes.map((_,i)=>i),find=i=>parents[i]===i?i:parents[i]=find(parents[i]),mst=[],unused=[];
      for(const e of edges){const a=find(e.a),b=find(e.b);if(a!==b){parents[a]=b;mst.push(e);}else unused.push(e);}if(mst.length!==boxes.length-1)continue;
      const minX=Math.min(...boxes.map(b=>b.x)),minY=Math.min(...boxes.map(b=>b.y)),maxX=Math.max(...boxes.map(b=>b.x+b.width)),maxY=Math.max(...boxes.map(b=>b.y+b.height));
      const centre={x:(minX+maxX)/2,y:(minY+maxY)/2},radius=Math.hypot(maxX-centre.x,maxY-centre.y);
      const extras=unused.filter(e=>{const a=points[e.a],b=points[e.b],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((centre.x-a.x)*dx+(centre.y-a.y)*dy)/(dx*dx+dy*dy),0,1),d=Math.hypot(a.x+t*dx-centre.x,a.y+t*dy-centre.y);return d<=2.5||random()<Math.max(0,.85*(1-d/radius));});
      const paths=[];let failed=false;
      for(const edge of [...mst,...extras]){
        const pairs=[];for(const a of boxes[edge.a].exits)for(const b of boxes[edge.b].exits)pairs.push({a,b,score:Math.abs(a.nx-b.nx)+Math.abs(a.ny-b.ny)+a.uses+b.uses});pairs.sort((a,b)=>a.score-b.score);
        const pair=pairs[0];for(const exit of [pair.a,pair.b]){const k=key(exit.x,exit.y);pathMasks[k]|=1<<exit.dir;blocked.delete(k);exit.uses++;}
        const path=pathfind(pair.a,pair.b,{width,height,blocked,costs,masks:pathMasks});if(!path){failed=true;break;}
        for(let i=1;i<path.length;i++)connect(path[i-1],path[i]);
        for(const p of path){const k=key(p.x,p.y);if(!reserved.has(k))costs[k]=(costs[k]??.5)*.5;}
        paths.push({a:edge.a,b:edge.b,path,extra:extras.includes(edge)});
      }if(failed)continue;
      const distances=start=>{const out={[key(start.x,start.y)]:0},q=[start];for(let i=0;i<q.length;i++){const p=q[i],k=key(p.x,p.y);dirs.forEach(([dx,dy],d)=>{const x=p.x+dx,y=p.y+dy,nk=key(x,y);if((masks[k]&(1<<d))&&(masks[nk]&(1<<((d+2)%4)))&&out[nk]===undefined){out[nk]=out[k]+1;q.push({x,y});}});}return out;};
      const bossBox=boxes.find(b=>b.tags.includes('Tag_End')),bossSpot=bossBox.events.find(e=>e.type===3);if(!bossSpot)continue;const boss={x:bossBox.x+bossSpot.x,y:bossBox.y+bossSpot.y},fromBoss=distances(boss);
      const spawnCandidates=boxes.filter(b=>b!==bossBox).flatMap(b=>b.spawn.map(p=>({x:b.x+p.x,y:b.y+p.y,priority:b.tags.includes('Tag_Spawn')}))).filter(p=>fromBoss[key(p.x,p.y)]!==undefined);
      spawnCandidates.sort((a,b)=>Number(b.priority)-Number(a.priority)||fromBoss[key(b.x,b.y)]-fromBoss[key(a.x,a.y)]);const spawn=spawnCandidates[0];if(!spawn)continue;
      const dist=distances(spawn);if(Object.keys(dist).length!==floorCells.size)continue;
      const screen=p=>({x:p.x,y:height-1-p.y}),sk=p=>key(p.x,height-1-p.y),rooms={},used=new Set([key(spawn.x,spawn.y)]);
      const contains=(b,p)=>p.x>=b.x&&p.x<b.x+b.width&&p.y>=b.y&&p.y<b.y+b.height;
      const serviceBox=boxes.find(b=>contains(b,spawn));
      const zones=boxes.map((b,i)=>({id:`zone-${i}`,roomIndex:i,templateId:b.id,role:b===bossBox?'boss':b===serviceBox?'service':'battle',entry:b===serviceBox,
        cells:b.cells.map(c=>({x:b.x+c.x,y:b.y+c.y})).filter(p=>dist[key(p.x,p.y)]!==undefined),eventIds:[],clearCells:[],supplyCells:[]}));
      const bossZone=zones[boxes.indexOf(bossBox)],serviceZone=zones[boxes.indexOf(serviceBox)],battleZones=zones.filter(z=>z.role==='battle').sort((a,b)=>Math.min(...a.cells.map(p=>dist[key(p.x,p.y)]))-Math.min(...b.cells.map(p=>dist[key(p.x,p.y)])));
      zones.forEach(z=>{z.name=z.role==='service'?'补给休整区':z.role==='boss'?'守关区':`战斗区 ${battleZones.indexOf(z)+1}`;});
      const assign=(node,p,zone)=>{rooms[sk(p)]={...node,zoneId:zone.id,...(node.type==='boss'?{isExit:true}:{})};used.add(key(p.x,p.y));zone.eventIds.push(node.id);};
      const bossNode=nodes.find(n=>n.type==='boss');assign(bossNode,boss,bossZone);
      // Reserve an unoccupied entry/door tile in every room before filling it.
      for(const zone of zones){
        const b=boxes[zone.roomIndex],candidates=zone.cells.filter(p=>!used.has(key(p.x,p.y)));
        candidates.sort((a,c)=>{const exit=p=>b.exits.some(e=>e.uses>0&&e.x===p.x&&e.y===p.y)?1:0;return exit(c)-exit(a)||dist[key(a.x,a.y)]-dist[key(c.x,c.y)];});
        const p=zone.entry?spawn:candidates[0];if(!p){failed=true;break;}zone.clearCells.push(p);used.add(key(p.x,p.y));
      }if(failed)continue;
      const services=nodes.filter(n=>['shop','camp','treasure'].includes(n.type)),battles=nodes.filter(n=>['battle','elite'].includes(n.type)).sort((a,b)=>a.stage-b.stage||a.lane-b.lane);
      const chooseEvent=zone=>{
        const b=boxes[zone.roomIndex],candidates=zone.cells.filter(p=>!used.has(key(p.x,p.y))),placed=Object.keys(rooms).map(k=>{const [x,y]=k.split(',').map(Number);return {x,y:height-1-y};}).filter(p=>contains(b,p));
        const score=p=>{const native=b.events.some(e=>e.type!==3&&e.x+b.x===p.x&&e.y+b.y===p.y)?1:0,apart=placed.length?Math.min(...placed.map(q=>distances(q)[key(p.x,p.y)]??0)):0;return apart*10+native*2;};
        candidates.sort((a,b)=>score(b)-score(a)||dist[key(a.x,a.y)]-dist[key(b.x,b.y)]);return candidates[0];
      };
      for(const node of services){const p=chooseEvent(serviceZone);if(!p){failed=true;break;}assign(node,p,serviceZone);}if(failed)continue;
      for(let i=0;i<battles.length;i++){const zone=battleZones[Math.min(battleZones.length-1,Math.floor(i*battleZones.length/battles.length))],p=chooseEvent(zone);if(!p){failed=true;break;}assign(battles[i],p,zone);}if(failed)continue;
      if(Object.keys(rooms).length!==nodes.length)continue;
      const grid=Array.from({length:height},()=>Array(width).fill('#')),connections={};for(const k of floorCells){const [x,y]=k.split(',').map(Number);grid[height-1-y][x]='.';connections[key(x,height-1-y)]=masks[k]||0;}
      // Six supplies total: two containers, two gem sites and two cart sites.
      // All remain inside rooms; every room retains its reserved clear tile.
      const supplies=[];
      for(let i=0;i<6;i++){
        const candidates=zones.flatMap(z=>z.cells.filter(p=>!used.has(key(p.x,p.y))).map(p=>({p,z})));
        const score=({p,z})=>{const near=Math.min(...[...used].map(k=>{const [x,y]=k.split(',').map(Number);return Math.abs(p.x-x)+Math.abs(p.y-y);}));return -z.supplyCells.length*20+near*3+(z.role==='boss'?0:1);};
        candidates.sort((a,b)=>score(b)-score(a)||dist[key(a.p.x,a.p.y)]-dist[key(b.p.x,b.p.y)]);const chosen=candidates[0];
        if(!chosen){failed=true;break;}supplies.push(chosen.p);chosen.z.supplyCells.push(chosen.p);used.add(key(chosen.p.x,chosen.p.y));
      }if(failed)continue;
      const objects={};let chickenCount=0;const propTiles=supplies.slice(0,2).map(p=>key(p.x,p.y));
      propTiles.forEach((k,i)=>{const [x,y]=k.split(',').map(Number),chicken=floor===2?i===0:chickenCount===0&&random()>=.75;if(chicken)chickenCount++;objects[key(x,height-1-y)]={id:`${floor}-prop-${i}`,type:i%2?'crate':'barrel',broken:false,active:true,reward:chicken?{kind:'heal',amount:10}:{kind:'gold',amount:2+Math.floor(random()*9)}};});
      const gemSites=supplies.slice(2,4).map(screen),supplySites=supplies.slice(4,6).map(screen),owned=new Set(zones.flatMap(z=>z.cells.map(p=>key(p.x,p.y))));
      const corridorCells=[...floorCells].filter(k=>!owned.has(k)).map(k=>{const [x,y]=k.split(',').map(Number);return screen({x,y});});
      const s=screen(spawn),entryMask=connections[key(s.x,s.y)],dir=[0,1,2,3].find(d=>entryMask&(1<<d))??0;
      return {version:8,grid:grid.map(row=>row.join('')),connections,rooms,x:s.x,y:s.y,dir,floor,seen:[],visited:[],steps:0,shops:{},objects,gemSites,secrets:{},exit:{key:sk(boss),roomId:bossNode.id,ready:false,used:false},chickenCount,
        generation:{algorithm:'room-template-spring-mst-zones-v1',seed:`${seed}:room-zones-v1:${floor}`,attempts:attempt+1,roomsSeparated:separated,
          zones:zones.map(z=>{const b=boxes[z.roomIndex];return {...z,cells:z.cells.map(screen),clearCells:z.clearCells.map(screen),supplyCells:z.supplyCells.map(screen),bounds:{x:b.x,y:height-b.y-b.height,width:b.width,height:b.height}};}),corridorCells,supplySites,
          rooms:boxes.map(b=>({id:b.id,x:b.x,y:height-b.y-b.height,width:b.width,height:b.height,rotation:b.rotation,sourceHash:b.sourceHash,exits:b.exits.map(e=>({...screen(e),dir:e.dir,uses:e.uses}))})),candidateEdges:edges,mst,extraEdges:extras,paths:paths.map(p=>({...p,path:p.path.map(screen)})),sourceProfile:f.sourceProfile,source:f.source,...(f.scaleAdapter?{scaleAdapter:f.scaleAdapter}:{}),eventPlacement:`prototype room-role adapter: ${battleZones.length} battle rooms, one service room, one original boss event; corridors empty`,gemPlacement:'two room-only reserved supply sites; prototype adapter'}};
    }
    throw Error('房间生成未能通过连通检查，请换一个种子');
  }
  const api={rotated,chooseTemplates,place,pathfind,generate,floorProfile,dirs,key};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerRoomLayout=api;
})(typeof globalThis!=='undefined'?globalThis:this);
