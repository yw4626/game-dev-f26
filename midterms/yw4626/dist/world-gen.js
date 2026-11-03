/* Reconstructed pipeline: room placement -> MST -> extra links -> tile events -> props.
 * Placement and rasterization are prototype approximations of the original RoomSpring/templates. */
(function(root){
  'use strict';
  const engine=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Crawler;
  const key=(x,y)=>`${x},${y}`,dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  function delaunayPairs(points){
    // Empty-circumcircle triangulation for the small room set. Tiny deterministic
    // perturbations resolve cocircular ties; native Delaunator may choose other ties.
    const p=points.map((v,i)=>({x:v.x+i*.000001,y:v.y+i*i*.0000001})),edges=new Set();
    for(let a=0;a<p.length;a++)for(let b=a+1;b<p.length;b++)for(let c=b+1;c<p.length;c++){
      const A=p[a],B=p[b],C=p[c],den=2*(A.x*(B.y-C.y)+B.x*(C.y-A.y)+C.x*(A.y-B.y));
      if(Math.abs(den)<1e-9)continue;
      const aa=A.x*A.x+A.y*A.y,bb=B.x*B.x+B.y*B.y,cc=C.x*C.x+C.y*C.y;
      const x=(aa*(B.y-C.y)+bb*(C.y-A.y)+cc*(A.y-B.y))/den,y=(aa*(C.x-B.x)+bb*(A.x-C.x)+cc*(B.x-A.x))/den,r=(x-A.x)**2+(y-A.y)**2;
      if(p.some((v,i)=>i!==a&&i!==b&&i!==c&&(v.x-x)**2+(v.y-y)**2<r-1e-8))continue;
      for(const pair of [[a,b],[a,c],[b,c]])edges.add(pair.join(','));
    }
    if(!edges.size)for(let i=1;i<points.length;i++)edges.add(`${i-1},${i}`);
    return edges;
  }
  function generate(seed,floor,nodes){
    const random=engine.rng(`${seed}:world-v4:${floor}`),W=15,H=17;
    const cells=Array.from({length:H},()=>Array(W).fill('#'));
    const points=[{x:7,y:13}];
    const candidates=engine.shuffle(Array.from({length:42},(_,i)=>({x:1+(i%7)*2,y:1+Math.floor(i/7)*2})),random);
    for(const p of candidates)if(points.every(q=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y)>=4)){points.push(p);if(points.length===nodes.length)break;}
    if(points.length<nodes.length)for(const p of candidates)if(!points.some(q=>q.x===p.x&&q.y===p.y)){points.push(p);if(points.length===nodes.length)break;}
    const candidatesGraph=delaunayPairs(points);
    const edges=[];for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++)if(candidatesGraph.has(`${a},${b}`)){const p=points[a],q=points[b];edges.push({a,b,length:Math.hypot(p.x-q.x,p.y-q.y)});}
    edges.sort((a,b)=>a.length-b.length||a.a-b.a||a.b-b.b);
    const parents=points.map((_,i)=>i),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
    const used=[],unused=[];
    for(const edge of edges){const a=find(edge.a),b=find(edge.b);if(a!==b){parents[a]=b;used.push(edge);}else unused.push(edge);}
    const center={x:(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,y:(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2};
    const radius=Math.max(...points.map(p=>Math.hypot(p.x-center.x,p.y-center.y)));
    // Confirmed native rule: closest point of an unused edge to the map center,
    // radius 2.5 always selected, otherwise chance .85*(1-distance/maxDistance).
    const extras=unused.filter(e=>{
      const a=points[e.a],b=points[e.b],dx=b.x-a.x,dy=b.y-a.y;
      const t=Math.max(0,Math.min(1,((center.x-a.x)*dx+(center.y-a.y)*dy)/(dx*dx+dy*dy)));
      const distance=Math.hypot(a.x+t*dx-center.x,a.y+t*dy-center.y);
      return distance<=2.5||random()<Math.max(0,.85*(1-distance/radius));
    });
    const carve=(p,q)=>{
      let x=p.x,y=p.y;cells[y][x]='.';
      const horizontal=()=>{while(x!==q.x){x+=Math.sign(q.x-x);cells[y][x]='.';}};
      const vertical=()=>{while(y!==q.y){y+=Math.sign(q.y-y);cells[y][x]='.';}};
      if(random()<.5){horizontal();vertical();}else{vertical();horizontal();}
    };
    for(const e of [...used,...extras])carve(points[e.a],points[e.b]);
    cells[14][7]='.';cells[15][7]='.';
    const distance={},queue=[[7,15,0]];distance['7,15']=0;
    for(let i=0;i<queue.length;i++){const [x,y,d]=queue[i];for(const [dx,dy]of dirs){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(cells[ny]?.[nx]==='.'&&distance[k]===undefined){distance[k]=d+1;queue.push([nx,ny,d+1]);}}}
    const ordered=points.slice(1).sort((a,b)=>distance[key(a.x,a.y)]-distance[key(b.x,b.y)]);
    const rooms={},entrance=nodes.find(n=>n.type==='battle'&&n.stage===0),boss=nodes.find(n=>n.type==='boss');
    rooms['7,13']={...entrance};const end=ordered.pop(),exitKey=key(end.x,end.y);rooms[exitKey]={...boss,isExit:true};
    const rest=nodes.filter(n=>n!==entrance&&n!==boss).sort((a,b)=>({shop:0,camp:1,treasure:2,battle:3,elite:4}[a.type]-{shop:0,camp:1,treasure:2,battle:3,elite:4}[b.type]));
    rest.forEach((n,i)=>{const p=ordered[i];rooms[key(p.x,p.y)]={...n};});
    const objects={},secrets={};
    // Light-source loot: 75 gold : 25 chicken, inclusive 2..10 coins, <=1 chicken/floor.
    let chickenCount=0;
    const propTiles=engine.shuffle(queue.filter(([x,y])=>!rooms[key(x,y)]&&!(x===7&&y>=13)),random).slice(0,3);
    propTiles.unshift([7,14]);
    propTiles.forEach(([x,y],i)=>{
      const chicken=floor===2?i===0:chickenCount===0&&random()>=.75;if(chicken)chickenCount++;
      objects[key(x,y)]={id:`${floor}-prop-${i}`,type:i%2?'crate':'barrel',broken:false,active:true,reward:chicken?{kind:'heal',amount:10}:{kind:'gold',amount:2+Math.floor(random()*9)}};
    });
    // Secret doors intentionally absent: no reliable native evidence was found.
    return {version:4,grid:cells.map(row=>row.join('')),rooms,x:7,y:15,dir:0,floor,seen:[],visited:[],steps:0,shops:{},objects,secrets,
      exit:{key:exitKey,roomId:boss.id,ready:false,used:false},chickenCount,
      generation:{algorithm:'room-delaunay-mst-prototype-v1',rooms:points,candidateEdges:edges,mst:used,extraEdges:extras,seed:`${seed}:world-v4:${floor}`}};
  }
  const layout=typeof module!=='undefined'&&module.exports?require('./room-layout.js'):root.CrawlerRoomLayout;
  const api={generate:(seed,floor,nodes)=>layout.generate(seed,floor,nodes,delaunayPairs),generateV4:generate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerWorld=api;
})(typeof globalThis!=='undefined'?globalThis:this);
