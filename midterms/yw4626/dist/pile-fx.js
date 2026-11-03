/* Card ownership stays in the engine. This module animates its recorded transfers. */
(function(root){
 'use strict';
 const jobs=new Set(),incoming=new Set(),inTransit=new Set(),held=new Set();let tracked=null,cursor=0,raf=0,generation=0,icon=()=>'';
 const $=s=>document.querySelector(s),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tr=(zh,en)=>CrawlerLocale.language==='en'?en:zh,point=r=>({x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height});
 function pileCards(b,key){return key==='discard'?[...b.piles.discard,...b.piles.combo.filter(c=>!c.pendingDestroy)]:b.piles[key]||[];}
 function anchor(key){const el=$(key==='active'?'#character-status':`[data-pile="${key}"]`),r=el?.getBoundingClientRect();return r&&r.width&&r.height?point(r):{x:innerWidth*.82,y:innerHeight*.65,w:60,h:90};}
 function paint(b=tracked){
  if(!b)return;for(const key of ['draw','discard']){const el=$(`[data-pile="${key}"]`);if(!el)continue;const cards=pileCards(b,key),top=cards.at(-1),count=key==='draw'?cards.length+incoming.size:cards.filter(c=>!inTransit.has(c.id)).length;
   el.classList.add('pile-control');el.dataset.empty=String(!count);el.style.setProperty('--stack-count',Math.min(4,Math.ceil(count/4)));el.title=key==='draw'?tr('抽牌堆 · 点击查看构成','Draw pile · Inspect cards'):tr('弃牌堆 · 含本轮已打出的普通牌','Discard pile · Includes played combo cards');
   el.innerHTML=`<span class="pile-stack"><span class="pile-card-back">${key==='draw'?'<svg viewBox="0 0 32 40" aria-hidden="true"><path fill="#1f3970" d="M2 2h28v36H2z"/><path fill="#6ca4d4" d="M4 4h24v32H4z"/><path fill="#263952" d="M6 6h20v28H6z"/><path fill="#daca80" fill-rule="evenodd" d="M14 8h4v4h4v4h4v8h-4v4h-4v4h-4v-4h-4v-4H6v-8h4v-4h4zM14 16v4h-4v4h4v4h4v-4h4v-4h-4v-4z"/></svg>':top?icon(top):'<span class="pile-empty-mark">—</span>'}</span><b id="${key}-count">${count}</b></span><span class="pile-label">${tr(key==='draw'?'抽牌堆':'弃牌堆',key==='draw'?'DRAW':'DISCARD')}</span>`;
   el.setAttribute('aria-label',tr(key==='draw'?'抽牌堆':'弃牌堆',key==='draw'?'Draw pile':'Discard pile')+' '+count);
  }
  for(const el of document.querySelectorAll('#hand [data-card]'))el.classList.toggle('pile-arriving',incoming.has(+el.dataset.card));
 }
 function capture(el){if(!el)return null;return {node:el.cloneNode(true),rect:el.getBoundingClientRect(),id:+el.dataset.card};}
 function hand(){return new Map([...document.querySelectorAll('#hand [data-card]')].map(el=>[+el.dataset.card,capture(el)]));}
 function clone(item,back=false){
  const el=item?.node?.cloneNode(true)||document.createElement('div');el.removeAttribute('data-card');el.removeAttribute('id');el.removeAttribute('title');el.removeAttribute('aria-label');el.setAttribute('aria-hidden','true');el.inert=true;el.classList.remove('is-inspected','cast-queued','pile-arriving','drag-origin');el.querySelectorAll('.cast-queue-badge').forEach(n=>n.remove());el.classList.add('card-flight');
  el.style.cssText+=';position:fixed;left:0;top:0;width:170px;min-width:170px;max-width:170px;height:310px;min-height:310px;max-height:310px;margin:0;';
  if(back){const cover=document.createElement('span');cover.className='flight-back';cover.innerHTML='<span>◇</span>';el.append(cover);}
  el.style.visibility='hidden';document.body.append(el);return el;
 }
 function finish(job){if(!jobs.delete(job))return;if(job.hold)held.add(job.el);else job.el.remove();if(job.kind==='draw')incoming.delete(job.id);else if(job.id&&!job.hold)inTransit.delete(job.id);job.resolve(job.el);paint();}
 function frame(now){
  for(const j of [...jobs]){const t=Math.max(0,Math.min(1,(now-j.start)/j.duration));if(now<j.start){j.el.style.visibility='hidden';continue;}j.el.style.visibility='visible';const end=typeof j.to==='function'?j.to():j.to,ease=1-(1-t)**3,x=j.from.x+(end.x-j.from.x)*ease,y=j.from.y+(end.y-j.from.y)*ease-Math.sin(t*Math.PI)*j.arc,s=j.from.w/170+(end.w-j.from.w)/170*ease;
   j.el.style.transform=`translate(${Math.round(x-85)}px,${Math.round(y-155)}px) scale(${s}) rotate(${j.spin*(1-t)}deg)`;j.el.style.opacity=String(j.fade?1-t:1);const back=j.el.querySelector('.flight-back');if(back)back.style.opacity=t<.42?'1':'0';if(t>=1)finish(j);
  }if(jobs.size)raf=requestAnimationFrame(frame);else raf=0;
 }
 function flight(item,from,to,{kind='draw',duration=190,delay=0,arc=24,spin=-12,fade=false,back=false,hold=false}={}){
  duration=Math.round(duration*1.2);delay=Math.round(delay*1.2);
  if(reduced()||document.hidden)return Promise.resolve();if(jobs.size>=28)finish(jobs.values().next().value);
  const el=clone(item,back);el.dataset.transfer=kind;const id=item?.id;
  if(kind==='draw')incoming.add(id);else if(id)inTransit.add(id);
  let resolve;const done=new Promise(r=>resolve=r);jobs.add({el,id,kind,from,to,duration,arc,spin,fade,hold,start:performance.now()+delay,resolve});if(!raf)raf=requestAnimationFrame(frame);paint();return done;
 }
 function sync(b,iconFn){
  icon=iconFn||icon;const fresh=b!==tracked;if(fresh){cancel();tracked=b;cursor=b.eventId;}
  const draws=fresh?(b.turn===1&&!b.actions.length?b.piles.hand.map(c=>({cardId:c.id})):[]):b.events.filter(e=>e.id>cursor&&e.type==='draw');
  const recycle=!fresh&&b.events.some(e=>e.id>cursor&&e.type==='recycle');cursor=b.eventId;
  if(recycle)flight(null,anchor('discard'),anchor('draw'),{kind:'shuffle',duration:140,back:true,arc:30});
  let i=0;for(const e of draws){const el=$(`#hand [data-card="${e.cardId}"]`);if(!el||incoming.has(e.cardId))continue;const captured=capture(el);flight(captured,anchor('draw'),()=>{const target=$(`#hand [data-card="${e.cardId}"]`);return target?point(target.getBoundingClientRect()):point(captured.rect);},{kind:'draw',duration:180,delay:Math.min(i++*24,140)+(recycle?65:0),back:true});}
  paint(b);
 }
 function cast(item,destination='discard'){
  if(!item||reduced())return {release:()=>Promise.resolve(),finished:Promise.resolve()};
  for(const job of [...jobs])if(job.kind==='draw'&&job.id===item.id)finish(job);
  const token=generation;
  // Flight to the casting position overlaps the weapon windup; disposal overlaps the impact.
  const area=$('.arena')?.getBoundingClientRect(),at={x:area?area.left+area.width*.5:innerWidth/2,y:area?area.top+area.height*.69:innerHeight*.5,w:92,h:168};
  const first=flight(item,point(item.rect),at,{kind:'cast',duration:90,arc:12,spin:6,hold:true});let released=null;
  const release=()=>released||(released=first.then(el=>{
   el?.remove();held.delete(el);
   if(token!==generation||!tracked||tracked.piles.hand.some(c=>c.id===item.id)){inTransit.delete(item.id);paint();return;}
   return flight(item,at,destination==='destroy'?{...at,y:at.y-50,w:16}:anchor(destination),{kind:destination,duration:135,arc:destination==='discard'?26:0,spin:-8,fade:destination==='destroy'});
  }));
  return {release,get finished(){return release();}};
 }
 function discardHand(before,b){let i=0;const ids=new Set(pileCards(b,'discard').map(c=>c.id));for(const job of [...jobs])if(job.kind==='draw'&&ids.has(job.id))finish(job);for(const [id,item]of before)if(ids.has(id))flight(item,point(item.rect),anchor('discard'),{kind:'discard',duration:155,delay:Math.min(i++*15,90),arc:20,spin:8});}
 function cancel(){generation++;for(const j of [...jobs])finish(j);for(const el of held)el.remove();held.clear();incoming.clear();inTransit.clear();cancelAnimationFrame(raf);raf=0;paint();}
 function leave(){cancel();tracked=null;cursor=0;}
 addEventListener('resize',cancel);addEventListener('pagehide',leave);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 root.PileFX={sync,paint,capture,hand,cast,discardHand,pileCards,cancel,leave,stats:()=>({active:jobs.size,incoming:incoming.size})};
})(globalThis);
