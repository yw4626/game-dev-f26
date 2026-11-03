/* Pixel-only presentation. Rewards are committed by Run before any animation. */
(function(root){
  'use strict';
  const jobs=new Set();let canvas=null,ctx=null,raf=0;
  const pixel=3,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
  function rect(color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function sprite(name,x,y,w,h,alpha=1){const {rows,palette}=DungeonView.spriteData(name),sw=Math.max(...rows.map(r=>r.length));ctx.globalAlpha=alpha;rows.forEach((r,iy)=>[...r].forEach((c,ix)=>{if(palette[c])rect(palette[c],x+ix*w/sw,y+iy*h/rows.length,w/sw+.3,h/rows.length+.3);}));ctx.globalAlpha=1;}
  function token(x,y,size,blue,frame=0){
    const s=Math.max(1,size),edge=blue?'#12246e':'#6e3b12',base=blue?'#238fff':'#f2b82e',light=blue?'#acf2ff':'#fff1a3';
    if(blue){rect(edge,x-s,y-3*s,2*s,6*s);rect(edge,x-2*s,y-s,4*s,2*s);rect(base,x-s,y-2*s,2*s,4*s);rect(light,x-s,y-s,s,2*s);rect('#57cfff',x,y,s,2*s);}
    else {const w=frame%4===1?1:frame%4===3?2:3;rect(edge,x-w*s,y-3*s,2*w*s,6*s);rect(base,x-(w-.5)*s,y-2*s,(2*w-1)*s,4*s);rect(light,x-(w-.5)*s,y-2*s,s,3*s);}
  }
  function sparkle(x,y,color,s=1){rect(color,x-2*s,y,5*s,s);rect(color,x,y-2*s,s,5*s);}
  function finish(job){jobs.delete(job);job.resolve();}
  function teardown(){if(canvas)canvas.remove();canvas=ctx=null;cancelAnimationFrame(raf);raf=0;}
  function cancel(){for(const job of [...jobs])finish(job);teardown();}
  function ensure(){if(canvas)return;canvas=document.createElement('canvas');canvas.className='loot-fx';canvas.setAttribute('aria-hidden','true');canvas.width=Math.ceil(innerWidth/pixel);canvas.height=Math.ceil(innerHeight/pixel);document.body.append(canvas);ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;}
  function frame(now){
    if(!canvas)return;ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const job of [...jobs]){
      const t=clamp((now-job.start)/job.duration,0,1),q=Math.floor(t*18)/18,b=job.bounds,x=(b.left+b.width/2)/pixel,y=(b.top+b.height*.6)/pixel;
      if(job.reduced){sparkle(x,y,job.kind==='xp'?'#9de7ff':'#ffe79a',2);}
      else if(job.kind==='open'){
        const w=Math.max(12,b.width/pixel),h=Math.max(12,b.height/pixel),jiggle=q<.25?((Math.floor(q*30)%2)*2-1):0;
        sprite(q<.2?'treasure':'treasureOpen',x-w/2+jiggle,(b.top/pixel)-Math.sin(q*Math.PI)*2,w,h);
        if(q>.25)for(let i=0;i<5;i++){const a=i*1.9,fall=Math.sin(clamp((q-.25)/.75,0,1)*Math.PI);token(x+Math.cos(a)*9*fall,y-8-17*fall+i%2,1,false,Math.floor(q*16)+i);}
        if(q>.15&&q<.8)for(let i=0;i<4;i++)sparkle(x+Math.cos(i*1.7)*18,y+Math.sin(i*1.7)*13,'#ffe7a1');
      }else if(job.kind==='break'){
        const stone=job.source==='gargoyle',colors=stone?['#b6aa87','#81785d','#d6c8a3']:['#cd9552','#80512f','#f0c67d'];
        if(q<.18){const w=Math.max(12,b.width/pixel),h=Math.max(12,b.height/pixel);sprite(stone?'lion':job.source,x-w/2+(q<.1?-2:2),b.top/pixel,w,h);sparkle(x,y,'#fff0c5',3);}
        for(let i=0;i<17;i++){const a=i*2.399,speed=8+(i%5)*4;ctx.globalAlpha=1-q;rect(colors[i%3],x+Math.cos(a)*speed*q,y+Math.sin(a)*speed*q+24*q*q,1+i%3,1+(i+1)%3);}
        ctx.globalAlpha=1;
        if(q>.45){const name=job.reward?.kind==='gold'?'pickup':job.reward?.kind==='heal'?'chicken':job.reward?.kind==='mana'?'manaPickup':job.reward?.kind==='deal'?'dealPickup':'wildPickup';sprite(name,x-7,y-8-5*Math.sin(q*Math.PI),14,14,Math.min(1,(q-.45)*3));}
      }else if(job.kind==='collect'&&job.reward?.kind!=='gold'){
        const name=job.reward?.kind==='heal'?'chicken':job.reward?.kind==='mana'?'manaPickup':job.reward?.kind==='deal'?'dealPickup':'wildPickup';
        sprite(name,x-10,y-10-16*q,20,20,1-q);for(let i=0;i<5;i++)sparkle(x+Math.cos(i*1.25)*16*q,y+Math.sin(i*1.25)*16*q,'#b4ecff');
      }else{
        const blue=job.kind==='xp',origins=job.origins||[{x:b.left+b.width/2,y:b.top+b.height*.6}],dest=job.target(),dx=dest.x/pixel,dy=dest.y/pixel;
        origins.slice(0,8).forEach((origin,n)=>{for(let i=0;i<(blue?3:7);i++){
          const delay=(i+(n%3))*.025,u=clamp((q-delay)/(.9-delay),0,1),ox=origin.x/pixel,oy=origin.y/pixel;
          let tx,ty;
          if(u<.3){const bounce=u/.3;tx=ox+(i-2)*3*bounce;ty=oy-14*Math.sin(bounce*Math.PI);}
          else{const fly=(u-.3)/.7,ease=fly*fly;tx=mix(ox+(i-2)*3,dx,ease);ty=mix(oy,dy,ease)-Math.sin(fly*Math.PI)*12;}
          if(u<1){ctx.globalAlpha=u>.9?(1-u)*10:1;token(tx,ty,blue?1:1.25,blue,Math.floor(q*20)+i);ctx.globalAlpha=1;if(i%2===0&&u>.45)sparkle(tx-3,ty+4,blue?'#469bfc':'#ba8739',.5);}
        }});
        if(q>.82)sparkle(dx,dy,blue?'#b4eeff':'#ffe79a',2);
      }
      if(t>=1)finish(job);
    }
    canvas.dataset.kinds=[...new Set([...jobs].map(j=>j.kind))].join(' ');
    if(jobs.size)raf=requestAnimationFrame(frame);else teardown();
  }
  function play(options){
    root.PixelVFX?.loot(options);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    ensure();return new Promise(resolve=>{jobs.add({...options,resolve,reduced,start:performance.now(),duration:reduced?80:options.duration|| (options.kind==='open'?540:options.kind==='break'||options.kind==='collect'&&options.reward?.kind!=='gold'?430:880)});canvas.dataset.kinds=[...new Set([...jobs].map(j=>j.kind))].join(' ');if(!raf)raf=requestAnimationFrame(frame);});
  }
  function target(element,fallback={x:innerWidth-30,y:48}){const r=element?.getBoundingClientRect();return r&&r.width&&r.height?{x:clamp(r.left+r.width/2,14,innerWidth-14),y:clamp(r.top+r.height/2,14,innerHeight-14)}:fallback;}
  addEventListener('resize',cancel);addEventListener('pagehide',cancel);
  root.LootFX={play,cancel,target};
})(globalThis);
