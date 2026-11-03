/* Local PixelFX sprite playback. All coordinates are visual; never consumes game RNG. */
(function(root){
 'use strict';
 const assets=root.PixelFXAssets||{},images=new Map(),jobs=new Set(),shakes=new Map(),PX=3;
 let canvas,ctx,raf=0,lastShake=0,painted=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,clamp=t=>Math.max(0,Math.min(1,t));
 const ready=Promise.all(Object.entries(assets).map(([id,a])=>new Promise(resolve=>{const img=new Image();images.set(id,img);img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=a.src;})));
 function draw(context,id,t,x,y,scale=1,options={}){
  const a=assets[id],img=images.get(id);if(!a||!img?.complete||!img.naturalWidth)return false;
  const i=Math.min(a.n-1,Math.floor(clamp(t)*a.n)),anchor=options.anchor||a.anchor;
  context.save();context.imageSmoothingEnabled=false;context.globalAlpha*=options.alpha??1;
  context.translate(Math.round(x),Math.round(y));if(options.angle)context.rotate(options.angle);
  context.drawImage(img,(i%a.columns)*a.w,Math.floor(i/a.columns)*a.h,a.w,a.h,-anchor[0]*scale,-anchor[1]*scale,a.w*scale,a.h*scale);context.restore();painted++;return true;
 }
 const impactIds={whip:'impacts/hit-spark',fire:'explosions/small-explosion',axe:'melee/heavy-cleave',cross:'melee/sword-slash',bible:'holy/smite',wand:'arcane/mana-burst',knife:'impacts/hit-spark',guns:'impacts/hit-spark',lightning:'lightning/zap-hit',aura:'arcane/mana-burst',song:'holy/heal',rune:'explosions/plasma-explosion',water:'water/splash',claw:'melee/claw-swipe',birds:'holy/smite',drill:'impacts/blunt-hit',cart:'impacts/blunt-hit',ice:'ice/ice-shatter',flowers:'pickups/collect-burst'};
 // Native whip contact is 0.21 s. Map it to the shared hit boundary; never play the crack early.
 function weapon(context,job,t){
  const family=job.family,targets=job.targets.slice(0,8),contact=job.contactAt,flight=clamp(t/contact),after=clamp((t-contact)/(1-contact));
  let replaced=false;
  for(const p of targets){
   const x=p.x/PX,y=p.y/PX,origin={x:(job.arena.left+job.arena.width*.5)/PX,y:Math.min(job.arena.bottom/PX-20,y+65)},scale=job.evolved?.57:.48;
   if(job.splash){if(t>=contact)draw(context,'water/splash',after,x,y,.4,{alpha:.65*(1-after*.7)});continue;}
   if(family==='whip'){
    const frame=t<contact?flight*.21/.85:(.21+after*.64)/.85;
    replaced=draw(context,'melee/whip-crack',frame,x,y,.67,{alpha:t>.85?(1-t)/.15:1})||replaced;
   }else if(family==='fire'){
    if(t<contact){
     const angle=Math.atan2(y-origin.y,x-origin.x);
     for(let tail=3;tail>=1;tail--){const f=Math.max(0,flight-tail*.09);draw(context,'fire/fireball',.25+flight*.65,origin.x+(x-origin.x)*f,origin.y+(y-origin.y)*f,scale*.65,{angle,alpha:.12});}
     replaced=draw(context,'fire/fireball',.25+flight*.65,origin.x+(x-origin.x)*flight,origin.y+(y-origin.y)*flight,scale*1.4,{angle})||replaced;
    }else{
     replaced=draw(context,'explosions/small-explosion',after*.8,x,y,.48,{alpha:1-after*.5})||replaced;
     // Rising flame tongues and embers are visual feedback, not a new damage-over-time rule.
     for(let flame=0;flame<3;flame++)draw(context,'fire/fireball',(.3+after*.6+flame*.17)%1,x+(flame-1)*7,y+7-after*(12+flame*3),.23,{angle:-Math.PI/2,alpha:(1-after)*.8});
     context.save();context.globalAlpha*=1-after;
     for(let i=0;i<12;i++){context.fillStyle=i%3?'#ff9c32':'#fff4ad';context.fillRect(Math.round(x+Math.sin(i*2.4)*after*26),Math.round(y+8-after*(15+i*3)),i%3?1:2,2);}
     context.restore();
    }
   }else if(family==='wand'&&t<contact){
    draw(context,'arcane/arcane-orb',flight,origin.x+(x-origin.x)*flight,origin.y+(y-origin.y)*flight,.32,{anchor:[68,52]});
   }else if(family==='lightning'){
    const phase=t<contact?flight*.76/1.6:(.76+after*.84)/1.6;
    replaced=draw(context,'lightning/lightning-strike',phase,x,y,.45,{anchor:[120,228],alpha:t>.85?(1-t)/.15:1})||replaced;
   }
   if(t>=contact&&family!=='fire'){
    const onset={axe:.335/1.6,cross:.06/.75,bible:.54/1.6,wand:.22/1.6,water:.16/1.6,ice:.26/1.6}[family]||0;
    draw(context,impactIds[family]||'impacts/hit-spark',onset+(1-onset)*after,x,y,['bible','rune','lightning'].includes(family)?.4:.46,{alpha:.85*(1-after*.65)});
   }
  }
  return replaced;
 }
 function ensure(){if(canvas)return;canvas=document.createElement('canvas');canvas.className='pixelfx-world';canvas.setAttribute('aria-hidden','true');canvas.width=Math.ceil(innerWidth/PX);canvas.height=Math.ceil(innerHeight/PX);ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;document.body.append(canvas);}
 function frame(now){
  if(!canvas)return;ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const job of [...jobs]){const t=clamp((now-job.start)/job.duration);ctx.save();if(job.bounds){const b=job.bounds;ctx.beginPath();ctx.rect(b.left/PX,b.top/PX,b.width/PX,b.height/PX);ctx.clip();}draw(ctx,job.id,t,job.x/PX,job.y/PX,job.scale,{alpha:1-t*.5});ctx.restore();if(t>=1)jobs.delete(job);}
  canvas.dataset.effects=[...jobs].map(j=>j.id).join(' ');if(jobs.size)raf=requestAnimationFrame(frame);else{canvas.remove();canvas=ctx=null;raf=0;}
 }
 function emit(id,x,y,{scale=.7,duration=440,bounds}={}){if(reduced()||document.hidden)return;ensure();if(jobs.size>=18)jobs.delete(jobs.values().next().value);jobs.add({id,x,y,scale,duration:Math.max(80,duration),bounds,start:performance.now()});if(!raf)raf=requestAnimationFrame(frame);}
 function shake(strength=2){
  const now=performance.now();if(reduced()||now-lastShake<100)return;lastShake=now;
  // Move only the camera background. Cards, controls and readouts remain readable.
  for(const el of document.querySelectorAll('#battle-backdrop,#dungeon-canvas')){if(!el.getBoundingClientRect().width)continue;shakes.get(el)?.cancel();const a=el.animate([{translate:'0 0'},{translate:`${-strength}px ${strength*.4}px`,offset:.18},{translate:`${strength*.7}px ${-strength*.35}px`,offset:.42},{translate:`${-strength*.3}px 0`,offset:.7},{translate:'0 0'}],{duration:180,easing:'steps(6)'});shakes.set(el,a);a.finished.catch(()=>{}).finally(()=>{if(shakes.get(el)===a)shakes.delete(el);a.cancel();});}
 }
 function impact({x,y,blocked=false,heavy=false,death=false}){emit(blocked?'impacts/shield-block':death?'arcane/mana-burst':'impacts/hit-spark',x,y,{scale:blocked?.5:death?.42:.36,duration:death?320:250,bounds:document.querySelector('.arena')?.getBoundingClientRect()});if(death||heavy)shake(death?3:2);}
 function wall(el){const b=el?.getBoundingClientRect();if(b)emit('impacts/blunt-hit',b.left+b.width*.5,b.top+b.height*.55,{scale:.5,duration:240,bounds:b});shake(2);root.GameAudio?.play('bump');}
 function loot(options){
  const b=options.bounds;if(!b)return;const x=b.left+b.width*.5,y=b.top+b.height*.45;
  if(options.kind==='break'){emit('explosions/dirt-explosion',x,y,{scale:.5,duration:420});shake(3);root.GameAudio?.play('break');}
  else if(options.kind==='open'){emit('pickups/collect-burst',x,y,{scale:.6,duration:530});root.GameAudio?.play('chest');}
  else if(options.kind==='xp')root.GameAudio?.play('xp');
  else if(options.kind==='collect'){emit(options.reward?.kind==='heal'?'holy/heal':'pickups/collect-burst',x,y,{scale:.42,duration:350});root.GameAudio?.play(options.reward?.kind==='gold'?'coin':'pickup');}
 }
 function buff(preview){
  const mana=preview.manaGain>0,armor=preview.armor>0,heal=preview.healGain>0;
  const r=document.querySelector(mana?'#mana-value':heal?'#health-value':armor?'#armor-value':'.chain-panel')?.getBoundingClientRect();if(!r)return;
  emit(heal?'holy/heal':armor?'impacts/shield-block':mana?'arcane/mana-burst':'pickups/collect-burst',r.left+r.width/2,r.top+r.height/2,{scale:.38,duration:250});root.GameAudio?.play(armor?'block':mana?'wand':'pickup');
 }
 function cancel(){jobs.clear();cancelAnimationFrame(raf);raf=0;canvas?.remove();canvas=ctx=null;for(const a of shakes.values())a.cancel();shakes.clear();}
 addEventListener('resize',cancel);addEventListener('pagehide',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 root.PixelVFX={ready,draw,weapon,emit,impact,wall,loot,buff,shake,cancel,stats:()=>({loaded:[...images.values()].filter(i=>i.complete&&i.naturalWidth).length,total:images.size,active:jobs.size,painted})};
})(globalThis);
