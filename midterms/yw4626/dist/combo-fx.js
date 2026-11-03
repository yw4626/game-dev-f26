/* One arena-wide counter; particles are capped even for multi-target attacks. */
(function(root){
 'use strict';let burst=null,timer=null;
 const tierOf=n=>n>=10?3:n>=6?2:n>=3?1:0;
 function clearBurst(){clearTimeout(timer);burst?.remove();burst=null;}
 function render(multiplier){
  const arena=document.querySelector('.arena');if(!arena)return null;
  let label=arena.querySelector('.battle-combo-number');
  const n=Math.max(0,Math.trunc(multiplier||0));
  if(!n){label?.remove();clearBurst();return null;}
  if(!label){label=document.createElement('span');arena.append(label);}
  label.className='battle-combo-number tier-'+tierOf(n);
  label.textContent='×'+n;
  return label;
 }
 function hit(multiplier){
  const label=render(multiplier);if(!label)return;
  const arena=label.parentElement,n=Math.max(1,Math.trunc(multiplier||1)),tier=tierOf(n);
  clearBurst();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  label.getAnimations().forEach(a=>a.cancel());
  label.animate([{scale:1.2,filter:'brightness(1.8)'},{scale:1,filter:'brightness(1)'}],{duration:280,easing:'steps(5,end)'});
  const el=document.createElement('div');el.className='enemy-combo-burst tier-'+tier;el.setAttribute('aria-hidden','true');
  const count=[2,5,8,12][tier];for(let i=0;i<count;i++){
   const dot=document.createElement('i'),angle=i/count*Math.PI*2;
   dot.style.setProperty('--sx',Math.round(Math.cos(angle)*(36+tier*10))+'px');
   dot.style.setProperty('--sy',Math.round(Math.sin(angle)*(26+tier*8))+'px');el.append(dot);
  }
  arena.append(el);burst=el;timer=setTimeout(clearBurst,1000);
 }
 root.ComboFX={render,hit};
})(globalThis);
