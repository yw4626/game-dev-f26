/* Canvas-to-canvas handoff. Layout belongs to the formation, never to an entrance tween. */
(function(root){
 'use strict';
 let active=null;const decoded=new Map();
 const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 function warm(names){return Promise.all(names.map(name=>{const src=root.PixelAssets?.images?.[name];if(!src)return Promise.resolve();if(!decoded.has(src)){const im=new Image();im.src=src;decoded.set(src,im.decode().catch(()=>{}));}return decoded.get(src);}));}
 async function warmAll(){const names=Object.keys(root.PixelAssets?.images||{});for(let i=0;i<names.length;i+=8){await warm(names.slice(i,i+8));await new Promise(r=>setTimeout(r,20));}}
 function cancel(){if(!active)return;active.cancelled=true;active.animation?.cancel();active.zoom?.cancel();active.overlay.remove();active=null;document.getElementById('combat-screen')?.classList.remove('encounter-arrival','encounter-preparing');}
 async function enter(source,{prepare,reveal,current=()=>true}={}){
  cancel();const r=source.getBoundingClientRect(),overlay=document.createElement('canvas'),screen=document.getElementById('combat-screen');
  overlay.width=source.width;overlay.height=source.height;overlay.getContext('2d').drawImage(source,0,0);overlay.className='encounter-bridge';overlay.setAttribute('aria-hidden','true');
  Object.assign(overlay.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',transformOrigin:'0 0'});document.body.append(overlay);
  const token={overlay,cancelled:false};active=token;screen.classList.add('encounter-preparing');
  token.zoom=overlay.animate([{transform:'scale(1)'},{transform:'scale(1.025)'}],{duration:240,easing:'ease-out',fill:'forwards'});
  try{
   // Give the browser a paint before preparing the new background in small slices.
   await nextFrame();await prepare();if(token.cancelled||!current())return;
   reveal();const target=document.getElementById('battle-backdrop').getBoundingClientRect(),from=getComputedStyle(overlay).transform;
   screen.classList.remove('encounter-preparing');screen.classList.add('encounter-arrival');
   token.zoom.cancel();token.animation=overlay.animate([{transform:from,opacity:1},{transform:`translate(${target.left-r.left}px,${target.top-r.top}px) scale(${target.width/r.width},${target.height/r.height})`,opacity:1,offset:.45},{transform:`translate(${target.left-r.left}px,${target.top-r.top}px) scale(${target.width/r.width},${target.height/r.height})`,opacity:0}],{duration:440,easing:'ease-in-out',fill:'forwards'});
   await token.animation.finished.catch(()=>{});
  }finally{overlay.remove();token.zoom?.cancel();token.animation?.cancel();if(active===token){active=null;screen.classList.remove('encounter-arrival','encounter-preparing');}}
 }
 addEventListener('pagehide',cancel);addEventListener('resize',cancel);
 if(typeof requestIdleCallback==='function')requestIdleCallback(warmAll,{timeout:900});else setTimeout(warmAll,300);
 root.EncounterView={enter,warm,cancel};
})(globalThis);
