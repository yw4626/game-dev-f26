/* Visual onboarding: target outlines, key hints and the existing game controls. */
(function(root){
 'use strict';
 const tr=(zh,en)=>root.CrawlerLocale.language==='en'?en:zh;
 const steps={
  move:['↑ W', '向前走一步','Take one step forward',0],pickup:['↑ ◆','碰撞打开，再前进一步拾取','Bump to break. Step again to collect.',1],
  left:['↶ Q','树篱挡路，向左转','Hedge ahead · turn left',2],turnWalk:['↑ W','沿弯道向前走','Follow the bend',2],right:['↷ E','转过第二个墙角，向右转','Turn right at the next corner',2],approach:['↑ ⚔','沿路走向守卫','Follow the path to the sentries',3],
  combo0:['⓪ → ① → ②','先打出 0 费神鞭','Play the 0-mana Whip first',3],combo1:['0 → ① → 2 · ×2','打出 1 费火焰魔杖，接上连击','Play the 1-mana Fire Wand · Combo ×2',3],combo2:['0 → 1 → ② · ×3','打出 2 费斧头，增强连击','Play the 2-mana Axe · Combo ×3',3],
  combat:['⚔','费用依次 +1，连击更强','Next cost +1 → stronger combo.',3],shopApproach:['↑ ◇','沿路进入商店','Continue to the merchant',4],buy:['◇ → ▣','购买一张卡牌','Buy a card',4],socket:['◇ → ◇','花 100 金币扩充一个宝石槽','Spend 100 gold to add a gem socket',4],leave:['↑','离开商店','Leave the shop',4],gemApproach:['↑ ◆','向前碰撞宝箱','Bump into the gem chest',4],gemPick:['◆','选择一颗宝石','Choose a gem',4],gemSocket:['◆ → ▣','选择有空槽的卡牌，完成镶嵌','Pick a card with a free socket to attach the gem',4],altarApproach:['↑ ✂','沿路前往遗忘祭坛','Continue to the forgetting altar',5],remove:['✂ ▣','可免费删一张牌，也可以直接离开','Remove one card free, or leave without removing.',5],bossApproach:['↑ ⚔','走向花园小守卫','Approach the young guardian',6],evolution:['▣ + ▣ → ▣','火焰魔杖 + 菠菜 → 地狱火；点击合成','Fire Wand + Spinach → Hellfire · Evolve your cards',6],boss:['⚔ ×3','运用连击击败小守卫','Use your combos to defeat the guardian',6]
 };
 const hud=document.createElement('aside');hud.id='tutorial-guide';hud.hidden=true;hud.setAttribute('aria-label','Tutorial');document.body.append(hud);
 let last='',callbacks;
 function completed(){try{return localStorage.getItem('duskvault-tutorial-v1')==='complete';}catch{return false;}}
 function mark(){try{localStorage.setItem('duskvault-tutorial-v1','complete');}catch{}}
 function clean(){document.querySelectorAll('.tutorial-focus,.tutorial-muted').forEach(el=>el.classList.remove('tutorial-focus','tutorial-muted'));}
 function positionGuide(){if(hud.hidden)return;const scene=document.querySelector('#run-screen:not([hidden]) .dungeon-viewport')||document.querySelector('#combat-screen:not([hidden]) .arena');const rect=scene?.getBoundingClientRect();hud.style.top=Math.round(rect&&rect.height>0?Math.max(130,rect.top+24):150)+'px';hud.style.left=rect&&rect.width>0?Math.round(rect.left+rect.width/2)+'px':'50%';}
 addEventListener('resize',positionGuide);addEventListener('scroll',positionGuide,{passive:true});
 function update(run,{hidden=false,busy=false}={}){
  requestAnimationFrame(positionGuide);clean();hud.hidden=hidden||!run?.tutorial||run.tutorial.stage==='complete';document.body.classList.toggle('tutorial-active',!hud.hidden);if(hud.hidden){last='';return;}
  const s=run.tutorial.stage,info=[...(steps[s]||steps.boss)],isLost=run.phase==='lost';
  const recommended=['combat','boss'].includes(s)?CrawlerTutorial.recommendation(run):null;
  if(['combat','boss'].includes(s)&&run.phase==='battle'){
   if(run.battle.phase==='enemy'){info[0]='◆';info[1]='敌人行动';info[2]='Enemy turn';}
   else if(run.battle.phase==='victory'){info[0]='✓';info[1]='道路已清理';info[2]='Path cleared';}
   else if(recommended){const p=recommended.preview,previous=run.battle.previousCost,chains=p.multiplier>1;info[0]=(chains&&previous!==null?previous+' → ':'')+p.cost+' · ×'+p.multiplier;info[1]=(chains?'接续连击':'重新起连')+' · '+p.cost+' 费';info[2]=(chains?'Continue combo':'Start combo')+' · '+p.cost+' mana';}
   else{info[0]='→';info[1]='结束回合，恢复法力并抽牌';info[2]='End turn · refill mana and draw';}
  }
  const freshCard=run.phase==='battle'&&run.battle?.phase==='player'?run.battle.piles.hand.find(c=>c.free&&c.rewardFreeTurn===run.battle.turn&&run.battle.canPlay(c.id).ok):null;
  if(run.phase==='levelup'){info[0]='↑ Lv.'+run.level;info[1]='升级！选择一张新牌；本回合可免费打出一次';info[2]='Level up! Pick a card · play it once free this turn.';}
  else if(freshCard){info[0]='FREE';info[1]='蓝框是新牌，本回合可免费打出一次';info[2]='Blue border = new card · play it once free this turn.';}
  const sig=s+':'+CrawlerLocale.language+':'+isLost+':'+info.join('|');
  if(last!==sig){last=sig;hud.innerHTML=`<div class="tutorial-dots" aria-label="${tr('教学进度','Tutorial progress')}">${Array.from({length:7},(_,i)=>`<i class="${i<=info[3]?'lit':''}"></i>`).join('')}</div><strong class="tutorial-symbol">${isLost?'↺':info[0]}</strong><p role="status">${isLost?tr('再试一次','Try again'):tr(info[1],info[2])}</p>${s==='move'?`<small>${tr('练习物资不带入正式关卡','Practice gear resets after training.')}</small>`:''}<div class="tutorial-tools">${isLost?`<button data-tutorial="retry">${tr('重试教学','Retry tutorial')}</button>`:''}<button data-tutorial="skip">${tr('跳过教学','Skip tutorial')}</button></div>`;}
  document.querySelectorAll('[data-explore]').forEach(el=>{const [a,b]=el.dataset.explore.split(':');el.disabled=busy||!run.allowTutorial(a,a==='turn'?Number(b):b);});
  document.querySelectorAll('[data-run-action]').forEach(el=>{const [a,b]=el.dataset.runAction.split(':');if(!['deck','map'].includes(a)&&!run.allowTutorial(a,Number(b)))el.disabled=true;});
  const end=document.getElementById('end-turn');if(end&&!run.allowTutorial('endTurn'))end.disabled=true;
  if(busy)return;
  const focus=selector=>{const els=[...document.querySelectorAll(selector)];els.forEach(el=>el.classList.add('tutorial-focus'));return els;};let targets=[];
  if(run.phase==='map'){
   const command=s==='left'?'turn:-1':s==='right'?'turn:1':'walk:forward';targets=focus(`[data-explore="${command}"]`);
  }else if(run.phase==='battle'){
   const card=run.tutorialCard()||freshCard;if(card){targets=focus(`[data-card="${card.id}"]`);focus(`[data-card="${card.id}"] .cost`);document.querySelectorAll('#hand [data-card]').forEach(el=>{if(Number(el.dataset.card)!==card.id)el.classList.add('tutorial-muted');});}
   else if(run.battle.phase==='player'){
    if(recommended)focus(`[data-card="${recommended.card.id}"] .cost`);else focus('#end-turn');
   }
  }else if(run.phase==='evolution'){
   targets=focus('[data-run-action^="evolve:"]');focus('.evolution-recipe .recipe-card-flow');
  }else if(run.phase==='gem'){
   targets=focus(run.gemChoice?.selected?'[data-run-action^="socket:"]:not(:disabled)':'[data-run-action^="gem:"]:not(:disabled)');
  }else if(run.phase==='levelup'){
   targets=focus('[data-run-action^="levelcard:"]');
  }else if(run.phase==='shop'){
   targets=focus(s==='buy'?'[data-run-action^="buy:"]:not(:disabled)':s==='socket'?'[data-run-action^="slot:"]:not(:disabled)':'[data-run-action="leave"]');
  }else if(run.phase==='removal')targets=focus('[data-run-action^="remove:"]:not(:disabled)');
  if(['buy','socket','leave','gemPick','gemSocket','remove','evolution'].includes(s)&&targets.length&&hud.dataset.scrollStep!==s){hud.dataset.scrollStep=s;targets[0].scrollIntoView({block:'center',behavior:'instant'});}
 }
 hud.addEventListener('click',e=>{const action=e.target.closest('[data-tutorial]')?.dataset.tutorial;if(action)callbacks?.[action]?.();});
 let transition;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:ms));
 async function depart(){
  transition=document.createElement('dialog');transition.className='tutorial-transition';transition.setAttribute('aria-label',tr('教学完成','Tutorial complete'));
  transition.innerHTML=`<section class="tutorial-transition-card"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#map-destination-crown"/></svg><small>${tr('序章完成','PROLOGUE COMPLETE')}</small><h2>${tr('你已准备就绪','You are ready')}</h2><p>${tr('穿过花园小径，真正的探索即将开始。','Beyond the training path, your descent begins.')}</p><div class="tutorial-chapter">01 · ${tr('荆棘花园','THORN GARDEN')}</div><p class="tutorial-reset-note">${tr('以所选角色的初始牌组与物资出发','Begin with your chosen crawler’s starting deck and supplies.')}</p><button class="primary-button">${tr('进入第一关','Enter Floor 1')} →</button></section>`;
  transition.addEventListener('cancel',e=>e.preventDefault());document.body.append(transition);transition.showModal();
  const button=transition.querySelector('button');await new Promise(resolve=>button.addEventListener('click',resolve,{once:true}));button.disabled=true;
  transition.classList.add('departing');await wait(700);
 }
 async function arrive(){if(!transition)return;transition.classList.add('arriving');await wait(900);transition.close();transition.remove();transition=null;}
 root.TutorialUI={update,completed,mark,depart,arrive,attach:c=>callbacks=c};
})(globalThis);
