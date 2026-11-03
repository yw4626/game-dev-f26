/* UI is a view of the deterministic battle engine; it never changes combat values. */
(() => {
  'use strict';
  const {catalog,definition,gems}=Crawler;
  const {Run,floorNames,roomNames}=CrawlerRun;
  const $=id=>document.getElementById(id);
  const SAVE_KEY='duskvault-run-v2';
  const bossTestMode=new URLSearchParams(location.search).get('bossTest');
  const testingBoss=BossTest.modes.includes(bossTestMode);
  const tutorialTestMode=new URLSearchParams(location.search).get('tutorialTest'),testingTutorial=['1','finish'].includes(tutorialTestMode);
  let tutorialTransition=false;
  let watching=false,watchBackup=null,watchCamera=null;
  let homeOpen=true,selectedCharacter='antonio',drag=null,autoEndTimer=null,inspectedCard=null,handInput='pointer',enemyTurnToken=null;
  const tr=(zh,en)=>CrawlerLocale.language==='en'?en:zh;
  let castQueue=[],cardCasting=false;
  let run=null, battle=null, busy=false, epoch=0, toastTimer, lastLogId=0, saveError='',lastScreen='',battleVisual=null;
  try {const data=testingBoss||testingTutorial?null:localStorage.getItem(SAVE_KEY);if(data){run=Run.restore(JSON.parse(data));run.enableExpandedHand();run.enableCombatV13();run.enableGemV14();run.enableShopV14();run.enableWorldV16();run.enableFriendshipV19();run.enableWildBalanceV20();run.enableShopPricesV21();run.enableLootEconomyV21();battle=run.battle;}}catch(e){saveError='存档不可用，请开始新探索';}
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=(name,cls='')=>DungeonView.art(name,cls);
  function randomRunSeed(){return 'CRAWL-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),n=>n.toString(36)).join('-');}
  function portrait(key){
    const name='icon-fcc'+key[0].toUpperCase()+key.slice(1);if(PixelAssets.sprites[name])return DungeonView.art(name,'character-portrait');
    const blue=key==='imelda'||key==='arca',rows=key==='poe'?['......hhhh......','.....hsssshh....','.....hsssshh....','......wwww......','.....wwwwww.....','......wwww...q..','.....llllll..q..','....llllllll.q..','....slllllls.q..','....slllllls.q..','.....llllll..q..','.....llllll..q..','....llllllll.q..','....llllllll.q..','......dddd...q..','.....dd.dd...q..','....ddd.ddd..q..','................']:blue?['........pp......','.......pppp.....','......pppppp....','....pppppppppp..','......ssss......','.....wwssww.....','.....wwssww..y..','......bbbb...y..','.....bbbbbb..y..','....bbbbbbbb.y..','....ssbbbbss.y..','....ssbbbbss.y..','......bbbb...y..','.....bbbbbb..y..','....bbbbbbbb.y..','....bbbbbbbb.y..','.....dd..dd.....','.....dd..dd.....']:['......hhhh......','.....hhhhhh.....','.....hsssshh....','......ssss......','......rrrr......','.....rrrrrr.....','....llllllls....','....slllllls....','....slllllls..q.','....slllllls..q.','.....llllll...q.','.....llllll..qq.','.....dddddd.qq..','.....dd..dd.qq..','.....dd..dd..q..','.....dd..dd..q..','....ddd..ddd....','................'];
    const colors={p:'#7275c5',s:'#e9bf8e',w:'#e4e2d9',b:'#34569e',y:'#d6bd6e',d:'#3c344a',h:'#453238',r:'#bd4851',l:'#a27a4a',q:'#d29d54'};
    if(key==='arca')Object.assign(colors,{p:'#a13538',b:'#641c29',y:'#ffb33c',w:'#4a2734'});if(key==='poe')Object.assign(colors,{h:'#aeaa99',l:'#65744b',w:'#ede1bf'});
    return `<svg viewBox="0 0 16 20" class="character-portrait" aria-hidden="true" shape-rendering="crispEdges">${rows.map((r,y)=>[...r].map((c,x)=>c==='.'?'':`<rect x="${x}" y="${y+1}" width="1" height="1" fill="${colors[c]}"/>`).join('')).join('')}</svg>`;
  }
  document.querySelector('.hero-art > svg').outerHTML=svg('hero');
  const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(2);
  function toast(text) {clearTimeout(toastTimer);$('toast').textContent=CrawlerLocale.text(text);$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200);}
  let developerOpen=false;
  try{developerOpen=localStorage.getItem('duskvault-developer')==='true';}catch(e){}
  function renderDeveloper(){
    const panel=$('developer-panel');panel.hidden=!developerOpen;document.body.classList.toggle('developer-open',developerOpen);$('developer-button').setAttribute('aria-expanded',String(developerOpen));
    if(!developerOpen)return;
    const open=new Set([...panel.querySelectorAll('details[open]')].map(e=>e.dataset.section)),scroll=panel.scrollTop;
    const section=(id,title,data,initial=false)=>`<details data-section="${id}" ${open.has(id)||!panel.innerHTML&&initial?'open':''}><summary>${title}</summary><pre>${escape(JSON.stringify(data,null,2))}</pre></details>`;
    const settings=run?.combatSettings?.()||Crawler.profiles.demo,b=run?.battle,active=run&&['battle','levelup'].includes(run.phase);
    panel.innerHTML=`<div class="developer-heading"><strong>开发者模式</strong><button data-dev-close aria-label="关闭开发者侧栏">×</button></div><p class="developer-note">实时只读配置 · 不改变游戏数值<br>战斗动画期间显示结算后的引擎状态。</p>`+
      section('state','运行状态',{phase:run?.phase||'home',worldRulesVersion:run?.worldRulesVersion,friendshipRulesVersion:run?.friendshipRulesVersion,wildBalanceVersion:run?.wildBalanceVersion,shopPriceVersion:run?.shopPriceVersion,lootEconomyVersion:run?.lootEconomyVersion,seed:run?.seed,profile:run?.profile,progressionVersion:run?.progressionVersion,combatVersion:run?.combatVersion,floor:run?.floor,level:run?.level,xp:run?.xp,nextLevelXp:run?.xpRequired?.(),pendingLevels:run?.pendingLevels,health:run?.health,gold:run?.gold},true)+
      section('player','角色 / 抽牌 / 法力',{base:Crawler.profiles[run?.profile||'demo'],runGrowth:run?.growth||{},effectiveRun:settings,battleSettings:active?b.settings:null,currentPlayer:active?b.player:null,combo:active?{count:b.combo,previousCost:b.previousCost,previousWild:b.previousWild,reverse:b.reverseCombo}:null},true)+
      section('map','地图与物品',{position:run?.dungeon?{x:run.dungeon.x,y:run.dungeon.y,dir:run.dungeon.dir}:null,version:run?.dungeon?.version,size:run?.dungeon?{width:run.dungeon.grid[0].length,height:run.dungeon.grid.length}:null,generation:run?.dungeon?.generation,objects:run?.dungeon?.objects,rooms:run?.dungeon?.rooms})+
      section('enemies','当前敌人 / 意图',active?{enemies:b.enemies,activeQueue:b.enemyQueue,front:Crawler.frontEnemies(b.enemies).map(x=>x.enemy.id),encounterRulesVersion:run.encounterRulesVersion}:catalog.enemies)+
      section('deck','牌组实例 / 宝石 / 槽位',run?.deck||[])+
      section('piles','当前战斗牌堆',active?b.piles:{})+
      section('cards',`支持卡池 · ${Object.keys(catalog.cards).length} 种`,Object.fromEntries(Object.entries(catalog.cards).map(([key,c])=>[key,{...c,unlock:ProgressionCatalog.cardUnlocks[c.assetId],gemSlots:gems.catalog.cardSlots[key]}])))+
      section('projectiles','持续弹道 / 碰边爆炸',{noFuture:Crawler.specials.noFuture,runetracer:Crawler.specials.runetracer,browserArena:Crawler.specials.arena,area:Crawler.specials.areaConfig,note:'弹道几何为浏览器适配；原版伤害系数、时间与碰撞记忆由代码及配置提取'})+
      section('gems','宝石配置',{enabled:gems.enabled,config:gems.catalog.gems,socketUpgrade:{price:100,limitPerCardType:2,used:run?.slotExpansionCounts},treasureGold:100,removalEvent:run?.dungeon?.removalEvent})+
      section('progression','原版经验 / 升级候选配置',{levels:ProgressionCatalog.levelConfig,choices:ProgressionCatalog.levelChoice,enemies:ProgressionCatalog.enemies&&Object.fromEntries(['ghost','zombie','lion'].map(k=>[k,ProgressionCatalog.enemies[k]])),characters:Crawler.characters,evolutionRecipes:Crawler.evolutionRecipes,wilds:Crawler.wildV10,wildBalance:Crawler.effectsV10.balance,wildStrengthEnabled:run?.wildStrength})+
      section('scope','来源与复现边界',{extracted:['卡牌基础数值、按列选敌/穿透和W万能牌效果','宝石与标签','推车确定掉落链','敌人XP、升级阈值与选卡入手规则','地图模板拓扑'],adapted:['用户平衡：v20万能牌分工与收益调整（见wildBalance）','用户平衡：友情护符额外连击+2，固定加值','五层流程、递增地图/敌人编组与金币经济','地图W/石像位置与共享Canvas池','开局默认启用万能增幅（可关闭）','前四层Boss后进化/新牌/宝石三选一','每层两台成长推车及两只宝石箱','试玩模式开放支持卡池','四角色专属起始牌组和FCC触发','随机流与奖励权重的部分分支','用户指定：100金币扩槽/每种卡两次、100金币宝箱、每层免费删牌祭坛、碰撞交互'],notImplemented:['其他角色FCC及城镇成就解锁进度','所有地图与敌人阶段、原版相机下的完整三维弹道','升级选择的第四项和完整重掷/放逐系统'],sources:{cards:catalog.sources,pickups:PickupCatalog.sources,progression:ProgressionCatalog.sources}});
    panel.scrollTop=scroll;
  }
  function toggleDeveloper(value){developerOpen=value;try{localStorage.setItem('duskvault-developer',String(value));}catch(e){}renderDeveloper();requestAnimationFrame(layoutHand);}
  $('developer-button').addEventListener('click',()=>toggleDeveloper(!developerOpen));
  $('developer-panel').addEventListener('click',e=>{if(e.target.closest('[data-dev-close]'))toggleDeveloper(false);});
  function gemStrip(card){
    return GemShapes.strip(card,{installed:gems.installed(card),slots:gems.slotCount(card),en:CrawlerLocale.language==='en'});
  }
  function gemRoom(){return GemFlow.render(run,{tr,escape,cardTile});}
  function socketRows(){
    const cards=[...new Map(run.deck.map(c=>[c.key,c])).values()];
    return `<p class="socket-note">${tr('每次100金币，同名卡同步增加1槽；每种卡本局最多扩两次，已装宝石保留。','100 gold per socket. Matching cards share upgrades, up to two per card type per run. Installed gems stay intact.')}</p><div class="card-gallery socket-gallery">${cards.map(c=>{const info=run.slotExpansionInfo(c.id),expandable=gems.metadata(c)?.maxSlots>0;return `<div class="socket-offer"><span class="socket-progress">${expandable?`${tr('已扩槽','Upgrades')} ${info.used}/2 · ${tr('现有槽位','Sockets')} ${gems.slotCount(c)}`:tr('角色卡 · 无宝石槽','Character · No sockets')}</span>${cardTile(c,'slot:'+c.id,!expandable?tr('不可扩槽','Cannot expand'):info.full?tr('已达上限','Limit reached'):tr('扩槽 · 100金币','Add socket · 100 gold'),info.full||run.gold<info.price)}</div>`;}).join('')}</div>`;
  }
  function intentText(enemy) {
    if(enemy.health<=0)return '已击败';
    if(enemy.freezeStacks>0)return tr('冰冻 ×','Frozen ×')+enemy.freezeStacks;
    if(!enemy.intent)return '等待';
    return enemy.intent.actions.map(a=>a.kind==='attack'?`⚔ 攻击 ${a.value}`:a.kind==='armor'?`⬡ 护甲 +${a.value}`:'等待').join(' / ');
  }
  // A column is a queue. Rank is derived from living occupants, so old saves
  // with gaps and new snapshots with compacted rows have the same presentation.
  function enemyPresentation(enemies) {
    return battleVisual?.formationHold?CombatMotion.hold(enemies,battleVisual.formationHold,battleVisual.fallenIds):CombatMotion.formation(enemies);
  }
  function drawEnemies() {
    const backdrop=$('battle-backdrop'),narrow=matchMedia('(max-width:760px)').matches;
    if(backdrop){if(narrow){const hand=$('hand').closest('.hand-section'),available=hand.getBoundingClientRect().top-backdrop.getBoundingClientRect().top-4;backdrop.style.height=Math.max(220,available)+'px';}else backdrop.style.removeProperty('height');}
    $('enemies').style.setProperty('--sprite-pixel',backdrop?.offsetWidth>=900?'7':backdrop?.offsetWidth>=620?'5':backdrop?.offsetWidth>=420?'3':'2');if(backdrop?.offsetHeight)$('enemies').style.setProperty('--enemy-ground',(backdrop.offsetTop+backdrop.offsetHeight*(narrow?.65:.59))+'px');
    const enemies=battleVisual?.enemies||battle.enemies,living=enemies.filter(e=>e.health>0),presentation=enemyPresentation(enemies),front=presentation.filter(e=>e.depth===0&&!e.fallen),columns=Math.max(5,...enemies.map((e,i)=>(e.slot?.column??i)+1));
    $('enemies').dataset.count=String(living.length);$('enemies').dataset.frontCount=String(front.length);$('enemies').classList.toggle('boss-formation',presentation.some(e=>e.enemy.encounterRole==='boss'));
    $('enemies').style.setProperty('--enemy-columns',String(columns));
    const impacts=[...$('enemies').querySelectorAll(':scope>.impact-number')];
    $('enemies').innerHTML=presentation.map(({enemy:e,column,depth,fallen,reserves})=>{
      const echoLine=living.filter(n=>n.bloodEcho),echoIndex=echoLine.findIndex(n=>n.id===e.id);
      const x=e.bloodEcho?50+(echoIndex-(echoLine.length-1)/2)*20:e.bossKind===5&&echoLine.length?50:50+(((column+.5)/columns*100)-50)*(1-depth*.14)+(depth===1?2:depth===2?-2:0),name=CrawlerLocale.language==='en'?(e.english||e.name):e.name;
      const idleDuration=(e.encounterRole==='boss'?3200:2200)+(e.id%5)*170,idleDelay=-(performance.now()%idleDuration);
      const promoted=battleVisual?.advanceIds?.has(e.id),position=depth?tr('后备第 '+depth+' 排','Reserve rank '+depth):tr('前线','Front line');
      return `<div role="img" class="enemy ${depth?'reserve-enemy':'front-enemy'} ${fallen?'fallen-enemy':''} ${promoted?'enemy-advancing':''} ${e.encounterRole==='boss'?'boss-enemy':''}" style="--formation-x:${x}%;--formation-depth:${depth};--enemy-scale:${e.visualScale||1};--idle-duration:${idleDuration}ms;--idle-delay:${idleDelay}ms;--row-rise:${Math.round((backdrop?.offsetHeight||400)*[0,.065,.105,.13][depth])}px;--depth-scale:${[1,.78,.6,.76][depth]}" data-enemy="${e.id}" data-idle="${/bat|wraith|wisp|spirit|imp/i.test(e.visualKey||e.key)?'wings':'breath'}" data-frozen="${!!e.freezeStacks}" data-visual="${escape(e.visualKey||e.key)}" data-row="${e.slot?.row||0}" data-column="${column}" data-depth="${depth}" aria-label="${escape(name)} · ${position} · ${tr('生命','HP')} ${fmt(e.health)}${!depth?' · '+escape(intentText(e)):''}" title="${escape(name)} · ${position}${depth?tr('，前方倒下后补位',', advances when the front falls'):''}">${!depth&&!fallen?`<div class="enemy-readout"><h2 class="enemy-name">${escape(name)}</h2><div class="enemy-stats"><span>${fmt(e.health)}<small> / ${e.maxHealth}</small></span><span class="enemy-armor">⬡${fmt(e.armor)}</span></div><div class="bar"><i style="width:${Math.max(0,e.health/e.maxHealth*100)}%"></i></div><span class="intent ${e.intent?.actions[0]?.kind==='armor'?'defense':''}">${intentText(e).split(' / ').map(text=>`<span>${escape(text)}</span>`).join('')}</span></div>`:''}<span class="enemy-shadow" aria-hidden="true"></span>${svg('enemy-'+(e.visualKey||e.key),'enemy-art')}</div>`;
    }).join('');
    $('enemies').append(...impacts);
    const target=enemies.find(e=>e.id===(battleVisual?.target||battle.target)&&e.health>0)||enemies.find(e=>e.health>0);
    $('target-hint').textContent=target?tr('自动索敌','Automatic targeting'):'战斗结束';
    $('enemies-left').textContent=tr(`前线 ${front.length} · 后备 ${living.length-front.length} · 共 ${living.length}/${enemies.length}`,`Front ${front.length} · Reserve ${living.length-front.length} · ${living.length}/${enemies.length}`);
  }
  function wildSettings(){return battle?.settings||run?.combatSettings?.()||{friendshipRulesVersion:19,wildBalanceVersion:20};}
  function friendshipBonus(def){return Crawler.friendshipBonus(def,battle?.settings||run?.combatSettings?.()||{friendshipRulesVersion:19});}
  function staticPreview(card){
    const def=definition(card),gem=gems.modifiers(card),multiplier=1;gem.draw=gems.installed(card).filter(k=>gems.catalog.gems[k]?.effect==='draw').reduce((n,k)=>n+gems.catalog.gems[k].value,0);
    return {...(Crawler.attackSummary?Crawler.attackSummary(def,{},1,undefined,gem.damageMultiplier,13):Crawler.damageProfile(def,{might:0,amount:0},1,gem.damageMultiplier)),cost:Crawler.cost(card,0,true),payment:Crawler.cost(card,0),continues:true,multiplier,effectMultiplier:1,
      comboBonus:friendshipBonus(def),resultCombo:1+friendshipBonus(def),wildcard:def.costType==='wild',luckGain:def.luck||0,destroyOnPlay:!!def.destroyOnPlay,draw:(def.drawCount||0)+(gem.draw||0),armor:(def.armor||0)+gem.armor,gemDraw:gem.draw||0,gemArmor:gem.armor||0,damageMultiplier:gem.damageMultiplier,
      ...(def.kind==='wild'?(()=>{const p=Crawler.effectsV10.wildPreview(def,1,{settings:wildSettings()});return {...p,draw:p.draw+(gem.draw||0),armor:p.armor+gem.armor};})():{}),
      character:def.character,duration:def.duration,experience:def.firstEffect?.amount||0,
      ...(def.kind==='character'&&def.firstEffect?.effect==='armor'?{armor:def.firstEffect.amount}:{}),area:def.area};
  }
  function attackLabel(def,p={}){
    if(p.areaAttack)return tr('前排全伤 · 后排溅射','Front + rear splash');
    if(['noFuture','runetracer'].includes(def.key))return tr('碰边反弹','Wall bounce');
    const mode=p.attackPattern||def.attackPattern,labels={'left-right':['横扫 →','Sweep →'],'right-left':['← 横扫','← Sweep'],random:['随机投射','Random shots'],'front-row':['前排范围','Front-row area'],whip:['横向鞭击','Whip sweep'],single:['单次投射','Projectile']};
    const label=labels[mode]||['逐次攻击','Sequential hits'],pierce=p.pierce??def.pierce??1,area=p.area??def.area??0;
    return tr(...label)+(pierce>1?tr(' · 穿透'+pierce,' · Pierce '+pierce):'')+(area>0?tr(' · 溅射'+area,' · Splash '+area):'');
  }
  function supportMarkup(text){
    return escape(text.replace('Erase first ','Erase ').replace('每回合抽牌','回合抽牌').replace('Cards per turn','Draw/turn').replace(' fixed','').replace(' 固定','')).replace(/([+−-]?\d+(?:\.\d+)?%?)/g,'<b>$1</b>');
  }
  function characterMarkup(def,mult){
    const parts=supportText(def,mult).split(' · ');
    return '<span class="effect-main support-effect"><span>'+supportMarkup(parts[0])+'</span></span><small class="character-reaction">'+escape(parts.slice(1).join(' · '))+'</small>';
  }
  function cardFace(card,{hand=false,preview=null,i=0,count=1}={}){
      const def=definition(card), p=preview||staticPreview(card), legal=hand?battle.canPlay(card.id):{ok:true}, disabled=hand&&((busy&&!cardCasting)||!legal.ok),elementTag=hand?'button':'article';
      const base=def.kind==='attack'?Crawler.damageProfile(def,hand?battle.player:{might:0,amount:0},1,p.damageMultiplier):null;
      const bonus=def.kind==='attack'?p.damage*p.hits-base.damage*base.hits:def.kind==='draw'?p.draw-p.gemDraw-(def.drawCount+Math.trunc(hand?battle.player.magnet:0)):def.kind==='armor'&&def.receivesComboMultiplier?p.armor-p.gemArmor-def.armor:0;
      const drawCapacity=!hand?p.draw:Math.min(p.draw,Math.max(0,battle.settings.handLimit-battle.piles.hand.length+1),battle.piles.draw.length+battle.piles.discard.length+battle.piles.combo.filter(c=>!c.pendingDestroy).length);
      const effectMultiplier=p.effectMultiplier??(def.receivesComboMultiplier?p.multiplier:1);
      const special=def.kind==='attack'?Crawler.specials.describe(def,{player:hand?battle.player:{},multiplier:effectMultiplier,damage:p.damage,en:CrawlerLocale.language==='en',rulesVersion:hand?battle.settings.attackRulesVersion:13,rearSplashRatio:hand?battle.settings.rearSplashRatio??.2:.2}):{lines:[],compact:''};
      const recipes=Crawler.evolutionRecipes.filter(r=>r.componentGroups.includes(def.group)&&!r.sourceDisabled&&r.runtimeEnabled);
      const recipe=recipes[0];
      const recipeNote=recipe?tr('合成 → ','Evolves → ')+tr(definition({key:recipe.resultKey}).name,definition({key:recipe.resultKey}).english||definition({key:recipe.resultKey}).name):'';
      const effectLines=Crawler.effectsV10.descriptions(def,effectMultiplier,CrawlerLocale.language==='en',{friendshipBonus:p.comboBonus||0,settings:wildSettings(),preview:p});
      const wildNotes=def.kind==='wild'?Crawler.effectsV10.wildNotes(def,p,CrawlerLocale.language==='en'):[];
      const tail=def.destroyOnPlay?tr('销毁','Destroy'):'';
      const freezing=def.freezeStacks>0&&!(def.baseDamage>0);
      const description=freezing?`<span class="effect-main">${tr('冻结','Freeze')} <b>${p.hits}</b> ${tr('次','shots')}<small>${tr('随机前排 · 每发','Random front · each')} ${def.freezeStacks} ${tr('层','stack(s)')}</small></span>`:def.kind==='attack'?`<span class="effect-main"><b>${p.damage}</b> × <b>${p.hits}</b><small>${attackLabel(def,p)}</small></span><span class="effect-total">${p.areaSplashDamage===0?'':p.areaSplashDamage!==undefined?tr('前排溅射','Front splash')+' <b>'+fmt(p.areaSplashDamage)+'</b>':p.areaAttack?tr('后排溅射','Rear')+' <b>'+fmt(p.rearSplashDamage)+'</b> '+tr('/敌/次','/foe'):(["noFuture","runetracer"].includes(def.key)?tr('初次主击','Initial hits'):tr('主击合计','Main hits'))+' <b>'+(p.totalDamage??p.damage*p.hits)+'</b>'+(special.variable?tr(' · 附加另计',' + extras'):'')}</span>`:def.kind==='character'?characterMarkup(def,p.multiplier):effectLines.length?`<span class="effect-main support-effect">${effectLines.map(x=>`<span>${supportMarkup(x)}</span>`).join('')}</span><span class="effect-total">${escape(tail)}</span>`:def.kind==='draw'?`<span class="effect-main">${tr('抽牌','Draw')} <b>${p.draw-p.gemDraw}</b><small>${tr('最多入手 ','Hand capacity ')}${drawCapacity}</small></span>`:`<span class="effect-main support-effect">${supportMarkup(supportText(def,effectMultiplier))}</span>`;
      const active=hand&&battle.combo>0&&p.continues,breaks=hand&&battle.combo>0&&!p.continues;
      const chainReady=active&&legal.ok&&battle.phase==='player';
      const newReward=hand&&card.free&&card.rewardFreeTurn===battle.turn;
      const wild=def.costType==='wild',costLabel=newReward?'FREE':wild?'W':!hand&&def.costType==='x'?'X':p.payment;
      const tag=hand&&card.rewardFreeTurn!==undefined?tr('本回合免费','Free this turn'):p.comboBonus?tr('W · 连击 +3','W · Combo +3'):wild?tr('W · 自动接续','W · Auto-chain'):!hand?tr('基础效果','Base effect'):active?`接续 ×${p.multiplier}`:breaks?'断连 → ×1':'起始 ×1';
      const fixedWild=wild&&(def.effects||[]).every(e=>['wings','combo'].includes(e.type));
      const bonusText=p.comboBonus?(hand?tr(`连击 ×${p.comboBefore} → ×${p.resultCombo}`,`Combo ×${p.comboBefore} → ×${p.resultCombo}`):tr('普通 +1，额外 +2','Normal +1, extra +2')):fixedWild?(p.wildRole?tr(...p.wildRole)+tr(' · 固定',' · fixed'):tr('固定效果 · 任意接续','Fixed effect · any cost')):wild&&p.wildRole?tr(...p.wildRole)+(fixedWild?tr(' · 固定',' · fixed'):' · ×'+effectMultiplier):wild?(effectMultiplier>1?tr('连击 ×'+effectMultiplier+' · 加成已计入','Combo ×'+effectMultiplier+' · boosted'):tr('任意接续 · 下一张也可任意费','Chain any cost · next card too')):!hand?(recipeNote||tr('按费用递增，提升下一张','Rising cost → combo')):active?tr('连击 ×'+p.multiplier+' · 效果已计入','Combo ×'+p.multiplier+' · effect shown'):breaks?tr('断连 · 重新从 ×1 开始','Chain breaks · restart ×1'):tr('起始连击 ×1','Begin combo ×1');
      const reason=!hand?tr('卡牌详情','Card details'):busy&&!cardCasting?'正在结算':!legal.ok?legal.reason:tr(`打出${def.name}，费用${costLabel}`,`Play ${def.english||def.name}, cost ${costLabel}`);
      return `<${elementTag} style="${cardColor(def)}--fan-angle:${(i-(count-1)/2)*2}deg;--fan-lift:${Math.abs(i-(count-1)/2)*4}px;--fan-order:${i+1}" class="game-card card ${newReward?'new-reward-card':''} ${def.kind} ${def.cardType==='Special'?'skill-card':''} ${wild?'wildcard':''} ${active?'combo-ready':''} ${breaks?'combo-break':''}" ${hand?`data-card="${card.id}"`:``} ${hand?`aria-disabled="${disabled}"`:''} title="${escape(reason)}；${escape(effectLines.concat(wildNotes).join(' · '))}；${escape(special.lines.join(' '))}；${wild?tr('任意接续连击','Chains at any cost'):'连击费用 '+p.cost}" data-card-type="${def.cardType||def.kind}" aria-label="${escape(def.name)}，${costLabel}费，${freezing?tr('冻结随机前排 ','Freeze random front ')+p.hits+tr('次',' shots'):def.kind==='attack'?p.damage+'伤害乘'+p.hits:def.kind==='draw'?'请求抽'+p.draw+'张，最多入手'+drawCapacity+'张':escape(effectLines.length?effectLines.join(' · '):supportText(def,p.multiplier))}，${tag}，${escape(special.lines.join(' '))}，${bonusText}，${escape(wildNotes.join(' · '))}${disabled?'，'+escape(reason):''}"><div class="card-top"><span class="cost" data-chain-ready="${!!chainReady}" aria-label="${escape(tr('法力 ' ,'Mana ')+costLabel+(chainReady?' · ×'+p.multiplier:''))}"><span>${costLabel}</span>${chainReady?`<small class="cost-chain">×${p.multiplier}</small>`:''}</span><span class="card-key">${hand?(i===9?'0':i<9?i+1:'#'+(i+1)):card.id?`#${card.id}`:``}</span></div>${svg('icon-'+card.key,'card-art')}<strong class="card-name">${escape(tr(def.name,def.english||def.name).replace('{GlobalKeywords.Armor}',tr('护甲','Armor')))}</strong><span class="card-english">${def.english}</span><div class="card-description">${description}</div>${gemStrip(card)}${p.gemDraw||p.gemArmor?`<span class="gem-extra">${tr('宝石：','Gem: ')}${p.gemDraw?tr('抽牌 +','Draw +')+p.gemDraw+' ':''}${p.gemArmor?tr('护甲 +','Armor +')+p.gemArmor:''}</span>`:""}<div class="combo-benefit ${hand&&!special.compact&&!wild?'redundant-combo':''} ${bonus>0?'boosted':''} ${special.compact?'special-effect':''}">${special.compact?escape(special.compact):!hand&&recipeNote?escape(recipeNote):''}</div><div class="card-bottom"><span>${wild?tr('万能牌','Wild'):p.payment!==p.cost?'连击费 '+p.cost:freezing?tr('防御','Defense'):def.kind==='attack'?'攻击':def.cardType==='Character'?'角色':def.cardType==='Mana'?'法力':def.cardType==='Special'?'技能':def.kind==='draw'?'抽牌':'防御'}</span><span class="chain-tag">${tag}</span></div>${!legal.ok&&!busy?'<span class="card-unavailable">'+escape(legal.reason)+'</span>':''}</${elementTag}>`;

  }
  function drawHand() {
    $('hand-count').textContent=`${battle.piles.hand.length} / ${battle.settings.handLimit}`;
    for(const pile of ['draw','discard','combo']) $(pile+'-count').textContent=battle.piles[pile].length;
    if(!battle.piles.hand.some(c=>c.id===inspectedCard))inspectedCard=null;
    $('hand').innerHTML=battle.piles.hand.length?'<div class="hand-fan">'+battle.piles.hand.map((card,i)=>{
      return cardFace(card,{hand:true,preview:battle.cardPreview(card),i,count:battle.piles.hand.length});
    }).join('')+'</div>':`<div class="empty-hand"><span>${battle.phase==='victory'?'这一场，已经结束。':battle.phase==='defeat'?'旅途暂时止步于此。':'手牌已空'}</span><small>${battle.phase==='player'?'结束回合后恢复法力，重新抽牌。':battle.phase==='enemy'?'敌人行动完成后，将开始下一回合。':'等待下一段旅程。'}</small></div>`;
    $('hand-hint').textContent=busy?tr('正在结算，请稍候…','Resolving…'):battle.phase==='player'?(battle.piles.hand.some(c=>battle.canPlay(c.id).ok)?tr('悬停展开 · 点击或拖入战场出牌 · ← → 选牌', 'Hover to inspect · Click or drag to play · ← → browse'):'没有可出的牌，即将自动结束回合'):'战斗已结束，可重新开始或导出战报';
    layoutHand();paintCastQueue();
  }
  function layoutHand(){
    const hand=$('hand'),cards=[...hand.querySelectorAll('[data-card]')];if(!cards.length)return;
    const selected=cards.findIndex(c=>Number(c.dataset.card)===inspectedCard),layout=CrawlerHand.fan({count:cards.length,width:hand.clientWidth,cardWidth:cards[0].offsetWidth,selected});
    hand.querySelector('.hand-fan').style.width=layout.contentWidth+'px';
    cards.forEach((c,i)=>{const p=layout.cards[i];c.style.setProperty('--hand-x',p.x+'px');c.style.setProperty('--fan-lift',p.lift+'px');c.style.setProperty('--fan-angle',p.angle+'deg');c.style.setProperty('--fan-order',p.order);c.classList.toggle('is-inspected',i===selected);});
    updateHandScroll();
  }
  function updateHandScroll(){const hand=$('hand'),controls=document.querySelector('.hand-scroll-controls');if(!controls)return;controls.hidden=hand.scrollWidth<=hand.clientWidth+1;controls.children[0].disabled=hand.scrollLeft<2;controls.children[1].disabled=hand.scrollLeft+hand.clientWidth>=hand.scrollWidth-2;}
  function inspectHandCard(node,scroll=false){if(!node||drag?.active)return;const id=Number(node.dataset.card);if(inspectedCard!==id){inspectedCard=id;layoutHand();}if(scroll){const hand=$('hand'),left=parseFloat(node.style.getPropertyValue('--hand-x'));if(left<hand.scrollLeft||left+node.offsetWidth>hand.scrollLeft+hand.clientWidth)hand.scrollLeft=left-(hand.clientWidth-node.offsetWidth)/2;}}
  $('hand').addEventListener('pointerover',e=>{if(handInput==='pointer'&&e.pointerType!=='touch')inspectHandCard(e.target.closest('[data-card]'));});
  $('hand').addEventListener('pointermove',e=>{if(!drag&&e.pointerType!=='touch'&&(e.movementX||e.movementY)){handInput='pointer';inspectHandCard(e.target.closest('[data-card]'));}});
  $('hand').addEventListener('pointerleave',()=>{if(drag||$('hand').contains(document.activeElement))return;inspectedCard=null;layoutHand();});
  $('hand').addEventListener('focusin',e=>{handInput='keyboard';inspectHandCard(e.target.closest('[data-card]'),true);});
  $('hand').addEventListener('scroll',updateHandScroll);
  const handControls=document.createElement('div');handControls.className='hand-scroll-controls';handControls.hidden=true;
  handControls.innerHTML='<button type="button" aria-label="向左查看手牌 / Scroll hand left">←</button><button type="button" aria-label="向右查看手牌 / Scroll hand right">→</button>';
  document.querySelector('.hand-toolbar').append(handControls);
  [...handControls.children].forEach((button,i)=>button.addEventListener('click',()=>{$('hand').scrollBy({left:(i?1:-1)*Math.max(144,$('hand').clientWidth*.65),behavior:'auto'});}));
  new ResizeObserver(layoutHand).observe($('hand'));
  window.addEventListener('resize',layoutHand);
  function drawLog() {
    const cursor=battleVisual?.logId??battle.eventId,visible=battle.events.filter(e=>e.id<=cursor&&!['intent','combo','draw_request'].includes(e.type)).slice(-60);
    if(lastLogId===cursor)return;
    $('log').innerHTML=visible.map(e=>`<div class="log-entry ${e.type}"><span class="log-mark">${String(e.turn).padStart(2,'0')}</span><span class="text">${escape(e.text)}</span></div>`).join('');
    $('log').scrollTop=$('log').scrollHeight;$('log').scrollLeft=$('log').scrollWidth;lastLogId=cursor;
  }
  function paintBattleVitals(){
    const p=battleVisual?.player||battle.player;
    $('health-value').innerHTML=`${fmt(p.health)}<small>${p.maxHealth}</small>`;
    $('health-fill').style.width=`${p.health/p.maxHealth*100}%`;
    $('mana-value').textContent=fmt(p.mana);$('armor-value').textContent=fmt(p.armor);
    $('journey-health').textContent=`♥ ${fmt(p.health)} / ${p.maxHealth}`;
  }
  function renderBattle() {
    BossUI.render(battle);
    ComboFX.render(battle.combo);
    $('combat-screen').setAttribute('aria-busy',String(cardCasting||!!enemyTurnToken));
    document.querySelector('.hero-caption').textContent=Crawler.characters?.[run.character]?.name||'守夜人';
    document.querySelector('.hero-art > svg').outerHTML=portrait(run.character);
    $('character-status').textContent=(battle.activeFCC||[]).map(f=>`${Crawler.characters[f.character]?.name||f.character} · 剩余触发 ${f.remaining}`).join(' / ');
    const visualXp=battleVisual?.xp??run.xp,visualLevel=battleVisual?.level??run.level;
    $('battle-xp').innerHTML=`<div class="floor-track"><i style="width:${run.progressionVersion>=7?visualXp/run.xpRequired(visualLevel)*100:0}%"></i><span>XP ${visualXp||0} / ${run.xpRequired?.(visualLevel)||5} · Lv.${visualLevel||1}</span></div>`;
    $('turn-number').textContent=String(battle.turn).padStart(2,'0');
    $('phase-text').textContent=battleVisual?.enemyTurn?tr('敌人回合','Enemy turn'):battleVisual?'结算中':battle.phase==='enemy'?'敌人回合':battle.phase==='victory'?'探索成功':battle.phase==='defeat'?'探索结束':busy?'结算中':'你的回合';
    paintBattleVitals();
    $('mana-dots').innerHTML=Array.from({length:Math.min(8,Math.max(battle.settings.startingMana,battle.player.mana))},(_,i)=>`<i class="${i<battle.player.mana?'filled':''}"></i>`).join('');
    $('combo-value').textContent=`×${battle.combo}`;
    $('combo-hint').textContent=battle.previousWild?tr('W 已接续 · 下一张任意费','W bridge · next card any cost'):battle.combo?`下一张 ${battle.previousCost+1}${battle.reverseCombo?' 或 '+(battle.previousCost-1):''} 费可接续`:'从任意费用开始';
    $('profile-name').textContent=battle.settings.name;$('seed-label').textContent=battle.seed;
    $('end-turn').disabled=busy||battle.phase!=='player';
    $('battle-tip').textContent=battle.phase==='enemy'?tr('前线敌人正在执行意图…','Front-line enemies are acting…'):tr('前线倒下，后排补位。结束回合后前线行动。','Reserves advance when the front falls. End turn to let the front line act.');
    drawEnemies();drawHand();PileFX.sync(battle,c=>svg('icon-'+c.key));drawLog();
    $('bonus-tiles').innerHTML=bonusTiles(true);
    $('combat-stat-tiles').innerHTML=`<span>◇<b>${run.gold}</b><small>金币</small></span><span>⚔<b>${run.stats.kills+battle.events.filter(e=>e.type==='kill').length}</b><small>击败敌人</small></span>`;
    if(DungeonView.drawBattle&&run.dungeon)DungeonView.drawBattle($('battle-backdrop'),battleViewState());else if(DungeonView.drawBackdrop)DungeonView.drawBackdrop($('battle-backdrop'));

    const over=!battleVisual&&['victory','defeat'].includes(battle.phase);$('result-panel').hidden=!over;
    if(over){const won=battle.phase==='victory';$('result-kicker').textContent=won?'THE CRYPT FALLS SILENT':'THE DARKNESS REMAINS';$('result-title').textContent=won?'地窖归于寂静':'火光渐渐熄灭';$('result-description').textContent=won?`你在第 ${battle.turn} 回合击败了所有敌人，剩余 ${fmt(battle.player.health)} 点生命。`:`守夜人在第 ${battle.turn} 回合倒下。调整出牌顺序，再试一次。`;}
  }
  function clearBattleMotion(){
    CombatFX.cancel();EnemyTurnFX.cancel();PixelVFX.cancel();GameAudio.cancel();battleVisual=null;$('enemies').dataset.motion='idle';document.querySelectorAll('.played-card,.cast-ribbon,.impact-number,.attack-vfx,.boundary-burst').forEach(e=>e.remove());
  }
  function lootReadout(text,target,kind='gold'){
    const p=LootFX.target(target),el=document.createElement('span');el.className='loot-readout '+kind;el.textContent=text;el.setAttribute('role','status');
    Object.assign(el.style,{left:Math.max(8,Math.min(innerWidth-120,p.x-50))+'px',top:Math.max(12,p.y+18)+'px'});document.body.append(el);setTimeout(()=>el.remove(),850);
  }
  function enemyOrigins(){return new Map([...document.querySelectorAll('[data-enemy]')].map(el=>{const r=(el.querySelector('.enemy-art')||el).getBoundingClientRect();return [el.dataset.enemy,{x:r.left+r.width/2,y:r.top+r.height*.7}];}));}
  function animateExperience(events,origins=new Map()){
    const drops=events.map(e=>({event:e,gain:run.experienceGain(e)})).filter(d=>d.gain>0);
    if(!drops.length||!battleVisual)return Promise.resolve();
    const visual=battleVisual;visual.xp??=run.xp;visual.level??=run.level;
    const total=drops.reduce((sum,d)=>sum+d.gain,0),points=drops.map(d=>origins.get(String(d.event.enemyId))||LootFX.target(document.querySelector('.player-panel'))),p=points[0];
    return LootFX.play({kind:'xp',duration:480,bounds:{left:p.x,top:p.y,width:1,height:1},origins:points,target:()=>LootFX.target($('battle-xp'))}).then(()=>{
      if(battleVisual!==visual)return;
      visual.xp+=total;const previousLevel=visual.level;
      while(visual.xp>=run.xpRequired(visual.level)){visual.xp-=run.xpRequired(visual.level);visual.level++;}
      const paint=()=>{if(battleVisual!==visual)return;const track=$('battle-xp').querySelector('.floor-track');if(track){track.querySelector('i').style.width=visual.xp/run.xpRequired(visual.level)*100+'%';track.querySelector('span').textContent=`XP ${visual.xp} / ${run.xpRequired(visual.level)} · Lv.${visual.level}`;}};
      if(visual.level>previousLevel&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const track=$('battle-xp').querySelector('.floor-track');if(track){track.querySelector('i').style.width='100%';track.querySelector('span').textContent=`Lv.${previousLevel} → Lv.${visual.level}`;}setTimeout(paint,140);}else paint();
      $('battle-xp').classList.add('xp-arrival');setTimeout(()=>$('battle-xp').classList.remove('xp-arrival'),400);
      lootReadout(`+${total} XP${visual.level>previousLevel?' · Lv.'+visual.level:''}`,$('battle-xp'),'xp');
    });
  }
  function showImpact(target,text,kind='damage'){
    if(!target)return;
    const label=document.createElement('span');label.className=`impact-number ${kind}`;label.textContent=text;label.setAttribute('aria-hidden','true');
    if(target.classList.contains('enemy')){const depth=Number(target.dataset.depth)||0;label.dataset.depth=String(depth);label.style.left=target.style.getPropertyValue('--formation-x');label.style.top=Math.max(4,35-depth*15)+'%';target.parentElement.append(label);}else target.append(label);
    setTimeout(()=>label.remove(),650);
  }
  function boundaryMotion(event){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const arena=document.querySelector('.arena'),formation=$('enemies'),rect=formation.getBoundingClientRect(),stage=arena.getBoundingClientRect(),side=event.boundary;
    const world=Crawler.specials?.arena||{width:9,height:6},clamp=n=>Math.max(0,Math.min(1,n)),readout=parseFloat(getComputedStyle(formation).getPropertyValue('--formation-readout'))||72;
    const x=Number.isFinite(event.position?.x)?rect.left-stage.left+clamp(event.position.x/world.width)*rect.width:side==='left'?12:side==='right'?stage.width-12:rect.left-stage.left+rect.width*.5;
    const y=Number.isFinite(event.position?.y)?rect.top-stage.top+(1-clamp(event.position.y/world.height))*(rect.height-readout):side==='top'?rect.top-stage.top+8:side==='bottom'?rect.bottom-stage.top-readout:rect.top-stage.top+rect.height*.45;
    PixelVFX.emit('explosions/plasma-explosion',stage.left+x,stage.top+y,{scale:.65,duration:420,bounds:stage});PixelVFX.shake(3);GameAudio.play('rune');
    const effect=document.createElement('span');effect.className='boundary-burst';effect.dataset.boundary=side||'edge';effect.setAttribute('aria-hidden','true');effect.style.setProperty('--burst-x',x+'px');effect.style.setProperty('--burst-y',y+'px');arena.append(effect);setTimeout(()=>effect.remove(),450);
  }
  function paintCastQueue(){
    document.querySelectorAll('#hand [data-card]').forEach(el=>{const at=castQueue.indexOf(Number(el.dataset.card));el.classList.toggle('cast-queued',at>=0);el.querySelector('.cast-queue-badge')?.remove();if(at>=0){const badge=document.createElement('span');badge.className='cast-queue-badge';badge.textContent=tr('待出 ','NEXT ')+(at+1);el.append(badge);}});
  }
  function drainCastQueue(){
    if(busy||homeOpen||document.querySelector('dialog[open]'))return;
    if(run?.phase!=='battle'||battle.phase!=='player'){castQueue=[];return;}
    while(castQueue.length){const id=castQueue.shift(),legal=battle.canPlay(id);if(legal.ok){play(id);return;}if(battle.piles.hand.some(c=>c.id===id))toast(legal.reason);}
    paintCastQueue();scheduleAutoEnd();
  }
  function play(id) {
    if(run?.phase!=='battle'||homeOpen||battle.phase!=='player')return;
    if(run.allowTutorial&&!run.allowTutorial('play',id))return;
    if(busy){if(cardCasting&&!castQueue.includes(id)&&battle.canPlay(id).ok){castQueue.push(id);paintCastQueue();}return;}
    const card=battle.piles.hand.find(c=>c.id===id);if(!card)return;
    const automaticTarget=battle.living()[0];if(automaticTarget)battle.chooseTarget(automaticTarget.id);
    const def=definition(card),preview=battle.cardPreview(card),before=JSON.parse(JSON.stringify(battle.enemies));
    const source=PileFX.capture(document.querySelector(`[data-card="${id}"]`));
    const start=battle.events.length, result=battle.play(id);
    if(!result.ok){toast(result.reason);return;}
    animatePlayedCard({card,def,preview,before,source,events:battle.events.slice(start)});
  }
  function animatePlayedCard({card,def,preview,before,source,events}){
    const id=card.id,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,version=epoch;
    // The engine settles once and is saved immediately. This snapshot only animates
    // already-recorded hits; refreshing cannot replay damage or costs.
    busy=true;cardCasting=true;battleVisual={enemies:before,target:battle.target};persist();render();
    const cardFlight=PileFX.cast(source,def.destroyOnPlay?'destroy':battle.piles.fcc.some(c=>c.id===id)?'active':'discard');
    // One native wave can hit several enemies at once. Animate those together.
    // Long chains compress waves into at most twelve visual beats.
    const waves=[];for(let event of events){
      if(event.type==='boundary_explosion'){waves.push({key:'boundary-'+event.id,hits:[],bursts:[event],advances:[],intents:[]});continue;}
      if(event.type==='enemy_advance'){if(waves.length)waves.at(-1).advances.push(event);continue;}
      if(event.type==='intent'){if(waves.length)waves.at(-1).intents.push(event);continue;}
      if(event.type==='freeze'||event.type==='freeze_resisted'){const enemy=before.find(e=>e.id===event.enemyId);if(!enemy)continue;event={...event,type:'enemy_damage',source:event.type,frozenVisual:event.type==='freeze',freezeResisted:event.type==='freeze_resisted',healthAfter:enemy.health,armorAfter:enemy.armor,actualLoss:0,armorDamage:0};}
      if(event.type!=='enemy_damage')continue;
      const key=(event.wave??event.hit)+':'+(event.source||'hit'),previous=waves.at(-1);
      if(previous&&(previous.key===key||event.source==='boundary_explosion'&&previous.bursts.length&&!previous.hits.length))previous.hits.push(event);else waves.push({key,hits:[event],bursts:[],advances:[],intents:[]});
    }
    const groupSize=Math.max(1,Math.ceil(waves.length/12)),beats=[];
    for(let i=0;i<waves.length;i+=groupSize){const batch=waves.slice(i,i+groupSize);beats.push({hits:batch.flatMap(w=>w.hits),bursts:batch.flatMap(w=>w.bursts),advances:batch.flatMap(w=>w.advances),intents:batch.flatMap(w=>w.intents)});}
    let index=0;const xpShown=new Set(),xpFlights=[],xpEvents=events.filter(e=>e.type==='kill'||e.type==='experience_gain');
    const sendXp=(batch,origins)=>{const fresh=batch.filter(e=>!xpShown.has(e.id));fresh.forEach(e=>xpShown.add(e.id));if(fresh.length)xpFlights.push(animateExperience(fresh,origins));};
    const finish=async()=>{if(version!==epoch)return;if(events.some(e=>e.type==='boss_fx'&&e.fx==='ritual')){battleVisual.enemies=JSON.parse(JSON.stringify(battle.enemies));renderBattle();await BossUI.summon(battle);if(version!==epoch)return;}sendXp(xpEvents,enemyOrigins());Promise.all([...xpFlights,cardFlight.finished]).then(()=>{if(version!==epoch)return;clearBattleMotion();cardCasting=false;busy=false;render();BossUI.effects(events);drainCastQueue();});};
    const motionPace=CombatMotion.pace(beats.length);
    const impact=async()=>{
      if(version!==epoch||!battleVisual)return;
      const beat=beats[index++];
      if(!beat){
        if(!beats.length){cardFlight.release();PixelVFX.buff(preview);}
        if(preview.comboBonus)showImpact(document.querySelector('.chain-panel'),tr('友情加成 +','Friendship +')+preview.comboBonus,'armor');
        if(preview.armor)showImpact(document.querySelector('.player-panel'),`护甲 +${preview.armor}`,'armor');
        if(preview.manaGain)showImpact(document.querySelector('.combat-right'),`法力 +${preview.manaGain}`,'armor');
        if(preview.mightGain||preview.amountGain||preview.dealGain||preview.luckGain)showImpact(document.querySelector('.player-panel'),(def.kind==='wild'?Crawler.effectsV10.descriptions(def,preview.effectMultiplier,CrawlerLocale.language==='en',{friendshipBonus:preview.comboBonus,settings:wildSettings(),preview}).join(' · '):supportText(def,preview.multiplier)),'armor');
        if(preview.draw)document.querySelectorAll('#hand .card').forEach(el=>{if(events.some(e=>e.type==='draw'&&String(e.cardId)===el.dataset.card))el.classList.add('draw-arrival');});
        setTimeout(finish,reduced?0:48);return;
      }
      const origins=enemyOrigins(),oldRects=CombatFX.capture(),group=beat.hits,totals=new Map(),positions=new Map(CombatMotion.formation(battleVisual.enemies,Infinity).map(p=>[p.enemy.id,{column:p.column,depth:p.depth,reserves:p.reserves}])),alive=new Set(battleVisual.enemies.filter(e=>e.health>0).map(e=>e.id));
      const points=[...new Set(group.filter(e=>e.source!=='boundary_explosion').map(e=>e.enemyId))].flatMap(id=>{const r=oldRects.get(id);return r?[{x:r.left+r.width/2,y:r.top+r.height*.55}]:[];});
      $('enemies').dataset.motion='windup';
      const strike=points.length?CombatFX.attack({def,key:card.key,targets:points,pace:motionPace,splash:group.every(e=>e.splash)}):{contact:Promise.resolve(),finished:Promise.resolve()};
      await strike.contact;if(version!==epoch||!battleVisual)return;cardFlight.release();
      battleVisual.formationHold=positions;battleVisual.fallenIds=new Set();battleVisual.advanceIds=new Set();
      for(const event of group){const enemy=battleVisual.enemies.find(e=>e.id===event.enemyId);if(!enemy)continue;enemy.health=event.healthAfter;enemy.armor=event.armorAfter;if(event.frozenVisual){enemy.freezeStacks=event.stacks;enemy.intent=null;}if(enemy.health<=0&&alive.has(enemy.id))battleVisual.fallenIds.add(enemy.id);battleVisual.target=event.enemyId;const t=totals.get(event.enemyId)||{health:0,armor:0,explosion:false,splash:false};t.health+=event.actualLoss;t.armor+=event.armorDamage;t.explosion||=event.source==='boundary_explosion'||event.boundary===true;t.splash||=event.splash===true;t.freezeResisted||=event.freezeResisted===true;totals.set(event.enemyId,t);}
      for(const event of beat.advances){const enemy=battleVisual.enemies.find(e=>e.id===event.enemyId);if(enemy&&Number.isFinite(event.toRow))enemy.slot={...enemy.slot,row:event.toRow};}
      for(const event of beat.intents){const enemy=battleVisual.enemies.find(e=>e.id===event.enemyId);if(enemy)enemy.intent=JSON.parse(JSON.stringify(enemy.intents?.find(i=>i.id===event.intentId)||null));}
      renderBattle();$('result-panel').hidden=true;
      $('enemies').dataset.motion=battleVisual.fallenIds.size?'death':'hit';
      beat.bursts.slice(0,5).forEach(boundaryMotion);
      const responses=[];
      if(totals.size)ComboFX.hit(preview.multiplier);
      for(const [enemyId,total]of totals){const el=document.querySelector(`[data-enemy="${enemyId}"]`),enemy=battleVisual.enemies.find(e=>e.id===enemyId),ice=CombatMotion.family(def)==='ice';showImpact(el,`${total.explosion?tr('爆炸 ','Blast '):total.splash?tr('溅射 ','Splash '):''}${total.health?'-'+fmt(total.health):total.freezeResisted?tr('抵抗冻结','Freeze resisted'):ice?tr('冰冻','Frozen'):tr('格挡','Blocked')}${total.armor?' · ⬡ -'+fmt(total.armor):''}`,total.explosion?'explosion':total.splash?'splash':'damage');
        responses.push(battleVisual.fallenIds.has(enemyId)&&enemy.bossKind===5?BossUI.finale(el):battleVisual.fallenIds.has(enemyId)?CombatFX.die(el,enemy.visualKey||enemy.key,motionPace):CombatFX.hit(el,{blocked:!total.health,heavy:enemy.encounterRole==='boss',pace:motionPace}));
      }
      await Promise.all([...responses,strike.finished]);if(version!==epoch||!battleVisual)return;
      const dead=new Set(battleVisual.fallenIds);sendXp(xpEvents.filter(e=>e.type==='kill'&&dead.has(e.enemyId)),origins);
      battleVisual.fallenIds.clear();battleVisual.formationHold=null;
      const moved=CombatMotion.formation(battleVisual.enemies).filter(p=>positions.get(p.enemy.id)?.depth!==p.depth);battleVisual.advanceIds=new Set(moved.map(p=>p.enemy.id));
      drawEnemies();$('enemies').dataset.motion=moved.length?'advance':'idle';
      await Promise.all(moved.map(p=>CombatFX.advance(document.querySelector(`[data-enemy="${p.enemy.id}"]`),oldRects.get(p.enemy.id),motionPace)));if(version!==epoch||!battleVisual)return;
      battleVisual.advanceIds.clear();$('enemies').dataset.motion='idle';
      setTimeout(()=>void impact(),0);
    };
    setTimeout(impact,reduced?0:66);
  }
  function endTurn() {
    if(busy||run?.phase!=='battle'||run.allowTutorial&&!run.allowTutorial('endTurn'))return;
    const departing=PileFX.hand(),bossEventStart=battle.events.length;if(!battle.beginEnemyTurn())return;BossUI.effects(battle.events.slice(bossEventStart));castQueue=[];PileFX.discardHand(departing,battle);
    persist();if(battle.phase!=='enemy'){render();return;}pumpEnemies();
  }
  async function pumpEnemies(){
    if(enemyTurnToken||homeOpen||run?.phase!=='battle'||battle.phase!=='enemy')return;
    const token={},version=epoch;enemyTurnToken=token;busy=true;render();
    try{
      await EnemyTurnFX.pause(180);
      while(version===epoch&&!homeOpen&&run?.phase==='battle'&&battle.phase==='enemy'){
        const start=battle.events.length,origins=enemyOrigins(),actor=battle.enemies.find(e=>e.id===battle.enemyQueue[0]);
        const visual={enemyTurn:true,enemies:JSON.parse(JSON.stringify(battle.enemies)),player:{...battle.player},target:battle.target,logId:battle.eventId};
        // Resolve and persist once. Only the displayed snapshot waits for contact.
        battle.resolveNextEnemy();const events=battle.events.slice(start),steps=EnemyTurnMotion.steps(events);
        battleVisual=visual;persist();render();
        await animateEnemyResolution(events,actor,visual,version,origins);
        if(battle?.phase==='enemy'&&run?.phase==='battle')await EnemyTurnFX.pause(90);
      }
    }finally{if(enemyTurnToken===token)enemyTurnToken=null;if(version===epoch){clearBattleMotion();busy=false;render();}}
  }
  async function animateEnemyResolution(events,actor,visual,version,origins){
    const steps=EnemyTurnMotion.steps(events);
        const name=actor?(CrawlerLocale.language==='en'?actor.english||actor.name:actor.name):'';
        for(const {kind,event}of steps){
          if(version!==epoch||battleVisual!==visual)return;
          const el=document.querySelector(`[data-enemy="${event.enemyId}"]`);
          if(kind==='attack'){
            EnemyTurnFX.status(`${name} · ${tr('攻击','Attack')} ${fmt(event.damage)}`);
            const motion=EnemyTurnFX.lunge(el);await motion.contact;if(version!==epoch||battleVisual!==visual)return;
            const info=EnemyTurnMotion.impact(event);visual.player.health=info.health;visual.player.armor=info.armor;visual.logId=event.id;paintBattleVitals();drawLog();
            const parts=[info.absorbed?tr('护甲抵消 ','Armor blocked ')+fmt(info.absorbed):'',info.healthLoss?tr('生命 −','HP −')+fmt(info.healthLoss):info.blocked?tr('完全格挡','Full block'):info.empty?tr('无伤害','No damage'):'',info.broken?tr('护甲破裂','Armor broken'):''].filter(Boolean);
            EnemyTurnFX.status(`${name} · ${parts.join(' · ')}`);
            await Promise.all([motion.finished,EnemyTurnFX.feedback(info)]);
          }else if(kind==='guard'){
            EnemyTurnFX.status(`${name} · ${tr('护甲 +','Armor +')}${fmt(event.amount)}`);const motion=EnemyTurnFX.guard(el);await motion.contact;if(version!==epoch||battleVisual!==visual)return;
            const enemy=visual.enemies.find(e=>e.id===event.enemyId);if(enemy){enemy.armor+=event.amount;const armor=el?.querySelector('.enemy-armor');if(armor)armor.textContent='⬡'+fmt(enemy.armor);}
            visual.logId=event.id;drawLog();await motion.finished;
          }else if(kind==='revive'){
            visual.player.health=event.health;visual.player.revivalStacks=event.remaining;visual.logId=event.id;paintBattleVitals();drawLog();EnemyTurnFX.status(tr('复活 · 重返战斗','Revived · Back in battle'));await EnemyTurnFX.revive(event.health);
          }else{visual.logId=event.id;drawLog();EnemyTurnFX.status(`${name} · ${tr('等待','Waiting')}`);await EnemyTurnFX.pause(240);}
        }
        if(version!==epoch||battleVisual!==visual)return;
        if(!steps.length&&actor?.health>0&&!actor.intent){EnemyTurnFX.status(`${name} · ${actor.freezeStacks?tr('冰冻 · 无法行动','Frozen · Cannot act'):tr('本轮无法行动','Cannot act this turn')}`);await EnemyTurnFX.pause(220);}
        const xpEvents=events.filter(e=>['kill','experience_gain'].includes(e.type)&&run.experienceGain(e)>0);if(xpEvents.length)await animateExperience(xpEvents,origins);
        if(version!==epoch)return;clearBattleMotion();render();BossUI.effects(events);
  }
  function pumpDig(){
    busy=true;render();const version=epoch;
    const tick=()=>{
      if(version!==epoch)return;
      if(run?.phase!=='digging'){busy=false;return;}
      run.digStep();persist();render();
      if(run.phase==='digging')setTimeout(tick,run.dig.durationMs/run.dig.total);
      else{busy=false;render();toast('洞口挖通，已进入下一层');}
    };setTimeout(tick,run.dig.durationMs/run.dig.total);
  }
  function restart(profile,seed,character=selectedCharacter,wildStrength=true,teach=!TutorialUI.completed()) {epoch++;castQueue=[];cardCasting=false;PileFX.leave();cancelDrag();clearTimeout(autoEndTimer);clearBattleMotion();busy=false;lastLogId=0;homeOpen=false;const options={profile,seed:seed?.trim()||randomRunSeed(),character,wildStrength};run=teach?CrawlerTutorial.create(options):new Run(options);battle=null;persist();render();toast('新的探索开始了');}
  function openRestart() {if(busy)return;homeOpen=true;cancelDrag();clearTimeout(autoEndTimer);render();}
  $('hand').addEventListener('pointerdown',e=>{
    const card=e.target.closest('[data-card]');if(!card||(busy&&!cardCasting)||homeOpen||run?.phase!=='battle'||e.button!==0)return;
    const alreadyInspected=inspectedCard===Number(card.dataset.card);inspectHandCard(card);
    if(card.getAttribute('aria-disabled')==='true')return;
    clearTimeout(autoEndTimer);drag={id:Number(card.dataset.card),pointer:e.pointerId,pointerType:e.pointerType,alreadyInspected,x:e.clientX,y:e.clientY,node:card,active:false};$('hand').setPointerCapture(e.pointerId);
  });
  $('hand').addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pointer)return;
    if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
    if(!drag.active){drag.active=true;const r=drag.node.getBoundingClientRect();drag.ghost=drag.node.cloneNode(true);drag.ghost.removeAttribute('data-card');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.classList.add('drag-card');const wrap=document.createElement('div');wrap.className='hand drag-wrapper';wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3000';wrap.append(drag.ghost);document.body.append(wrap);drag.wrap=wrap;drag.ghost.style.width=r.width+'px';drag.ghost.style.minWidth=r.width+'px';drag.ghost.style.maxWidth=r.width+'px';drag.node.classList.add('drag-origin');document.body.classList.add('drag-active');}
    e.preventDefault();Object.assign(drag.ghost.style,{left:(e.clientX-75)+'px',top:(e.clientY-70)+'px'});
    document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'));
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.arena');if(target)target.classList.add('drop-target');
  });
  $('hand').addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.pointer)return;const id=drag.id,active=drag.active,inspectOnly=!active&&drag.pointerType==='touch'&&!drag.alreadyInspected,target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.arena');cancelDrag();
    if((!active||target)&&(!busy||cardCasting)&&run?.phase==='battle'&&!inspectOnly)play(id);scheduleAutoEnd();
  });
  $('hand').addEventListener('pointercancel',()=>{cancelDrag();scheduleAutoEnd();});
  function cancelDrag(){if(drag){drag.node?.classList.remove('drag-origin');drag.wrap?.remove();if($('hand').hasPointerCapture(drag.pointer))$('hand').releasePointerCapture(drag.pointer);}drag=null;document.body.classList.remove('drag-active');document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'));}
  window.addEventListener('blur',()=>{cancelDrag();scheduleAutoEnd();});
  function scheduleAutoEnd(){clearTimeout(autoEndTimer);if(watching||homeOpen||busy||castQueue.length||drag||run?.phase!=='battle'||battle?.phase!=='player'||document.querySelector('dialog[open]')||battle.piles.hand.some(c=>battle.canPlay(c.id).ok))return;const version=epoch;autoEndTimer=setTimeout(()=>{if(version===epoch&&!homeOpen&&!busy&&!drag&&run?.phase==='battle'&&battle.phase==='player'&&!document.querySelector('dialog[open]')&&!battle.piles.hand.some(c=>battle.canPlay(c.id).ok))endTurn();},650);}
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{drainCastQueue();scheduleAutoEnd();}));
  $('battle-log-toggle').addEventListener('click',()=>document.querySelector('.log-panel').classList.toggle('open'));
  $('language-select').value=CrawlerLocale.language;
  $('language-select').addEventListener('change',e=>{const profile=$('home-profile')?.value,seed=$('home-seed')?.value;cancelDrag();CrawlerLocale.set(e.target.value);AIWatch.localize();lastLogId=0;if(!busy)render();if(profile)$('home-profile').value=profile;if(seed)$('home-seed').value=seed;});
  document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();openRestart();});
  $('hand').addEventListener('click',e=>{const button=e.target.closest('[data-card]');if(e.detail===0&&button&&button.getAttribute('aria-disabled')!=='true')play(Number(button.dataset.card));});
  $('end-turn').addEventListener('click',endTurn);
  $('help-button').addEventListener('click',()=>$('help-dialog').showModal());
  $('restart-button').addEventListener('click',openRestart);$('play-again').addEventListener('click',openRestart);
  document.querySelectorAll('.dialog-close').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('restart-form').addEventListener('submit',e=>{e.preventDefault();restart($('profile-input').value,$('seed-input').value.trim());$('restart-dialog').close();});
  document.querySelectorAll('[data-pile]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.pile, cards=PileFX.pileCards(battle,key),names={draw:'抽牌堆',discard:'弃牌堆',combo:'连击堆'}, counts={};
    cards.forEach(c=>counts[c.key]=(counts[c.key]||0)+1);
    $('pile-title').textContent=`${names[key]} · ${cards.length} 张`;
    $('pile-subtitle').textContent=key==='draw'?'显示卡牌构成，不显示抽取顺序。':key==='combo'?'连击结束后移入弃牌堆；抽牌不足时也可能回收。':tr('包含本轮已打出的普通牌；回收时先使用弃牌，再使用连击暂存牌。','Includes played cards. Recycling uses discarded cards before the current combo cards.');
    $('pile-content').innerHTML=`<div class="card-gallery">${[...cards].sort((a,b)=>a.key.localeCompare(b.key)||a.id-b.id).map(c=>cardTile(c)).join('')||'<p>这里暂时没有卡牌。</p>'}</div>`;
    $('pile-dialog').showModal();
  }));
  $('export-button').addEventListener('click',()=>{
    if(!run){toast('请先开始探索');return;}
    const blob=new Blob([JSON.stringify(run.export(),null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;a.download=`duskvault-run-floor-${run.floor}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('整局战报已导出');
  });
  document.addEventListener('keydown',e=>{
    if(watching||homeOpen||document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
    if(run?.phase==='map'){
      if(e.key.toLowerCase()==='m'){e.preventDefault();showMap();return;}
      const keys={w:'walk:forward',s:'walk:back',a:'walk:left',d:'walk:right',q:'turn:-1',e:'turn:1',ArrowUp:'walk:forward',ArrowDown:'walk:back',ArrowLeft:'turn:-1',ArrowRight:'turn:1'};
      const action=keys[e.key]||keys[e.key.toLowerCase()];if(action){e.preventDefault();exploreAction(action);}return;
    }
    if(run?.phase!=='battle')return;
    if(e.key==='Escape'){castQueue=[];paintCastQueue();return;}
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const cards=[...$('hand').querySelectorAll('[data-card]')];if(cards.length){e.preventDefault();handInput='keyboard';const focused=cards.indexOf(document.activeElement),current=focused<0?cards.findIndex(c=>Number(c.dataset.card)===inspectedCard):focused,index=current<0?(e.key==='ArrowRight'?0:cards.length-1):Math.max(0,Math.min(cards.length-1,current+(e.key==='ArrowRight'?1:-1)));cards[index].focus({preventScroll:true});inspectHandCard(cards[index],true);}return;}
    if(/^[0-9]$/.test(e.key)){const card=battle.piles.hand[e.key==='0'?9:Number(e.key)-1];if(card){e.preventDefault();play(card.id);}}
    else if(e.key.toLowerCase()==='e'){e.preventDefault();endTurn();}
  });
  function persist(){
    if(testingBoss||testingTutorial||watching||!run)return;
    run.syncTutorial?.();
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(run.snapshot()));saveError='';}catch(e){saveError='自动保存不可用，请保留当前页面';}
  }
  async function enterBattleView(canvas){
    if(!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches){busy=false;render();return;}
    busy=true;const version=epoch;
    await EncounterView.enter(canvas,{current:()=>version===epoch&&run?.phase==='battle',prepare:()=>Promise.all([DungeonView.prepareBattle($('battle-backdrop'),battleViewState()),EncounterView.warm(run.battle.enemies.map(e=>e.visualKey||e.key))]),reveal:render});
    if(version===epoch){busy=false;render();}
  }
  function exploreAction(command){
    if(busy||run?.phase!=='map')return;
    const [action,arg]=command.split(':');
    const from={x:run.dungeon.x,y:run.dungeon.y,dir:run.dungeon.dir};
    const result=action==='walk'?run.walk(arg):action==='turn'?run.turn(Number(arg)):{ok:false,reason:tr('向目标移动即可触发','Move into the object to interact')};
    if(!result.ok){toast(result.reason||'暂时无法操作');if(result.bump){const view=$('dungeon-canvas');PixelVFX.wall(view);view?.classList.remove('wall-bump');void view?.offsetWidth;view?.classList.add('wall-bump');}return;}
    lastLogId=0;persist();
    if(result.notice)toast(result.notice);
    if(run.phase==='digging'){pumpDig();return;}
    const canvas=$('dungeon-canvas');
    if(result.feedback){animateExplorationLoot(result,from,canvas);return;}
    if(run.phase==='battle'){
      const facing=CrawlerDungeon.dirs.findIndex(v=>from.x+v.x===run.dungeon.x&&from.y+v.y===run.dungeon.y),house=run.currentRoom()?.type==='boss'?CrawlerDungeon.landmark(run.dungeon):null,dir=house?.dir??(facing<0?from.dir:facing);
      run.dungeon.dir=dir;run.battleCamera={...from,dir,floor:run.floor,room:run.current};persist();
      if(canvas&&dir!==from.dir&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        busy=true;const version=epoch,start=performance.now(),turn=((dir-from.dir+6)%4)-2;
        const face=now=>{if(version!==epoch)return;const t=Math.min(1,(now-start)/220);DungeonView.draw(canvas,{...viewState(),...from,dir:from.dir+turn*t*t*(3-2*t)});if(t<1)requestAnimationFrame(face);else enterBattleView(canvas);};requestAnimationFrame(face);
      }else enterBattleView(canvas);return;
    }
    if(result.stationary||!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches){if(run.phase==='battle')enterBattleView(canvas);else render();if(result.goldGain){const stage=document.querySelector('.library-stage'),badge=document.createElement('span');badge.className='gold-pickup-feedback';badge.textContent='◆ +'+result.goldGain;stage?.append(badge);setTimeout(()=>badge.remove(),1100);}return;}
    busy=true;const version=epoch,start=performance.now(),to={x:run.dungeon.x,y:run.dungeon.y,dir:action==='turn'?from.dir+Number(arg):from.dir};
    const animate=now=>{
      if(version!==epoch)return;
      const t=Math.min(1,(now-start)/170),ease=t*t*(3-2*t);
      DungeonView.draw(canvas,{...viewState(),x:from.x+(to.x-from.x)*ease,y:from.y+(to.y-from.y)*ease,dir:from.dir+(to.dir-from.dir)*ease});
      if(t<1)requestAnimationFrame(animate);else{busy=false;if(run.phase==='battle')enterBattleView(canvas);else render();}
    };requestAnimationFrame(animate);
  }
  function animateExplorationLoot(result,from,oldCanvas){
    const feedback=result.feedback,version=epoch,oldRect=oldCanvas?.getBoundingClientRect(),bounds=oldCanvas&&DungeonView.objectBounds(oldCanvas,feedback.x,feedback.y)||{left:(oldRect?.left||0)+(oldRect?.width||innerWidth)*.45,top:(oldRect?.top||0)+(oldRect?.height||innerHeight)*.58,width:(oldRect?.width||200)*.1,height:(oldRect?.height||200)*.16};
    busy=true;render();const canvas=$('dungeon-canvas'),hide=feedback.kind==='collect'?[]:[feedback.x+','+feedback.y];
    if(canvas)DungeonView.draw(canvas,{...viewState(),...from},{hideObjects:hide});
    const counter=()=>[...document.querySelectorAll('[data-gold-target],#journey-gold')].find(el=>{const r=el.getBoundingClientRect();return r.width&&r.top>=0&&r.bottom<=innerHeight;})||$('journey-gold');
    const previousGold=run.gold-(result.goldGain||0);
    if(result.goldGain){document.querySelectorAll('[data-gold-target] b').forEach(el=>el.textContent=previousGold);$('journey-gold').textContent=`◇ ${previousGold} ${tr('金币','gold')}`;}
    if(!result.stationary&&canvas){const start=performance.now(),to={x:run.dungeon.x,y:run.dungeon.y};const move=now=>{if(version!==epoch||!canvas.isConnected)return;const t=Math.min(1,(now-start)/170);DungeonView.draw(canvas,{...viewState(),x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});if(t<1)requestAnimationFrame(move);};if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(move);else DungeonView.draw(canvas,viewState());}
    LootFX.play({...feedback,bounds,target:()=>result.goldGain?LootFX.target(counter()):{x:innerWidth/2,y:innerHeight*.8}}).finally(()=>{
      if(version!==epoch)return;busy=false;render();
      if(result.healGain){lootReadout('+'+result.healGain+' HP',document.querySelector('.health-heart')||$('journey-health'),'heal');}
      if(result.goldGain){const target=counter();target?.classList.add('loot-counter-arrival');setTimeout(()=>target?.classList.remove('loot-counter-arrival'),450);lootReadout('+'+result.goldGain+' '+tr('金币','gold'),target);}
    });
  }
  function viewState(){return {...run.dungeon,objectAt:(x,y)=>CrawlerDungeon.objectAt(run.dungeon,x,y),objectInfo:(x,y)=>{
    const o=CrawlerDungeon.objectAt(run.dungeon,x,y);if(!o)return null;
    // Closed containers deliberately do not expose their pre-rolled reward.
    const infos={mansionDoor:['宅邸','宅邸大门 · 向前进入图书馆','宅邸大门 · 进入'],gargoyle:['石像','石像 · 可破坏，可能掉落万能牌或金币','石像 · 破坏'],manaCart:['法力车','法力推车 · 打碎后掉落法力强化','法力推车 · 破坏'],bracerCart:['护腕车','护腕推车 · 打碎后掉落抽牌强化','护腕推车 · 破坏'],barrel:['木桶','木桶 · 打碎后查看掉落','木桶 · 破坏'],crate:['箱子','箱子 · 打碎后查看掉落','箱子 · 破坏'],removal:['删牌','遗忘祭坛 · 本层免费移除一张牌','遗忘祭坛 · 免费删牌'],shovel:['铲子','铲子 · 挖掘下层','铲子 · 下层'],hole:['洞口','已挖开的洞口','洞口'],gemchest:['宝石','宝石箱 · 打开后查看宝石','宝石箱'],gemhammer:['宝锤','宝石锤 · 靠近拾取','宝石锤'],gem:['宝石','宝石 · 靠近拾取','宝石']};
    let info=infos[o.type];if(o.type==='mansionDoor'&&o.locked)info=['宅邸','宅邸大门 · 击败守卫后开启','宅邸大门 · 守卫盘踞'];
    if(o.type==='pickup'){const amount=Number(o.reward?.amount)||0;info=o.reward?.kind==='heal'?[`+${amount}`,`鸡肉 · 恢复 ${amount} 生命`,`鸡肉 +${amount}`]:[`${amount}金`,`金币 · 拾取 ${amount} 金币`,`金币 +${amount}`];}
    if(o.type==='pickup'&&o.reward?.kind==='card'){const c=definition({key:o.reward.key});info=['W',c.name+' · 拾取后加入牌组',c.name];}
    if(o.type==='pickup'&&o.reward?.kind==='mana')info=['法力+1','法力强化 · 回合起始法力 +1（本局）','法力 +1'];
    if(o.type==='pickup'&&o.reward?.kind==='deal')info=['抽牌+1','护腕 · 回合抽牌 +1（本局）','抽牌 +1'];
    const service=run.serviceStatus(CrawlerDungeon.key(x,y));if(info&&service&&(!service.available||service.deferred)){info=[...info];info[1]+=' · '+(!service.available?tr('当前无法使用 · 新牌或扩槽后再来','Unavailable · return with new cards or sockets'):tr('已暂缓 · 牌组变化后再考虑','Deferred · reconsider after deck changes'));}
    return info?{mapText:CrawlerLocale.text(info[0]),label:CrawlerLocale.text(info[1]),viewText:CrawlerLocale.text(info[2]),type:o.type}:null;
  },roomAt:(x,y)=>{const r=CrawlerDungeon.roomAt(run.dungeon,x,y);return r?{...r,visualKey:r.type==='boss'?CrawlerThemes.get(run.floor).boss.visualKey:['elite','battle'].includes(r.type)?CrawlerThemes.get(run.floor).enemies[(x+y)%5].visualKey:undefined,name:CrawlerLocale.text(r.name),cleared:run.completed.includes(r.id)}:null;}};}
  function battleViewState(){
    const state=viewState(),c=(watching&&watchCamera)||run.battleCamera;
    if(c&&c.floor===run.floor&&c.room===run.current&&Number.isInteger(c.x)&&Number.isInteger(c.y)&&[0,1,2,3].includes(c.dir)&&CrawlerDungeon.passable(run.dungeon,c.x,c.y))return {...state,x:c.x,y:c.y,dir:c.dir};
    // Legacy saves have no entry camera. Stand one traversable tile back so a
    // wall immediately behind the encounter does not fill the entire screen.
    const dir=CrawlerDungeon.dirs[state.dir],x=state.x-dir.x,y=state.y-dir.y;
    return CrawlerDungeon.canTraverse(run.dungeon,state.x,state.y,x,y)?{...state,x,y}:state;
  }
  function expeditionSettings(){return run?.combatSettings?.()||Crawler.profiles[run?.profile||'demo'];}
  function bonusTiles(inBattle=false){
    const settings=inBattle?battle.settings:expeditionSettings(),stats=inBattle?battle.player:settings;
    const tiles=[
      ['might','icon-spinach',`${100+(stats.might||0)}%`,tr('力量','Might'),tr('伤害倍率；100%为基础值','Damage multiplier; 100% is the base')],
      ['amount','icon-duplicator',`+${stats.amount||0}`,tr('次数','Hits'),tr('每张攻击牌的额外攻击次数','Additional hits on attack cards')],
      ['growth','icon-draw',`${100+(stats.growth||0)}%`,tr('成长','Growth'),tr('获得经验的倍率','Experience gain multiplier')],
      ['mana','icon-tome',String(settings.startingMana),tr('法力','Mana'),tr('每回合起始法力，含角色与地图加成','Mana per turn, including character and map bonuses')],
      ['draw','icon-bracer',String(settings.dealCount),tr('抽牌','Draw'),tr('每回合抽牌请求量；手牌上限独立限制','Cards requested per turn; hand capacity is a separate limit')],
      ['limit','icon-bible',String(settings.handLimit),tr('容量','Limit'),tr('能够持有的手牌数量','Maximum cards held')]
    ];
    if((stats.luck||0)>0)tiles.push(['luck','icon-cloverPetal',String(stats.luck),tr('运气','Luck'),tr('本局累计运气加成','Luck gained during this descent')]);
    for(const [key,icon,zh,en]of [['area','icon-candelabrador','范围','Area'],['duration','icon-spellbinder','持续','Duration'],['recovery','icon-pummarola','战后回复','Recovery'],['greed','icon-stoneMask','贪婪','Greed'],['revivalStacks','icon-tirajisu','复活','Revives'],['revival','icon-tirajisu','复活充能','Revive charge'],['curse','icon-skull','诅咒','Curse']])if(stats[key]>0)tiles.push([key,icon,fmt(stats[key]),tr(zh,en),tr(zh+' +'+fmt(stats[key]),en+' +'+fmt(stats[key]))]);
    return tiles.map(([key,icon,value,label,tip])=>`<span class="bonus-tile" data-stat="${key}" title="${escape(tip)}">${svg(icon)}<b>${value}</b><small>${label}</small></span>`).join('');
  }
  function zoneStatus(){
    const d=run.dungeon,zones=d?.generation?.zones||[],zone=zones.find(z=>z.cells.some(p=>p.x===d.x&&p.y===d.y));
    if(!zones.length)return `<b>${tr('地牢探索','Dungeon')}</b><small>${tr('沿走廊寻找房间','Follow corridors to rooms')}</small>`;
    const names={service:tr('补给区','Supply area'),entry:tr('入口区','Entry area'),battle:tr('战斗区','Battle area'),boss:tr('守关区','Guardian area')};
    const index=zone?zones.indexOf(zone)+1:0,remaining=zone?(zone.eventIds||[]).filter(id=>!run.completed.includes(id)&&Object.values(d.rooms).some(r=>r.id===id&&['battle','elite','boss'].includes(r.type))).length:0;
    return `<b>${zone?names[zone.role]||names.battle:tr('连接走廊','Connecting passage')}${zone?' '+index:''}</b><small>${zone?(remaining?tr('剩余遭遇 '+remaining,'Encounters left: '+remaining):tr('可自由探索','Explore freely')):tr('通向下一个区域','To the next area')}</small>`;
  }
  function railStats(side){
    const settings=expeditionSettings();
    return side==='left'?`<aside class="explore-rail rail-left"><span class="rail-title">${tr('属性加成','Bonuses')}</span><div class="bonus-tiles">${bonusTiles()}</div><div class="rail-portrait">${portrait(run.character)}<small>${Crawler.characters?.[run.character]?.name||''}</small></div><div class="health-heart"><b>${run.health}</b><small>/ ${run.maxHealth}</small></div><button class="outline-button" data-run-action="deck">牌组 · ${run.deck.length}</button></aside>`:`<aside class="explore-rail rail-right"><span class="rail-title">本次探索</span><div class="stat-tiles"><span data-gold-target>◇<b>${run.gold}</b><small>金币</small></span><span>⚔<b>${run.stats.kills}</b><small>击败敌人</small></span></div><div class="area-status">${zoneStatus()}</div><div class="mana-orb"><b>${settings.startingMana}</b></div><p class="orb-caption">回合起始法力</p><p class="rail-hint">WASD 移动<br>Q / E 转向<br>碰撞破坏与拾取</p></aside>`;
  }
  function showMap(){const map=document.querySelector('.mini-map');if(!map)return;$('map-modal-content').innerHTML=map.outerHTML;$('map-dialog').showModal();}
  function cardColor(def){if(def.costType==='wild'&&(def.isPickup||def.cardType==='Void'))return '--card-tone:#254c88;--art-light:#bdcbd1;--art-dark:#627885;';if(def.cardType==='Special')return '--card-tone:#b88c2d;--art-light:#ffda45;--art-dark:#b98318;';const c=def.color;if(!c)return '';const rgb=[c.r,c.g,c.b].map(v=>Math.round(v<=1?v*255:v)).join(',');return `--card-tone:rgb(${rgb});--art-light:rgba(${rgb},.85);--art-dark:rgba(${rgb},.25);`;}
  function dungeonHTML(){
    const d=run.dungeon,here=CrawlerDungeon.roomAt(d),direction=CrawlerDungeon.dirs[d.dir],seen=new Set(d.seen),view=viewState(),knownItems=[];
    const walkCells=d.grid.flatMap((r,y)=>[...r].flatMap((v,x)=>v==='.'?[{x,y}]:[])),left=Math.max(0,Math.min(...walkCells.map(c=>c.x))-.5),top=Math.max(0,Math.min(...walkCells.map(c=>c.y))-.5),mapWidth=Math.max(...walkCells.map(c=>c.x))-left+1.5,mapHeight=Math.max(...walkCells.map(c=>c.y))-top+1.5;
    const cleared=here&&run.completed.includes(here.id);
    const standingService=here&&(here.type==='shop'||(here.type==='camp'&&!cleared));
    const interaction=CrawlerDungeon.interaction(d),obj=standingService?null:interaction?.object;
    const objectLabel=obj?({mansionDoor:obj?.locked?'迎战宅邸守卫':'进入宅邸',removal:'免费删牌',gargoyle:'打碎石像',manaCart:'打碎法力推车',bracerCart:'打碎护腕推车',barrel:'打碎木桶',crate:'打碎箱子',pickup:obj.reward?.kind==='card'?'拾取'+definition({key:obj.reward.key}).name:obj.reward?.kind==='mana'?'拾取法力强化':obj.reward?.kind==='deal'?'拾取护腕':obj.reward?.kind==='heal'?'拾取鸡肉':'拾取金币',shovel:'挖洞下层',hole:'洞口',gemchest:'打开宝石箱',gemhammer:'拾取宝石锤',gem:'拾取宝石'}[obj.type]):'';
    const canInteract=!!obj||here&&(here.type==='stairs'||here.type==='shop'||!cleared);
    let ahead='';
    for(let distance=1;distance<=4;distance++){
      const x=d.x+direction.x*distance,y=d.y+direction.y*distance;if(!CrawlerDungeon.canTraverse(d,x-direction.x,y-direction.y,x,y))break;
      const target=CrawlerDungeon.roomAt(d,x,y);if(target&&(!run.completed.includes(target.id)||['shop','stairs'].includes(target.type))){ahead=`前方 ${distance} 格：${target.name}。${target.type==='shop'?'走近商人所在格即可拜访。':target.type==='stairs'?'向前走入楼梯即可下层。':'走入该格将触发事件。'}`;break;}
    }
    const hint=obj?`${objectLabel}：${'向目标移动即可触发'}。${obj.type==='shovel'?'自动挖掘 3 次后进入下一层。':['pickup','gem','gemhammer'].includes(obj.type)?'拾取后不会再次出现。':obj.type==='gemchest'?'打开后查看获得的宝石。':['gargoyle','barrel','crate','manaCart','bracerCart'].includes(obj.type)?'破坏后还需拾取掉落。':''}`:here?(here.type==='stairs'?'向前移动进入下层':here.type==='shop'?'走出后再次走入可重访商人':cleared?(ahead||'此处已经清理，可以继续探索'):`你来到了${here.name}`):(ahead||'循着火光前行。走入敌人格子将开始战斗。');
    const zones=d.generation?.zones||[],zoneAt=new Map(zones.flatMap(z=>z.cells.map(p=>[CrawlerDungeon.key(p.x,p.y),z]))),zoneNames={battle:tr('战斗区','Battle area'),boss:tr('守关区','Guardian area'),service:tr('补给区','Supply area')};
    const map=d.grid.map((row,y)=>[...row].map((cell,x)=>{
      const k=CrawlerDungeon.key(x,y),zone=zoneAt.get(k),zoneLabel=zone?`${zoneNames[zone.role]||zoneNames.battle} ${zones.indexOf(zone)+1}`:'';
      const rawRoom=CrawlerDungeon.roomAt(d,x,y),info=view.objectInfo(x,y),done=rawRoom&&run.completed.includes(rawRoom.id),room=done&&rawRoom.type==='treasure'?null:rawRoom;
      const roomText=room?({battle:'遭遇',elite:'精英',boss:'守关',exit:'出口',shop:'商店',camp:'营地',treasure:'宝箱',stairs:'楼梯'}[room.type]):'';
      const destination=!!room&&!done&&['boss','exit'].includes(room.type);
      const symbol=info?({mansionDoor:'⌂',removal:'✂',gargoyle:'♜',manaCart:'M+',bracerCart:'D+',barrel:'▥',crate:'□',gemchest:'◆',gem:'◆',gemhammer:'⚒',shovel:'↧',hole:'↓',pickup:info.mapText}[info.type]||info.mapText):(done&&room&&room.type!=='shop'?'·':({battle:'☠',elite:'☠',boss:'♛',exit:'♛',shop:'▣',camp:'♧',treasure:'▰',stairs:'↓'}[room?.type]||'')),label=destination?tr('目的地 · ','Destination · ')+room.name:info?.label||(room?`${room.name}${done?' · 已完成':''}`:'');
      if(info)knownItems.push({x,y,...info});
      const walls=cell==='.'&&d.connections?CrawlerDungeon.dirs.map((v,i)=>CrawlerDungeon.passable(d,x+v.x,y+v.y)&&!CrawlerDungeon.canTraverse(d,x,y,x+v.x,y+v.y)?`<path d="${['M0 0 H24','M24 0 V24','M0 24 H24','M0 0 V24'][i]}" transform="translate(${x*24} ${y*24})" stroke="#937542" stroke-width="2"/>`:'').join(''):'';
      return `<g data-cell="${k}" class="map-cell${destination?' map-goal':''}${info?' map-item':''}" ${label?`role="img" tabindex="0" aria-label="${escape(label)}，坐标 ${x},${y}"`:''}><title>${escape(zoneLabel)} ${escape(label|| (cell==='#'?'墙壁':'通道'))} · ${x},${y}</title><rect x="${x*24}" y="${y*24}" width="24" height="24" fill="${cell==='#'?'#b69b63':zone?({service:'#eee0b3',battle:'#e4ce96',boss:'#d7b77a'}[zone.role]||'#ead9ad'):'#e9d7a7'}"/>${zone?CrawlerDungeon.dirs.map((v,i)=>zoneAt.get(CrawlerDungeon.key(x+v.x,y+v.y))!==zone?`<path class="zone-edge" d="${['M0 0 H24','M24 0 V24','M0 24 H24','M0 0 V24'][i]}" transform="translate(${x*24} ${y*24})" stroke="#aa8750" stroke-width="1"/>`:'').join(''):''}${walls}${destination?`<svg class="map-boss-crown" x="${x*24}" y="${y*24}" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use href="#map-destination-crown"/></svg>`:symbol?`<text x="${x*24+11.5}" y="${y*24+16}" text-anchor="middle" fill="${info?'#633c16':done?'#92815d':'#71502c'}" font-size="${String(symbol).length>2?7:15}">${escape(CrawlerLocale.text(symbol))}</text>`:''}</g>`;
    }).join('')).join('');
    const clearedCount=Object.values(d.rooms).filter(r=>run.completed.includes(r.id)).length,total=Object.keys(d.rooms).length;
    return `<div class="reference-exploration">${railStats('left')}<div class="library-stage"><div class="floor-track"><i style="width:${run.progressionVersion>=7?run.xp/run.xpRequired()*100:clearedCount/total*100}%"></i><span>${run.progressionVersion>=7?`经验 ${run.xp} / ${run.xpRequired()} · Lv.${run.level}`:`楼层清理 ${clearedCount} / ${total}`} · F${run.floor}</span></div><div class="dungeon-viewport"><canvas id="dungeon-canvas" width="480" height="300" role="img" aria-label="第一人称地牢，朝向${direction.name}，坐标${d.x},${d.y}"></canvas><div class="explore-hud"><span>${floorNames[run.floor-1]}</span><b>${direction.name} / ${['N','E','S','W'][d.dir]}</b><span>${d.x}, ${d.y}</span></div></div><p class="explore-message" role="status">${hint}</p><div class="exploration-dock"><div class="direction-deck"><div class="dungeon-controls"><button data-explore="turn:-1" aria-label="向左转 Q">↶<kbd>Q</kbd></button><button data-explore="walk:forward" aria-label="前进 W">↑<kbd>W</kbd></button><button data-explore="turn:1" aria-label="向右转 E">↷<kbd>E</kbd></button><button data-explore="walk:left" aria-label="向左平移 A">←<kbd>A</kbd></button><button data-explore="walk:back" aria-label="后退 S">↓<kbd>S</kbd></button><button data-explore="walk:right" aria-label="向右平移 D">→<kbd>D</kbd></button></div></div><aside class="parchment-map"><div class="panel-caption">全层地图 <span>${run.floor}/${run.totalFloors||3}</span><button class="map-expand" data-run-action="map">展开 M</button></div><div class="map-scroll"><svg class="mini-map" viewBox="${left*24} ${top*24} ${mapWidth*24} ${mapHeight*24}" role="img" aria-label="全层地图，无迷雾；物品直接标注，悬停或聚焦查看详情"><rect width="${d.grid[0].length*24}" height="${d.grid.length*24}" fill="#cfb77e"/>${map}<rect x="${d.x*24+1}" y="${d.y*24+1}" width="21" height="21" fill="none" stroke="#304d9d" stroke-width="2"/><g transform="translate(${d.x*24+12} ${d.y*24+12}) rotate(${d.dir*90})"><path d="M0 -8 L6 6 L0 3 L-6 6 Z" fill="#315bca"/></g></svg></div></aside></div>${knownItems.length?`<details class="map-items"><summary>地图物品 · ${knownItems.length}</summary><ul>${knownItems.map(item=>`<li><span>${escape(item.label)}</span><small>${item.x}, ${item.y}</small></li>`).join('')}</ul></details>`:''}</div>${railStats('right')}</div>`;

  }
  function supportText(def,mult=1){
    if(def.kind==='wild'||def.effectDescriptors?.some(e=>e.kind==='stat'||e.kind==='draw')){const lines=Crawler.effectsV10.descriptions(def,mult,CrawlerLocale.language==='en',{friendshipBonus:friendshipBonus(def),settings:wildSettings()});if(lines.length)return lines.join(' · ')+(def.destroyOnPlay?tr(' · 销毁',' · Destroy'):'');}
    if(def.kind==='character'){
      const en=CrawlerLocale.language==='en',labels={armor:['护甲','Armor'],experience:['经验','XP'],mana:['法力','Mana'],area:['范围','Area'],might:['力量','Might'],growth:['成长','Growth'],draw:['抽牌','Draw']},types={Attack:['攻击','Attack'],Special:['技能','Skill'],Mana:['法力','Mana'],Defense:['防御','Defense']};
      const f=def.firstEffect,r=def.reaction,amount=f.amount*(def.receivesComboMultiplier?mult:1);
      return `${labels[f.effect]?.[en?1:0]||f.effect} +${amount} · ${types[r.cardType]?.[en?1:0]||r.cardType} → ${labels[r.effect]?.[en?1:0]||r.effect} +${r.amount} (×${def.duration})`;
    }
    if(def.kind==='growth')return tr('经验成长 +'+(def.growth||0)+'%（本场）','XP growth +'+(def.growth||0)+'% (battle)');
    const n=def.kind==='mana'?def.mana: def.kind==='might'?def.might: def.kind==='amount'?def.amount:def.dealCountBoost;
    const amount=n*(def.receivesComboMultiplier?mult:1);
    return def.kind==='mana'?tr('法力 +','Mana +')+amount:def.kind==='might'?tr('力量 +','Might +')+amount+'%':def.kind==='amount'?tr('攻击次数 +','Shots +')+amount:def.kind==='deal'?tr('回合抽牌 +','Draw/turn +')+amount:tr('护甲 +','Armor +')+(def.armor||0)*(def.receivesComboMultiplier?mult:1);
  }
  function cardTile(card,action,label,disabled=false){
    card={...card,gemSlots:card.gemSlots??run?.slotUpgrades?.[card.key]??gems.slotCount(card)};
    const isReward=action&&/^(levelcard|bosscard|reward|buy):/.test(action),hints=isReward?run.rewardEvolutionHints(card):[],status=hints[0]?.status;
    const hintMarkup=hints.map(h=>{const result=tr(h.resultName,h.resultEnglish),parts=h.components.map(c=>`${escape(tr(c.name,c.english))}${c.isOffer?tr('（本牌）',' (this card)'):c.missing?tr('（缺少）',' (missing)'):''}`).join(' + ');
      const title=h.status==='ready'?tr('◆ 获得后可合成','◆ Recipe ready after picking'):h.status==='needsSocket'?tr('◇ 材料齐备 · 需要空槽','◇ Materials ready · needs a socket'):tr('◇ 合成材料','◇ Evolution ingredient');
      const detail=h.status==='ready'?tr('材料齐备；进化不需要空宝石槽。','Ingredients ready; evolution needs no empty socket.'):h.status==='needsSocket'?(h.slotIssue==='incompatible'?tr('主武器当前宝石与进化不兼容。','The weapon’s current gems cannot evolve.'):tr('先为主武器留出一个进化宝石槽。','The weapon needs an empty evolution socket.')):tr('还缺：','Still needed: ')+h.missingCards.map(c=>tr(c.name,c.english)).join('、');
      const timing=h.status==='ready'?(run.phase==='bosscard'?tr('本次选牌会用掉奖励；下次守关奖励可合成。','Picking a card uses this reward. Evolve at a later guardian.'):tr('在守关奖励中选择「进化」。','Choose Evolve at a guardian reward.')):'';
      return `<div class="evolution-hint ${h.status}"><strong>${title}</strong><b>${escape(result)}</b><p>${parts}</p><small>${escape(detail)}${timing?'<br>'+escape(timing):''}</small></div>`;}).join('');
    return `<div class="card-offer ${disabled?'unavailable':''} ${status?'evolution-'+status:''}">${cardFace(card)}${action?`<button class="outline-button card-action" data-run-action="${action}" ${disabled?'disabled':''}>${label}</button>`:''}${hintMarkup}</div>`;
  }
  function cardRows(mode){
    return `<div class="card-gallery">${run.deck.map(c=>{
      const d=definition(c),max=c.level>=2, price=run.phase==='shop'?run.upgradeCost(c.id):0;
      const next=definition({...c,level:Math.min(2,c.level+1)});
      const details=d.kind==='attack'?`${d.baseDamage}×${d.baseAmount} → ${next.baseDamage}×${next.baseAmount}`:d.kind==='draw'?`抽${d.drawCount} → 抽${next.drawCount}`:`护甲${d.armor} → ${next.armor}`;
      const label=mode==='remove'?tr('免费移除此牌','Remove for free'):max?'已满级':!run.canUpgrade(c)?'此档无可用强化':`升级${price?' · '+price+'金币':' · 免费'}`;
      const disabled=mode==='remove'?(run.phase!=='removal'||run.deck.length<=2||d.kind==='character'):(max||!run.canUpgrade(c)||run.gold<price);
      return cardTile(c,mode+':'+c.id,label,disabled);
    }).join('')}</div>`;
  }
  function roomBody(){
    const room=run.currentRoom();
    if(run.phase==='removal')return `<div class="room-heading"><span class="eyebrow">SHRINE OF FORGETTING</span><h2>${tr('遗忘祭坛','Shrine of forgetting')}</h2><p>${tr('本层可以免费移除一张牌。角色卡不能删除；至少保留两张牌。可以暂时离开，之后再来选择。','Remove one card for free on this floor. Keep your character and at least two cards. You can leave and return before using this chance.')}</p></div>${cardRows('remove')}<button class="outline-button room-exit" data-run-action="removalcancel">${tr('暂时离开，保留机会','Leave; keep this chance')}</button>`;
    if(run.phase==='bossreward')return `<div class="room-heading"><span class="eyebrow">GUARDIAN / CHOOSE A REWARD</span><h2>${tr('守关胜利 · 三选一','Guardian defeated · Choose one')}</h2><p>${tr('进化武器、获得新牌或镶嵌宝石。查看候选后仍可返回；领取其中一种后继续探索。','Evolve a weapon, gain a card, or socket a gem. You may inspect each option before claiming one reward.')}</p></div><div class="boss-reward-grid"><button class="boss-reward-option" data-run-action="bossreward:evolution" ${run.evolutionChoices().length?'':'disabled'}>${svg('icon-whip')}<strong>${tr('卡牌进化','Evolve a weapon')}</strong><span>${tr('消耗配方材料，获得强力武器','Combine matching cards into an evolved weapon')}</span><small>${run.evolutionChoices().length?tr('可合成 '+run.evolutionChoices().length+' 组','Available recipes: '+run.evolutionChoices().length):tr('缺少配方材料','Needs matching ingredients')}</small></button><button class="boss-reward-option" data-run-action="bossreward:card">${svg('icon-draw')}<strong>${tr('选择新牌','Choose a card')}</strong><span>${tr('从三张候选中选一张加入牌组','Add one of three cards to your deck')}</span></button><button class="boss-reward-option" data-run-action="bossreward:gem" ${run.canChooseBossGem()?'':'disabled'}>${svg('gem')}<strong>${tr('镶嵌宝石','Socket a gem')}</strong><span>${run.canChooseBossGem()?tr('选择一颗宝石，装入有空槽的牌','Choose a gem and a card with a compatible empty socket'):tr('无兼容卡牌，请选择其他奖励','No compatible cards; choose another reward')}</span></button></div>`;
    if(run.phase==='bosscard')return `<div class="room-heading"><span class="eyebrow">GUARDIAN / NEW CARD</span><h2>${tr('守关奖励 · 选择新牌','Guardian reward · Choose a card')}</h2></div><div class="offer-grid">${run.bossReward.cards.map((c,i)=>cardTile(c,'bosscard:'+i,tr('加入牌组','Add to deck'))).join('')}</div><button class="quiet-button room-exit" data-run-action="bossback">${tr('返回奖励选择','Back to rewards')} →</button>`;
    if(run.phase==='evolution')return `<div class="room-heading"><span class="eyebrow">EVOLUTION / RECIPE</span><h2>${tr('卡牌进化','Card evolution')}</h2><p>${tr('选择一组材料合成强力武器。消耗所选主武器和辅助卡，继承主武器的全部宝石与槽位，满槽或零槽也能合成；进化不占槽位。','Choose a recipe to create an evolved weapon. Both selected cards are consumed. All weapon gems and sockets carry over, even with full or zero sockets. Evolution occupies no socket.')}</p><p>${tr('每层守关后提供一次机会是本原型的流程安排。','One opportunity after each floor guardian is a prototype pacing choice.')}</p></div>${run.evolution.choices.length?run.evolution.choices.map(c=>`<article class="evolution-recipe"><div class="recipe-card-flow">${c.components.map((item,i)=>`${i?'<span class="recipe-symbol">+</span>':''}${cardTile(run.deck.find(d=>d.id===item.id)||item)}`).join('')}<span class="recipe-symbol">→</span>${cardTile({key:c.resultKey,level:0,gemSlots:c.gemSlots,gems:c.inheritedGems,evolutionRecipe:c.recipeId,gemRulesVersion:run.gemRulesVersion})}</div><p>${tr('主武器槽位','Weapon sockets')} ${c.gemSlots} · ${tr('继承宝石','Inherited gems')} ${c.inheritedGems.length}${c.lostSupportGems?.length?` · ${tr('辅助卡上的宝石将丢失','Support gems lost')}: ${c.lostSupportGems.map(k=>gems.catalog.gems[k]?.name||k).join(', ')}`:''}</p><button class="primary-button" data-run-action="evolve:${c.id}">${tr('消耗材料并进化','Consume & evolve')}</button></article>`).join(''):`<p class="object-status">${tr('当前没有满足配方的组合。可在后续升级或商店收集配套卡牌。','No matching recipe ingredients. Collect matching cards through level-ups and shops.')}</p>`}<button class="quiet-button room-exit" data-run-action="skipevolution">${run.bossReward?tr('返回奖励选择','Back to rewards'):tr('跳过，继续探索','Skip and continue')} →</button>`;
    if(run.phase==='levelup')return `<div class="room-heading"><span class="eyebrow">EXPERIENCE / LEVEL UP</span><h2>角色升级 · Lv.${run.levelChoice.level}</h2><p>积累经验触发了这次升级。选择一张基础卡。玩家回合有空位时直接入手，本回合可免费打出一次；手满时进入抽牌堆，仍按原费用。随后继续战斗。</p><p>剩余经验 ${run.xp} / ${run.xpRequired()} · ${run.profile==='demo'?'演示模式：开放全部已实现卡牌':'资源基础模式：默认解锁卡池'}</p></div><div class="offer-grid">${run.levelChoice.choices.map((c,i)=>cardTile(c,'levelcard:'+i,'选择此牌')).join('')}</div>`;
    if(run.phase==='gem')return gemRoom();
    if(run.phase==='digging')return `<div class="room-heading"><span class="eyebrow">DIGGING / DESCENT</span><h2>正在挖开下层入口</h2><p>铲子会自动完成三次挖掘。当前已获得 ${run.dig.paid} / ${run.dig.bonus} 金币。</p></div><div class="digging-art">${svg('shovel')}</div><div class="dig-progress" role="progressbar" aria-label="挖掘进度" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${run.dig.steps}"><i style="width:${run.dig.steps/3*100}%"></i></div><p class="object-status">${run.dig.steps} / 3 · 挖掘期间不能移动，刷新会接续剩余步骤。</p>`;
    if(run.phase==='reward')return `<div class="room-heading"><span class="eyebrow">VICTORY / SPOILS</span><h2>战斗获胜，收下战利品。</h2><p>已获得 <b>${run.reward.gold} 金币</b>。选择一张卡加入牌组，也可以跳过。</p></div><div class="offer-grid">${run.reward.choices.map((c,i)=>cardTile(c,'reward:'+i,'选择这张牌')).join('')}</div><button class="quiet-button room-exit" data-run-action="reward:-1">跳过卡牌奖励 →</button>`;
    if(run.phase==='shop')return `<div class="room-heading"><div class="shop-heading-bar"><div class="shop-heading-copy"><span class="eyebrow">THE WANDERING MERCHANT</span><div class="merchant-heading">${svg('shop','merchant-portrait')}<div><h2>${tr('流浪商人的小铺','The wandering merchant')}</h2><span>${tr('随机商品 · 宝石工坊','Random stock · Gem workshop')}</span></div></div></div><button class="primary-button shop-exit" data-run-action="leave">${tr('离开商店，继续探索','Leave shop, continue exploring')} →</button></div></div><div class="offer-grid">${run.shop.offers.map(o=>cardTile(o,'buy:'+o.id,o.sold?'已售出':`购买 · ${o.price}金币`,o.sold||run.gold<o.price)).join('')}</div><div class="shop-refresh"><button class="outline-button" data-run-action="refreshshop" ${run.gold<run.shopRefreshCost()?'disabled':''}>${tr('刷新商品','Refresh stock')} · ${run.shopRefreshCost()} ${tr('金币','gold')}</button></div><div class="service-row"><div><b>治疗药剂</b><p>恢复18生命 · 每店一次</p></div><button class="outline-button" data-run-action="heal" ${run.shop.healed||run.gold<25||run.health>=run.maxHealth?'disabled':''}>${run.shop.healed?'已售出':run.health>=run.maxHealth?'生命已满':'治疗 · 25金币'}</button></div>${run.progressionVersion>=7?'':`<details class="service-details"><summary>旧版升卡服务</summary>${cardRows('upgrade')}</details>`}<section class="shop-workshop"><div class="workshop-heading"><h3>${tr('宝石工坊 · 扩充槽位','Gem workshop · Expand sockets')}</h3><span>${run.gold} ${tr('金币','gold')}</span></div>${socketRows()}</section>`;
    if(run.phase==='camp')return `<div class="room-heading"><span class="eyebrow">A MOMENT OF RESPITE</span><h2>火光里的一次喘息</h2><p>在这里休息恢复生命，完成后继续前行。</p></div><div class="camp-fire">${svg('camp')}</div><div class="service-row"><div><b>靠近篝火休息</b><p>恢复最多18生命，当前 ${run.health} / ${run.maxHealth}</p></div><button class="primary-button" data-run-action="rest" ${run.health>=run.maxHealth?'disabled':''}>${run.health>=run.maxHealth?'生命已满':'休息恢复'}</button></div>${run.progressionVersion>=7?'':`<details class="service-details"><summary>旧版免费升卡</summary>${cardRows('upgrade')}</details>`}<button class="quiet-button room-exit" data-run-action="leave">不作停留，继续前行 →</button>`;
    if(run.phase==='treasure')return `<p>${tr('撞开宝箱露出100金币，再向前一步拾取。','Bump to open a chest, then step forward again to collect its 100 gold.')}</p>`;
    if(run.phase==='gate')return `<div class="room-heading"><span class="eyebrow">THE WAY IS OPEN</span><h2>通往第 ${run.floor+1} 层</h2><p>下一层：${floorNames[run.floor]}。生命、金币和强化牌会保留，在楼梯处恢复最多8点生命。</p></div><div class="gate-art">${svg('stairs')}</div><button class="primary-button room-exit" data-run-action="descend">进入第 ${run.floor+1} 层 →</button>`;
    const won=run.phase==='won';
    return `<div class="room-heading ending"><span class="eyebrow">${won?'THE DAWN RETURNS':'THE LIGHT FADES'}</span><h2>${won?'穿过永夜，迎来黎明。':'这次探索，止步于此。'}</h2><p>${won?`你击败了最终守门者，完成 ${run.totalFloors||3} 层地窖。`:'生命已耗尽。新的出牌顺序和路线选择，也许能改变结局。'}</p></div><div class="run-score"><div><b>${run.floor}/${run.totalFloors||3}</b><span>到达层数</span></div><div><b>${run.stats.wins}</b><span>战斗胜利</span></div><div><b>${run.stats.turns}</b><span>战斗回合</span></div><div><b>${run.level||1}</b><span>角色等级</span></div></div><button class="primary-button room-exit" data-run-action="new">开始新的探索 →</button>`;
  }
  function renderRun(){
    if(homeOpen||!run){renderHome();return;}
    if(!run){$('run-screen').innerHTML=`<div class="opening-screen"><div><span class="eyebrow">DUSKVAULT / THE FULL JOURNEY</span><h1>走入地窖。<br>带着你的牌，走到最后。</h1><p>五层像素地牢，第一人称逐格探索。穿过走廊、收集战利品、遇见商人，<br>将一副普通的牌，磨成穿过永夜的武器。</p><button class="primary-button" data-run-action="new">开始探索 →</button><small>${escape(saveError||'本地自动保存 · 击杀经验升级 · 宝石与成长拾取')}</small></div><div class="opening-emblem">${svg('enemy-lion','opening-lion')}<span>V</span></div></div><div class="journey-features"><div><b>01 / 走入地牢</b><p>转向、移动、全层地图</p></div><div><b>02 / 打磨牌组</b><p>三选一卡、升级与精简</p></div><div><b>03 / 抵达终点</b><p>击败五层守关者，带回黎明</p></div></div>`;return;}
    if(run.phase==='map'&&run.dungeon){
      $('run-screen').innerHTML=`<div class="expedition-heading"><div><span class="eyebrow">DUSKVAULT / DUNGEON EXPLORATION</span><h1>${floorNames[run.floor-1]}</h1></div><span class="floor-progress">${run.floor} / ${run.totalFloors||3}</span></div>${dungeonHTML()}`;
      DungeonView.draw($('dungeon-canvas'),viewState());return;
    }
    $('run-screen').innerHTML=`<div class="expedition-heading"><div><span class="eyebrow">FLOOR ${String(run.floor).padStart(2,'0')} / ${run.totalFloors||3} DESCENTS</span><h1>${floorNames[run.floor-1]}</h1></div><span class="floor-progress">${Array.from({length:run.totalFloors||3},(_,i)=>i+1).map(f=>`<i class="${f<=run.floor?'lit':''}">${f}</i>`).join('<em>—</em>')}</span></div><div class="exploration-layout"><aside class="journey-sidebar panel"><div class="panel-caption">守夜人的行囊</div><div class="journey-vitals"><small>生命</small><strong>${run.health} <span>/ ${run.maxHealth}</span></strong><div class="bar health-bar"><i style="width:${run.health/run.maxHealth*100}%"></i></div><div class="journey-currency"><span>金币 <b>${run.gold}</b></span><span>牌组 <b>${run.deck.length}</b></span></div></div><button class="outline-button" data-run-action="deck">查看完整牌组</button><div class="journey-journal"><small>探索札记</small>${run.history.slice(-6).reverse().map(e=>`<p>${escape(e.text)}</p>`).join('')}</div><div class="sidebar-note">${escape(run.seed)}<br>${Crawler.profiles[run.profile].name}</div></aside><section class="journey-room panel">${roomBody()}</section></div>`;
  }
  function renderHome(){
    const chars=[{key:'antonio',name:tr('安东尼奥','Antonio'),tag:tr('鞭击与力量','WHIP & MIGHT'),text:tr('生命 +10。角色卡先提供护甲；后续攻击卡触发力量增长，最多5次。','+10 health. His character card grants armor; the next five Attack cards build Might.'),deck:tr('角色卡 ×1 · 鞭子 ×2 · 护甲 ×1 · 菠菜 ×1','Character ×1 · Whip ×2 · Armor ×1 · Spinach ×1')},{key:'imelda',name:tr('伊梅尔达','Imelda'),tag:tr('法杖与成长','WAND & GROWTH'),text:tr('起始法力 +1，经验成长 +20%。角色卡提供经验，辅助牌继续提高成长。','+1 starting mana, +20% XP growth. Her character card grants XP; Special cards build Growth.'),deck:tr('角色卡 ×1 · 魔杖 ×2 · 护甲 ×1 · 吸引法球 ×1','Character ×1 · Wand ×2 · Armor ×1 · Attractorb ×1')}];
    for(const c of Object.values(CharactersV14.characters)){const m=c.menu;chars.push({key:c.key,name:tr(c.name,c.english),tag:tr(m.tag,m.tagEnglish),text:tr(m.description,m.descriptionEnglish),deck:tr(m.deckLabel,m.deckLabelEnglish)});}
    $('run-screen').innerHTML=`<section class="start-screen"><div class="start-heading"><span class="eyebrow">DUSKVAULT · A CARD DUNGEON</span><h1>${tr('暮影地窖','DUSKVAULT')}</h1><p>${tr('选择探索者，带着专属牌组进入地牢。','Choose your crawler. Enter the dungeon with their own deck.')}</p></div><div class="character-grid">${chars.map(c=>`<button class="character-choice ${selectedCharacter===c.key?'selected':''}" data-character="${c.key}" aria-pressed="${selectedCharacter===c.key}">${portrait(c.key)}<h2>${c.name}</h2><small>${c.tag}</small><p>${c.text}</p><div class="starter-list">${c.deck}</div></button>`).join('')}</div><div class="start-options"><label>${tr('卡池','Card pool')}<select id="home-profile"><option value="demo">${tr('扩展 · 全部已实现卡牌','Expanded · all implemented cards')}</option><option value="base">${tr('原版初始解锁池','Original starter unlocks')}</option></select></label><label>${tr('地图种子（可选）','Map seed (optional)')}<input id="home-seed" value="" placeholder="${tr('留空，每次开局自动随机','Leave blank for a new random map')}" maxlength="80" autocomplete="off"></label></div><label class="wild-arcana-option"><input id="home-wild-strength" type="checkbox" checked> ${tr('奥秘 · 万能增幅：拾取万能牌的数值效果参与连击','Arcana · Wild Strength: pickup Wild effects scale with combos')}</label><div class="start-actions"><button class="primary-button" data-run-action="start">${TutorialUI.completed()?tr('开始探索','Begin descent'):tr('开始教学','Begin tutorial')} →</button>${TutorialUI.completed()?`<button class="outline-button" data-run-action="tutorial">${tr('重玩教学','Play tutorial')}</button>`:''}${run?`<button class="outline-button" data-run-action="continue">${run.tutorial?tr('继续教学','Resume tutorial'):tr('继续存档','Continue')+' · F'+run.floor+'/'+(run.totalFloors||3)}</button>`:''}</div><p class="start-note">${tr('击杀获得经验 · 升级选卡 · 宝石镶嵌 · 配方进化','Kill XP · Level-up choices · Gem sockets · Recipe evolution')}<br>${run?tr('开始新探索会替换当前存档。旧版存档保持原来的层数；新开局启用五层与扩展系统。','Starting a new descent replaces your current save. Old saves keep their original length; new descents use five floors and the expanded systems.'):tr('本地自动保存。','Saved automatically on this device.')}</p></section>`;
  }
  async function finishTutorial(){
    const version=epoch,options=run.tutorial.options;
    await TutorialUI.depart();
    if(version!==epoch){await TutorialUI.arrive();tutorialTransition=false;return;}
    run=new Run(options);battle=null;lastLogId=0;if(!testingTutorial)TutorialUI.mark();persist();render();
    await TutorialUI.arrive();tutorialTransition=false;busy=false;render();
  }
  function render(){
    let recoveryNotice=null;
    if(!watching&&!homeOpen)run?.syncTutorial?.();
    if(!watching&&!homeOpen&&run?.phase==='camp'&&run.progressionVersion>=7){const result=run.rest();persist();toast(result.notice);}
    if(!watching&&!homeOpen&&!battleVisual&&run?.syncExperience?.())persist();
    if(!watching&&!homeOpen&&!battleVisual){const historyStart=run?.history.length||0;if(run?.settleBattle()){recoveryNotice=run.history.slice(historyStart).find(e=>e.type==='recovery');persist();lastLogId=0;}}
    if(!watching&&!homeOpen&&run?.tutorial?.stage==='complete'&&!tutorialTransition){tutorialTransition=true;busy=true;queueMicrotask(finishTutorial);}
    battle=run?.battle||null;
    document.body.dataset.screen=homeOpen?'home':run?.phase||'home';
    const inBattle=!homeOpen&&run?.phase==='battle';$('combat-screen').hidden=!inBattle;$('run-screen').hidden=inBattle;$('run-bar').hidden=!run||homeOpen;
    if(run){$('journey-label').textContent=`第 ${run.floor} / ${run.totalFloors||3} 层 · ${floorNames[run.floor-1]}${run.phase==='levelup'?' / 角色升级':run.phase==='gem'?' / 宝石箱':run.phase!=='map'&&run.currentRoom()?' / '+run.currentRoom().name:''}`;$('journey-health').textContent=`♥ ${inBattle?battle.player.health:run.health} / ${inBattle?battle.player.maxHealth:run.maxHealth}`;$('journey-gold').textContent=`◇ ${run.gold} 金币`;$('save-status').textContent=testingTutorial?tr('教学预览 · 不保存','Tutorial preview · not saved'):watching?tr('AI 观战 · 不保存','AI spectator · not saved'):saveError||'已自动保存';}
    if(inBattle){if(battle.phase!=='player')castQueue=[];renderBattle();$('result-panel').hidden=true;document.querySelector('.battle-heading h1').textContent=run.currentRoom().name;}
    else {castQueue=[];cardCasting=false;PileFX.leave();renderRun();}
    if(run?.tutorial&&!homeOpen)$('journey-label').textContent=tr('教学 · 花园小径','Tutorial · Garden Path');
    renderDeveloper();CrawlerLocale.translate();scheduleAutoEnd();
    const screen=homeOpen?'home':run?.phase||'home';if(lastScreen&&screen!==lastScreen)window.scrollTo(0,0);lastScreen=screen;
    TutorialUI.update(run,{hidden:homeOpen||watching,busy});
    if(recoveryNotice){const n=recoveryNotice;toast(n.amount?tr(`战后恢复 +${fmt(n.amount)} 生命（${fmt(n.before)} → ${fmt(n.after)}）`,`After-victory heal +${fmt(n.amount)} HP (${fmt(n.before)} → ${fmt(n.after)})`):tr('战后恢复已结算：生命已满','After-victory healing: already at full HP'));if(n.amount){const target=document.querySelector('.health-heart')||$('journey-health'),point=LootFX.target(target);lootReadout('+'+fmt(n.amount)+' HP',target,'heal');PixelVFX.emit('holy/heal',point.x,point.y,{scale:.6,duration:650});GameAudio.play('pickup');}}
  }
  function showDeck(){
    if(run?.phase==='digging'){toast('挖掘中，请稍候');return;}
    if(!run)return;$('pile-title').textContent=`探索牌组 · ${run.deck.length} 张`;$('pile-subtitle').textContent='宝石只作用于镶嵌的那张牌；扩槽作用于同名卡。升级获得的卡牌立即加入当前战斗。';
    $('pile-content').innerHTML=`<button class="outline-button recipe-index-button" id="recipe-index-button">${tr('查看合成配方','View evolution recipes')}</button><div class="card-gallery">${run.deck.map(c=>cardTile(c)).join('')}</div>`;$('recipe-index-button').onclick=showRecipes;$('pile-dialog').showModal();
  }
  function showRecipes(){
    const recipes=Crawler.evolutionRecipes.filter(r=>r.runtimeEnabled&&!r.sourceDisabled);
    $('pile-title').textContent=tr('合成配方 · '+recipes.length+'组','Evolution recipes · '+recipes.length);
    $('pile-subtitle').textContent=tr('消耗配方材料，继承主武器全部宝石与槽位；不需要空槽，进化不占槽位。','Consume matching ingredients and inherit all weapon gems and sockets. No empty socket is required; evolution occupies no socket.');
    $('pile-content').innerHTML=`<div class="recipe-index">${recipes.map(r=>{const names=r.componentGroups.map(g=>{const c=Object.values(catalog.cards).find(c=>c.group===g);return c?tr(c.name,c.english):g.replace('CardGroup_','');});return `<article class="recipe-index-row"><div>${svg('icon-'+r.resultKey)}<strong>${tr(catalog.cards[r.resultKey].name,catalog.cards[r.resultKey].english)}</strong></div><p>${names.map(escape).join(' + ')}</p><small>${tr('可在守关奖励中进化','Evolve after a guardian')}</small></article>`;}).join('')}</div>`;
  }
  $('deck-button').addEventListener('click',showDeck);
  $('run-screen').addEventListener('click',e=>{const character=e.target.closest('[data-character]');if(character){const profile=$('home-profile')?.value,seed=$('home-seed')?.value,wild=$('home-wild-strength')?.checked;selectedCharacter=character.dataset.character;render();if(profile)$('home-profile').value=profile;if(seed)$('home-seed').value=seed;if(wild!==undefined)$('home-wild-strength').checked=wild;return;}const button=e.target.closest('[data-explore]');if(button&&!button.disabled)exploreAction(button.dataset.explore);});
  $('run-screen').addEventListener('click',e=>{
    const button=e.target.closest('[data-run-action]');if(!button||button.disabled||busy)return;
    const [action,...parts]=button.dataset.runAction.split(':'),arg=parts.join(':');
    if(action==='map'){showMap();return;}
    if(action==='tutorial'){restart($('home-profile').value,$('home-seed').value.trim(),selectedCharacter,$('home-wild-strength')?.checked!==false,true);return;}
    if(action==='start'){restart($('home-profile').value,$('home-seed').value.trim(),selectedCharacter,$('home-wild-strength')?.checked!==false);return;}
    if(action==='continue'){homeOpen=false;render();if(run?.phase==='battle'&&battle.phase==='enemy')pumpEnemies();else if(run?.phase==='digging')pumpDig();return;}
    if(action==='new'){openRestart();return;}if(action==='deck'){showDeck();return;}
    if(run?.allowTutorial&&!run.allowTutorial(action,['buy','slot','remove'].includes(action)?Number(arg):arg))return;
    let result=true;
    if(action==='bossreward')result=run.chooseBossReward(arg);
    else if(action==='bosscard')result=run.claimBossCard(Number(arg));
    else if(action==='bossback')result=run.returnToBossReward();
    else if(action==='evolve')result=run.fuse(arg);
    else if(action==='skipevolution')result=run.skipEvolution();
    else if(action==='enter'){result=run.enter(arg);lastLogId=0;}
    else if(action==='removalcancel')result={ok:run.cancelRemoval()};
    else if(action==='refreshshop')result=run.refreshShop();
    else if(action==='gem')result=run.chooseGem(arg);
    else if(action==='socket'){const card=run.deck.find(c=>c.id===Number(arg)),gem=run.gemChoice?.selected;result=run.socketGem(Number(arg));if(result.ok)toast(tr('镶嵌完成：','Gem attached: ')+tr(gems.catalog.gems[gem].name,gems.catalog.gems[gem].english)+' → '+tr(definition(card).name,definition(card).english));}
    else if(action==='gemcancel')result=run.cancelGem();
    else if(action==='slot')result=run.addGemSlot(Number(arg));
    else if(action==='levelcard')result=run.chooseLevelCard(Number(arg));
    else if(action==='reward')result=run.claimReward(Number(arg));
    else if(action==='buy')result=run.buy(Number(arg));
    else if(action==='heal')result=run.buyHeal();
    else if(action==='upgrade')result=run.upgrade(Number(arg));
    else if(action==='remove')result=run.removeCard(Number(arg));
    else if(action==='rest')result=run.rest();
    else if(action==='treasure')result=run.openTreasure(arg);
    else if(action==='leave')result=run.leave();
    else if(action==='descend')result=run.nextFloor();
    if(result?.ok===false){toast(result.reason);return;}
    persist();render();
  });
  function cancelWatchMotion(){epoch++;busy=false;cardCasting=false;enemyTurnToken=null;castQueue=[];clearBattleMotion();PileFX.leave();}
  function installWatchSnapshot(snapshot){const restored=Run.restore(snapshot);if(run?.floor===restored.floor&&run.seed===restored.seed&&JSON.stringify(run.dungeon.grid)===JSON.stringify(restored.dungeon.grid)){restored.dungeon.grid=run.dungeon.grid;if(JSON.stringify(run.dungeon.generation)===JSON.stringify(restored.dungeon.generation))restored.dungeon.generation=run.dungeon.generation;}if(battle&&restored.battle&&battle.seed===restored.battle.seed&&run?.current===restored.current&&run?.floor===restored.floor){Object.assign(battle,restored.battle);restored.battle=battle;}run=restored;battle=run.battle;homeOpen=false;if(watchCamera&&(watchCamera.floor!==run.floor||watchCamera.room!==run.current))watchCamera=null;}
  function watchIdle(version){return new Promise(resolve=>{const check=()=>{if(version!==epoch||!busy&&!enemyTurnToken)resolve();else requestAnimationFrame(check);};requestAnimationFrame(check);});}
  function watchPause(ms,version){return new Promise(resolve=>{const begin=performance.now();const next=()=>{if(version!==epoch||performance.now()-begin>=ms)resolve();else requestAnimationFrame(next);};requestAnimationFrame(next);});}
  async function animateWatchFrame(item,version,rate){
    if(version!==epoch||!watching)return;
    const oldBattle=battle,oldRun=run,from={x:run.dungeon.x,y:run.dungeon.y,dir:run.dungeon.dir},canvas=$('dungeon-canvas');
    const method=item.method,arg=item.args?.[0],events=item.events||[],delay=ms=>watchPause(ms/rate,version);
    if(method==='play'&&oldBattle){
      const card=oldBattle.piles.hand.find(c=>c.id===arg);if(!card){installWatchSnapshot(item.snapshot);render();return;}
      const def=definition(card),preview=item.preview||oldBattle.cardPreview(card),before=JSON.parse(JSON.stringify(oldBattle.enemies));
      const el=document.querySelector('[data-card="'+arg+'"]');el?.classList.add('ai-selected');await delay(220);if(version!==epoch)return;
      const source=PileFX.capture(el);installWatchSnapshot(item.snapshot);
      animatePlayedCard({card,def,preview,before,source,events});await watchIdle(version);return;
    }
    if(method==='beginEnemyTurn'){
      const hand=PileFX.hand();installWatchSnapshot(item.snapshot);PileFX.discardHand(hand,battle);BossUI.effects(events);render();await delay(240);return;
    }
    if(method==='resolveNextEnemy'&&oldBattle){
      const actor=oldBattle.enemies.find(e=>e.id===oldBattle.enemyQueue[0]),origins=enemyOrigins();
      const visual={enemyTurn:true,enemies:JSON.parse(JSON.stringify(oldBattle.enemies)),player:{...oldBattle.player},target:oldBattle.target,logId:oldBattle.eventId};
      installWatchSnapshot(item.snapshot);battleVisual=visual;busy=true;render();
      await animateEnemyResolution(events,actor,visual,version,origins);if(version===epoch){busy=false;render();}return;
    }
    const selectors={chooseLevelCard:'levelcard',claimBossCard:'bosscard',claimReward:'reward',chooseBossReward:'bossreward',fuse:'evolve',chooseGem:'gem',socketGem:'socket',buy:'buy',addGemSlot:'slot',removeCard:'remove',refreshShop:'refreshshop',buyHeal:'heal',leave:'leave',rest:'rest'};
    if(selectors[method]){const action=selectors[method]+(arg===undefined?'':':'+arg),el=[...document.querySelectorAll('[data-run-action]')].find(e=>e.dataset.runAction===action);el?.classList.add('ai-selected');await delay(320);if(version!==epoch)return;}
    installWatchSnapshot(item.snapshot);
    if(['walk','turn','useObject','interact'].includes(method)&&oldRun.phase==='map'){
      const result=item.result||{};
      if(result.feedback){animateExplorationLoot(result,from,canvas);await watchIdle(version);return;}
      if(run.phase==='battle'&&canvas){
        const facing=CrawlerDungeon.dirs.findIndex(v=>from.x+v.x===run.dungeon.x&&from.y+v.y===run.dungeon.y),house=run.currentRoom()?.type==='boss'?CrawlerDungeon.landmark(run.dungeon):null;
        watchCamera={...from,dir:house?.dir??(facing<0?from.dir:facing),floor:run.floor,room:run.current};
        await enterBattleView(canvas);return;
      }
      if(canvas&&run.phase==='map'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        const to={x:run.dungeon.x,y:run.dungeon.y,dir:method==='turn'?from.dir+Number(arg):run.dungeon.dir},begin=performance.now(),duration=210/rate;
        await new Promise(resolve=>{const draw=now=>{if(version!==epoch)return resolve();const t=Math.min(1,(now-begin)/duration),u=t*t*(3-2*t);DungeonView.draw(canvas,{...viewState(),x:from.x+(to.x-from.x)*u,y:from.y+(to.y-from.y)*u,dir:from.dir+(to.dir-from.dir)*u});if(t<1)requestAnimationFrame(draw);else resolve();};requestAnimationFrame(draw);});
        if(version!==epoch)return;
      }
      if(result.bump&&canvas)PixelVFX.wall(canvas);
    }
    render();if(selectors[method]||oldRun.phase!==run.phase)await delay(220);
  }
  TutorialUI.attach({skip(){if(!run?.tutorial)return;const o=run.tutorial.options;if(!testingTutorial)TutorialUI.mark();restart(o.profile,o.seed,o.character,o.wildStrength,false);},retry(){if(!run?.tutorial)return;const o=run.tutorial.options;restart(o.profile,o.seed,o.character,o.wildStrength,true);}});
  AIWatch.attach({
    begin(){watchBackup={snapshot:run?.snapshot()||null,homeOpen};watching=true;cancelWatchMotion();clearTimeout(autoEndTimer);cancelDrag();watchCamera=null;document.querySelector('.app-shell').inert=true;},
    show(snapshot){cancelWatchMotion();watchCamera=null;installWatchSnapshot(snapshot);lastLogId=0;render();},
    async animate(data,rate=1){const version=epoch;for(const item of data.timeline||[]){if(version!==epoch||!watching)return false;await animateWatchFrame(item,version,rate);}if(version!==epoch||!watching)return false;installWatchSnapshot(data.snapshot);render();return true;},
    cancel:cancelWatchMotion,
    end(){cancelWatchMotion();watching=false;watchCamera=null;run=watchBackup.snapshot?Run.restore(watchBackup.snapshot):null;battle=run?.battle||null;homeOpen=watchBackup.homeOpen;watchBackup=null;lastLogId=0;document.querySelector('.app-shell').inert=false;render();}
  });
  if(testingTutorial){run=CrawlerTutorial.create({seed:'TUTORIAL-PREVIEW'});battle=null;homeOpen=false;if(tutorialTestMode==='finish'){run.tutorial.stage='complete';run.completed.push('tutorial-boss');run.dungeon.x=2;run.dungeon.y=2;}}
  if(testingBoss){
    run=BossTest.create(bossTestMode);battle=run.battle;homeOpen=false;
    saveError='动画测试 · 不保存';
    const bar=document.createElement('section');bar.className='boss-test-toolbar';bar.setAttribute('aria-label','Boss 动画测试');
    const help={ritual:'点击任意一张牌，触发四个地面法阵逐个召唤。',bleed:'先点击「结束回合」承受血刃，再结束一次回合观察流血；小红心可止血。',finale:'点击「神鞭」击败剩余1血的吸血鬼，观看爆裂、白光与胜利。'};
    bar.innerHTML=`<strong>第五关 Boss 动画测试 · 独立临时场景</strong><nav><a href="?bossTest=ritual">① 逐个召唤</a><a href="?bossTest=bleed">② 流血阶段</a><a href="?bossTest=finale">③ 最终死亡</a><a href="?bossTest=${bossTestMode}">重置当前场景</a><a href="./">返回正常游戏</a></nav><p>${help[bossTestMode]}测试预设200生命、10法力；普通存档不会被覆盖。</p>`;
    document.querySelector('.app-shell').prepend(bar);
  }
  render();
})();





