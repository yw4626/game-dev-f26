/* Enemy intent, lunge/contact/recovery and player HUD reactions. No rules. */
(function(root){
 'use strict';
 const jobs=new Set(),nodes=new Set(),marks=new Set();
 const $=s=>document.querySelector(s),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tr=(zh,en)=>CrawlerLocale.language==='en'?en:zh;
 function mark(el,name){if(!el)return ()=>{};el.classList.add(name);const item={el,name};marks.add(item);return ()=>{el.classList.remove(name);marks.delete(item);};}
 function node(tag,cls,parent=$('.arena')){const el=document.createElement(tag);el.className=cls;parent.append(el);nodes.add(el);return el;}
 function remove(el){el?.remove();nodes.delete(el);}
 function timeline(el,frames,duration,contactAt=.46,onProgress){
  let contactResolve,finishResolve,raf=0,contacted=false,done=false;const contact=new Promise(r=>contactResolve=r),finished=new Promise(r=>finishResolve=r),quiet=reduced(),animation=el&&!quiet?el.animate(frames,{duration,easing:'linear',fill:'both'}):null,start=performance.now();
  const touch=()=>{if(!contacted){contacted=true;contactResolve();}};
  const finish=()=>{if(done)return;done=true;touch();cancelAnimationFrame(raf);animation?.cancel();jobs.delete(job);finishResolve();};
  const job={finish};jobs.add(job);
  function frame(now){if(done)return;const t=quiet?1:Math.min(1,(animation?.currentTime??now-start)/duration);onProgress?.(t);if(t>=contactAt)touch();if(t>=1)finish();else raf=requestAnimationFrame(frame);}
  if(quiet){touch();finish();}else raf=requestAnimationFrame(frame);
  return {contact,finished};
 }
 function pause(ms){return timeline(null,[],ms,1).finished;}
 function status(text){let banner=$('.enemy-action-banner');if(!banner){banner=node('div','enemy-action-banner');banner.setAttribute('role','status');}banner.textContent=text;}
 function clearStatus(){for(const el of [...nodes])if(el.classList.contains('enemy-action-banner'))remove(el);}
 function lunge(el){
  const heavy=el?.classList.contains('boss-enemy'),floating=/ghost|wraith|bat/i.test(el?.dataset.visual||''),clear=mark(el,'enemy-acting'),formation=$('#enemies');
  formation.dataset.attacker=el?.dataset.enemy||'';formation.dataset.enemyStage='windup';
  const action=timeline(el?.querySelector('.enemy-art'),EnemyTurnMotion.lunge({heavy,floating}),heavy?680:580,.46,t=>formation.dataset.enemyStage=t<.46?'windup':t<.66?'impact':'recover');
  return {contact:action.contact,finished:action.finished.finally(()=>{clear();delete formation.dataset.attacker;formation.dataset.enemyStage='idle';})};
 }
 function guard(el){const clear=mark(el,'enemy-guarding'),action=timeline(el?.querySelector('.enemy-art'),[{filter:'brightness(1)'},{filter:'brightness(1.7)',offset:.5},{filter:'brightness(1)'}],400,.5);return {contact:action.contact,finished:action.finished.finally(clear)};}
 function anchor(selector){let el=$(selector),r=el?.getBoundingClientRect();if(!r||r.bottom<0||r.top>innerHeight||r.left>=innerWidth||r.right<=0||!r.width){el=$('#journey-health');r=el?.getBoundingClientRect();}return {el,r:r||{left:12,top:20,width:90,height:30}};}
 function badge(text,selector,kind){const {r}=anchor(selector),el=node('div','player-impact-number '+kind,document.body);el.textContent=text;el.setAttribute('role','status');el.style.left=Math.max(8,Math.min(innerWidth-168,r.left+r.width/2-65))+'px';el.style.top=Math.max(8,Math.min(innerHeight-60,r.top-26))+'px';return el;}
 function symbol(kind){const el=node('div','player-impact-symbol '+kind);el.setAttribute('aria-hidden','true');el.innerHTML=kind==='shield'?'<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><path fill="#163653" d="M4 3h24v17h-4v4h-4v4h-8v-4H8v-4H4z"/><path fill="#6bc6f0" d="M7 6h18v12h-4v5h-5v2h-2v-2h-3v-5H7z"/><path fill="#e6faff" d="M9 8h3v9H9zm4 0h7v3h-7z"/><path fill="#3183b7" d="M17 9h5v8h-3v4h-2z"/></svg>':'<svg viewBox="0 0 40 32" shape-rendering="crispEdges"><path fill="#8b243e" d="M30 1h7v5h-5v6h-5v6h-5v6h-5v6H9v-6h6v-6h5v-6h5V6h5zM12 2h4v4h-4zM33 24h5v5h-5z"/><path fill="#ffe3ca" d="M29 6h3v5h-5v6h-5v6h-6v3h-3v-5h6v-6h5V9h5z"/></svg>';return el;}
 async function feedback(info){
  const damage=info.healthLoss>0,shield=info.absorbed>0,created=[],clear=[];
  root.GameAudio?.play(damage?'hurt':'block');
  const area=$('.arena')?.getBoundingClientRect();if(area)root.PixelVFX?.emit(shield&&!damage?'impacts/shield-block':'melee/claw-swipe',area.left+area.width*.5,area.top+area.height*.64,{scale:.8,duration:300,bounds:area});
  if(damage){clear.push(mark(anchor('#health-value').el?.closest('.vital')||$('#journey-health'),'player-health-hit'));created.push(badge(tr('生命 −','HP −')+info.healthLoss,'#health-value','health'));}
  if(shield){clear.push(mark($('#armor-value')?.closest('.resource-grid'),'player-armor-hit'));created.push(badge(tr('护甲 −','Armor −')+info.absorbed,'#armor-value','shield'));}
  if(info.empty)created.push(badge(tr('无伤害','No damage'),'#health-value','shield'));
  // Adjacent heart and armor fields on narrow screens need separate number lanes.
  if(created.length===2){const [a,b]=created.map(el=>el.getBoundingClientRect());if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)created[1].style.top=Math.min(innerHeight-b.height-8,a.bottom+5)+'px';}
  const frame=node('div','player-impact-frame '+(damage?'health':'shield')+(info.broken?' armor-broken':''));frame.setAttribute('aria-hidden','true');created.push(frame);
  if(shield){const s=symbol('shield');if(info.broken)s.classList.add('broken');created.push(s);}
  if(damage)created.push(symbol('health'));
  const shake=damage&&!reduced()?timeline($('#battle-backdrop'),[{translate:'0 0'},{translate:'-4px 2px',offset:.15},{translate:'3px -2px',offset:.4},{translate:'-2px 0',offset:.65},{translate:'0 0'}],220,0).finished:Promise.resolve();
  await Promise.all([pause(reduced()?0:380),shake]);for(const fn of clear)fn();for(const el of created)remove(el);
 }
 async function revive(health){const el=badge(tr('复活 · 生命 +','Revived · HP +')+health,'#health-value','revive'),clear=mark($('.vital'),'player-revived');await pause(320);clear();remove(el);}
 function cancel(){for(const job of [...jobs])job.finish();for(const {el,name}of marks)el.classList.remove(name);marks.clear();for(const el of [...nodes])remove(el);const formation=$('#enemies');if(formation){delete formation.dataset.attacker;formation.dataset.enemyStage='idle';}}
 addEventListener('resize',cancel);addEventListener('pagehide',cancel);
 root.EnemyTurnFX={lunge,guard,feedback,revive,pause,status,clearStatus,cancel};
})(globalThis);
