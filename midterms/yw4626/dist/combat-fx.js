/* Discrete pixel weapon effects and staged enemy movement. Presentation only. */
(function(root){
 'use strict';
 const jobs=new Set(),animations=new Set(),PX=3;let canvas,ctx,frameId=0;
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function rect(color,x,y,w=1,h=1){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
 function line(points,color,size=1){for(let n=1;n<points.length;n++){const a=points[n-1],b=points[n],steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)));for(let i=0;i<=steps;i++){const t=i/steps;rect(color,lerp(a.x,b.x,t)-size/2,lerp(a.y,b.y,t)-size/2,size,size);}}}
 function ring(x,y,r,color,phase=0){const points=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2+phase;points.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r*.48});}line(points,color,1);}
 function sprite(name,x,y,size,angle=0){const {rows,palette}=DungeonView.spriteData(name),w=Math.max(...rows.map(r=>r.length));for(let iy=0;iy<rows.length;iy++)for(let ix=0;ix<rows[iy].length;ix++){const color=palette[rows[iy][ix]];if(!color)continue;const u=(ix-w/2)*size/w,v=(iy-rows.length/2)*size/rows.length;rect(color,x+u*Math.cos(angle)-v*Math.sin(angle),y+u*Math.sin(angle)+v*Math.cos(angle),size/w+.5,size/rows.length+.5);}}
 function burst(x,y,t,color='#fff3ae',radius=15){for(let i=0;i<10;i++){const a=i*2.399,r=radius*t;rect(color,x+Math.cos(a)*r,y+Math.sin(a)*r,1+(i%2),1+(i%2));}}
 function bolt(x,y,top,t,color){const p=[];for(let i=0;i<=8;i++)p.push({x:x+(i===8?0:Math.sin(i*13+Math.floor(t*7))*6),y:lerp(top,y,i/8)});line(p,color,3);line(p,'#f0f5ff',1);}
 function drawAttack(job,t){
  if(['fire','whip','lightning'].includes(job.family)&&root.PixelVFX?.weapon(ctx,job,t))return;
  const q=Math.floor(t*18)/18,arr=job.targets.slice(0,8),family=job.family,color=job.evolved?'#eab8ff':'#ffe6ad',flight=clamp(q/.3),after=clamp((q-.35)/.65),a=job.arena;
  for(let n=0;n<arr.length;n++){
   const target=arr[n],x=target.x/PX,y=target.y/PX,origin={x:a.left/PX+a.width/PX*.5,y:Math.min(a.bottom/PX-20,y+65)},travel={x:lerp(origin.x,x,flight),y:lerp(origin.y,y,flight)},alpha=q>.8?(1-q)*5:1;
   ctx.globalAlpha=alpha;
   if(job.splash){ring(x,y,4+after*17,'#64d3ed');burst(x,y,after,'#acf6ff');continue;}
   if(family==='whip'){
    const points=Array.from({length:18},(_,i)=>({x:x-35+i*4,y:y+Math.sin(i*.35-q*5)*7}));line(points.slice(0,Math.max(2,Math.ceil(flight*18))),'#b66e3b',4);line(points.slice(0,Math.max(2,Math.ceil(flight*18))),job.evolved?'#f68085':'#ffe2a2',1);
   }else if(family==='axe'||family==='cross'){
    const endX=family==='cross'&&q>.7?lerp(x,origin.x,(q-.7)/.3):travel.x,endY=family==='cross'&&q>.7?lerp(y,origin.y,(q-.7)/.3):travel.y-Math.sin(flight*Math.PI)*30;
    for(let i=2;i>0;i--)sprite(family==='axe'?(job.evolved?'icon-deathSpiral':'icon-axe'):(job.evolved?'icon-heavenSword':'icon-cross'),endX-i*3,endY+i*2,10,'axe'===family?q*9:q*12);
    sprite(family==='axe'?(job.evolved?'icon-deathSpiral':'icon-axe'):(job.evolved?'icon-heavenSword':'icon-cross'),endX,endY,18,q*10);
   }else if(family==='bible'){
    const r=13+Math.sin(q*Math.PI)*9;ring(x,y,r,job.evolved?'#b775e5':'#f2df97',q*2);for(let i=0;i<3;i++){const angle=q*6+i*Math.PI*2/3;sprite(job.evolved?'icon-unholyVespers':'icon-bible',x+Math.cos(angle)*r,y+Math.sin(angle)*r*.55,11);}
   }else if(family==='wand'||family==='knife'||family==='guns'){
    const c=family==='wand'?'#78d7ff':family==='guns'?(job.key==='eightSparrow'?'#6d9fff':'#ff6758'):'#e5e6ff';
    for(let i=0;i<(job.evolved?4:2);i++){const f=clamp(flight-i*.09);line([{x:lerp(origin.x,x,Math.max(0,f-.18)),y:lerp(origin.y,y,Math.max(0,f-.18))},{x:lerp(origin.x,x,f),y:lerp(origin.y,y,f)}],c,family==='knife'?1:2);}
    if(family==='knife')sprite('icon-knife',travel.x,travel.y,16,-.7);else{rect('#f0ffff',travel.x-1,travel.y-1,3,3);burst(x,y,after,c,12);}
   }else if(family==='fire'){
    for(let i=0;i<9;i++){const f=clamp(flight-i*.025),size=4-i*.3;rect(i<3?'#ffe898':'#e66d34',lerp(origin.x,x,f)-size/2,lerp(origin.y,y,f)+Math.sin(i+q*13)*2,size,size);}
    if(q>.35){burst(x,y,after,'#ffb94c',23);for(let i=0;i<5;i++)rect(i%2?'#ffce61':'#e8553d',x-10+i*5,y-14*Math.sin(q*7+i),3,5);}
   }else if(family==='lightning'){if(q>.12)bolt(x,y,Math.max(a.top/PX+4,y-70),q,job.evolved?'#c085ff':'#75b7ff');ring(x,y+7,after*15,'#aaa8fa');}
   else if(family==='aura'||family==='song'){
    for(let i=0;i<3;i++){const r=5+((q+i/3)%1)*27;ring(x,y+(family==='song'?i*9-18:12),r,job.evolved?'#bc73cc':family==='song'?'#94e2c9':'#c9dfac');}
   }else if(family==='rune'){
    const ps=[origin,{x:x-22,y:y-30},{x:x+25,y:y+12},{x,y}],progress=clamp(q/.3)*3,segment=Math.min(2,Math.floor(progress)),t0=progress-segment,p=ps[segment],z=ps[segment+1];line(ps.slice(0,segment+1).concat([{x:lerp(p.x,z.x,t0),y:lerp(p.y,z.y,t0)}]),'#a784ff',1);sprite(job.evolved?'icon-noFuture':'icon-runetracer',lerp(p.x,z.x,t0),lerp(p.y,z.y,t0),12,q*4);
   }else if(family==='water'){
    if(q<.45){sprite('icon-water',travel.x,travel.y-Math.sin(flight*Math.PI)*27,14,q*4);}else{ring(x,y+12,9+after*20,'#61ceff');for(let i=0;i<7;i++)rect(i%2?'#85e9ff':'#477ff6',x-18+i*6,y+12-4-Math.abs(Math.sin(q*7+i))*17,3,8);}
   }else if(family==='claw'){for(let i=0;i<3;i++)line([{x:x-16+i*7,y:y-17},{x:x+7+i*7,y:y+18}],job.evolved?'#90ef7a':'#ffbdcb',2);}
   else if(family==='birds'){for(let i=0;i<5;i++){const f=clamp(flight-i*.05);sprite('icon-knife',x-25+i*12,y-55+f*55,8,1.7);rect(job.key==='ebonyWings'?'#a78bd0':'#fff5d0',x-25+i*12,y-55+f*55,2,2);}}
   else if(family==='drill'||family==='cart'){sprite(family==='cart'?'icon-carrello':job.evolved?'icon-valkyrieTurner':'icon-shadowPinion',travel.x,travel.y,22,family==='cart'?0:q*9);burst(x,y,after,'#e7be79',19);}
   else if(family==='ice'){line([origin,{x,y}],'#79d8f7',2);for(let i=0;i<6;i++){const angle=i*Math.PI/3;line([{x,y},{x:x+Math.cos(angle)*20,y:y+Math.sin(angle)*20}],'#e3fcff',1);}}
   else if(family==='flowers'){for(let i=0;i<6;i++){const angle=i*1.05+q*3;sprite('icon-celestial',x+Math.cos(angle)*after*24,y+Math.sin(angle)*after*18,9,angle);}}
   if(q>.38&&q<.7&&!['bible','aura','song','ice'].includes(family))burst(x,y,after,color,13);
  }
  ctx.globalAlpha=1;
  if(!['fire','whip','lightning'].includes(job.family))root.PixelVFX?.weapon(ctx,job,t);
 }
 function drawDeath(job,t){const {rows,palette}=DungeonView.spriteData(job.sprite),b=job.bounds,sw=Math.max(...rows.map(r=>r.length)),sh=rows.length,scale=Math.min(b.width/(sw+4),b.height/(sh+4))/PX,left=(b.left+b.width/2)/PX-sw*scale/2,top=(b.top+b.height/2)/PX-sh*scale/2,q=Math.floor(t*9)/9;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const c=palette[rows[y]?.[x]];if(!c)continue;const noise=((x*17+y*31)%29)/29;if(q>noise+.25)continue;const drift=q*q;ctx.globalAlpha=1-q*.8;rect(t<.12?'#fff0c8':c,left+x*scale+(x-sw/2)*drift*.6,top+y*scale+drift*(10+noise*15),scale,scale);}
  ctx.globalAlpha=1;
 }
 function resolveJob(job){jobs.delete(job);job.contact?.();job.resolve();}
 function cleanup(){canvas?.remove();canvas=ctx=null;cancelAnimationFrame(frameId);frameId=0;}
 function cancel(){for(const job of [...jobs])resolveJob(job);for(const animation of animations)animation.cancel();animations.clear();cleanup();}
 function ensure(){if(canvas)return;canvas=document.createElement('canvas');canvas.className='combat-pixel-fx';canvas.setAttribute('aria-hidden','true');canvas.width=Math.ceil(innerWidth/PX);canvas.height=Math.ceil(innerHeight/PX);ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;document.body.append(canvas);}
 function frame(now){if(!canvas)return;ctx.clearRect(0,0,canvas.width,canvas.height);for(const job of [...jobs]){const t=clamp((now-job.start)/job.duration);if(t>=job.contactAt&&!job.contacted){job.contacted=true;job.onContact?.();job.contact?.();}ctx.save();const a=job.arena;ctx.beginPath();ctx.rect(a.left/PX,a.top/PX,a.width/PX,a.height/PX);ctx.clip();if(job.kind==='death')drawDeath(job,t);else drawAttack(job,t);ctx.restore();if(t>=1)resolveJob(job);}if(jobs.size){canvas.dataset.families=[...new Set([...jobs].filter(j=>j.kind==='attack').map(j=>j.family))].join(' ');frameId=requestAnimationFrame(frame);}else cleanup();}
 function effect(options){if(reduced()){options.onContact?.();return {contact:Promise.resolve(),finished:Promise.resolve()};}ensure();let onContact,onFinish;const contact=new Promise(r=>onContact=r),finished=new Promise(r=>onFinish=r);jobs.add({...options,start:performance.now(),contact:onContact,resolve:onFinish});canvas.dataset.families=[...new Set([...jobs].filter(j=>j.kind==='attack').map(j=>j.family))].join(' ');if(!frameId)frameId=requestAnimationFrame(frame);return {contact,finished};}
 function arena(){const r=document.querySelector('.arena')?.getBoundingClientRect();return r||{left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight};}
 function attack({def,key,targets,pace=1,splash=false}){const family=CombatMotion.family(def);return effect({kind:'attack',family,key,targets,splash,evolved:!!def.isEvolved,arena:arena(),duration:288*pace,contactAt:.34,onContact:()=>{root.GameAudio?.play(family);if(['fire','axe','rune','lightning'].includes(family)&&!splash)root.PixelVFX?.shake(def.isEvolved?3:1.5);}});}
 function animate(el,frames,options){if(!el||reduced())return Promise.resolve();const a=el.animate(frames,options);animations.add(a);return a.finished.catch(()=>{}).finally(()=>{animations.delete(a);a.cancel();});}
 function capture(){return new Map([...document.querySelectorAll('#enemies>.enemy')].map(el=>{const r=el.querySelector('.enemy-art').getBoundingClientRect();return [Number(el.dataset.enemy),{left:r.left,top:r.top,width:r.width,height:r.height,depth:Number(el.dataset.depth)}];}));}
 function hit(el,{blocked=false,heavy=false,pace=1}={}){if(!el)return Promise.resolve();el.classList.add(blocked?'enemy-blocked':'enemy-hit');const art=el.querySelector('.enemy-art'),r=art.getBoundingClientRect(),amount=heavy?3:blocked?2:8;root.PixelVFX?.impact({x:r.left+r.width/2,y:r.top+r.height*.55,blocked,heavy});if(blocked)root.GameAudio?.play('block');return animate(art,[{translate:'0 0',scale:'1 1',filter:blocked?'brightness(1.7) sepia(.5) hue-rotate(140deg)':'brightness(0) invert(1)'},{translate:`${amount}px -5px`,scale:blocked?'.98 1.02':'1.13 .88',filter:blocked?'brightness(1.4)':'brightness(0) invert(1)',offset:.18},{translate:`${-amount*.25}px -2px`,scale:'.97 1.04',filter:'none',offset:.5},{translate:'0 0',scale:'1 1',filter:'none'}],{duration:162*pace,easing:'steps(7)'}).finally(()=>el.classList.remove('enemy-blocked','enemy-hit'));}
 function die(el,sprite,pace=1){if(!el)return Promise.resolve();el.classList.add('enemy-dying');const art=el.querySelector('.enemy-art'),r=art.getBoundingClientRect();art.style.visibility='hidden';root.PixelVFX?.impact({x:r.left+r.width/2,y:r.top+r.height*.55,death:true});root.GameAudio?.play('death');const bounds={left:r.left,top:r.top,width:r.width,height:r.height};return effect({kind:'death',sprite,bounds,arena:arena(),duration:204*pace,contactAt:0}).finished.then(()=>{el.remove();});}
 function advance(el,from,pace=1){const art=el?.querySelector('.enemy-art');if(!art)return Promise.resolve();const to=art.getBoundingClientRect(),fallback={left:to.left+to.width*.2,top:to.top-42,width:to.width*.6,height:to.height*.6,virtual:true};el.classList.add('enemy-advancing');return animate(art,CombatMotion.stride(from||fallback,to,{floating:/ghost|wraith|bat/i.test(el.dataset.visual||''),heavy:el.classList.contains('boss-enemy')}),{duration:252*pace,easing:'linear'}).finally(()=>el.classList.remove('enemy-advancing'));}
 addEventListener('resize',cancel);addEventListener('pagehide',cancel);
 root.CombatFX={attack,capture,hit,die,advance,cancel};
})(globalThis);
