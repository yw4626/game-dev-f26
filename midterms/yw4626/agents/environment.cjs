'use strict';
// Runner-owned authority. Policies get JSON copies, never Run, RNG or saves.
const { Run } = require('../dist/run.js');
const E = require('../dist/engine.js');
const D = require('../dist/dungeon.js');
const copy = x => JSON.parse(JSON.stringify(x));
const pick = (x, keys) => Object.fromEntries(keys.filter(k => x?.[k] !== undefined).map(k => [k, x[k]]));
const RELATIVE = ['forward', 'right', 'back', 'left'];
const CARD_FIELDS = ['name','english','kind','cost','costType','baseDamage','baseAmount','drawCount','armor','mana','might','amount','area','luck','coins','heal','recovery','magnet','growth','curse','duration','dealCountBoost','destroyOnPlay','attackPattern','firstEffect','reaction','retain'];
const PREVIEW_FIELDS = ['payment','continues','multiplier','resultCombo','comboBonus','totalDamage','damage','hits','targetMode','targetCount','pierce','area','areaAttack','rearSplashDamage','areaSplashDamage','draw','actualDraw','armor','manaGain','mightGain','amountGain','dealGain','luckGain','healGain','actualHealGain','coinsGain','experience','character','wildcard','destroyOnPlay','freeReward','effectMultiplier','areaGain','freezeWaves','eraseRows','wildDamage','wildHits'];
function cardView(c, battle, settings={attackRulesVersion:13,wildBalanceVersion:20,friendshipRulesVersion:19,wildStrength:true}) {
  const def = E.definition(c);
  const card = {mechanicColor:E.bossRules.color(def),...pick(c, ['id','key','gems','gemSlots','free','evolved']), ...pick(def, CARD_FIELDS)};
  if (def.kind === 'attack') card.baseAttack = pick(E.attackSummary(def), ['totalDamage','damage','hits','targetMode','attackPattern','area','areaAttack','rearSplashDamage']);
  const preview=battle?battle.cardPreview(c):null;
  if (preview) card.preview = pick(preview, PREVIEW_FIELDS);
  settings=battle?.settings||settings;
  const multiplier=preview?.effectMultiplier||1;
  card.effectText=E.effectsV10.descriptions(def,multiplier,true,{settings,preview:preview||undefined,friendshipBonus:preview?.comboBonus||E.friendshipBonus(def,settings)});
  if(def.kind==='attack')card.effectText.push(...E.specials.describe(def,{player:battle?.player||{},multiplier,damage:preview?.damage||card.baseAttack.damage,en:true,rulesVersion:settings.attackRulesVersion}).lines);
  if(def.kind==='wild'&&preview)card.effectText.push(...E.effectsV10.wildNotes(def,preview,true));
  return card;
}
function pathTo(d, target) {
  const queue = [[d.x,d.y,[]]], seen = new Set([D.key(d.x,d.y)]);
  for(let i=0;i<queue.length;i++) {
    const [x,y,path] = queue[i]; if(D.key(x,y)===target) return path;
    for(let dir=0;dir<4;dir++) {
      const v=D.dirs[dir], nx=x+v.x, ny=y+v.y, key=D.key(nx,ny);
      if(!seen.has(key)&&D.canTraverse(d,x,y,nx,ny)) {seen.add(key);queue.push([nx,ny,[...path,dir]]);}
    }
  }
  return null;
}
class PlayerEnvironment {
  #run; #options; #steps=0; #decisions=0; #invalid=0; #revision=0; #terminal=null; #viewer; #lastAction=null;
  constructor(options={},viewer=null) {
    this.#viewer=typeof viewer==='function'?viewer:null;
    this.#options={profile:'demo',character:'antonio',goalFloor:2,stepLimit:1200,decisionLimit:400,invalidLimit:5,...options};
    for(const k of ['stepLimit','decisionLimit','invalidLimit']) if(!Number.isSafeInteger(this.#options[k])||this.#options[k]<1) throw Error('Invalid '+k);
    if(!Number.isInteger(this.#options.goalFloor)||this.#options.goalFloor<2||this.#options.goalFloor>6) throw Error('Invalid goal floor');
  }
  reset(seed) {
    this.#run=new Run({seed:String(seed),profile:this.#options.profile,character:this.#options.character});
    this.#steps=this.#decisions=this.#invalid=this.#revision=0;this.#terminal=null;this.#lastAction=null;
    this.#publish();
    return this.observe('player');
  }
  #publish(){
    // Trusted renderer sink only; never included in observe/legal_actions/model input.
    if(!this.#viewer)return;const snapshot=this.#run.snapshot();snapshot.data.battles=[];
    if(snapshot.data.events)snapshot.data.events=snapshot.data.events.slice(-50);
    this.#viewer(snapshot);
  }
  #check(player) { if(player!=='player') throw Error('Unknown player'); if(!this.#run) throw Error('Call reset first'); }
  #markers() {
    const r=this.#run,d=r.dungeon, keys=new Set([...Object.keys(d.rooms),...Object.keys(d.objects||{}),d.exit?.key].filter(Boolean));
    return [...keys].map(key=>{
      const room=d.rooms[key],o=D.objectAt(d,...key.split(',').map(Number));
      if(!room&&!o) return null;
      const result={key,room:room?.type,completed:room? r.completed.includes(room.id):false,object:o?.type,locked:!!o?.locked};
      const service=r.serviceStatus(key);if(service)result.service=service;
      // Only an exposed pickup has an inspectable reward; sealed containers do not.
      if(o?.type==='pickup') result.pickup=pick(o.reward,['kind','amount','key']);
      return result;
    }).filter(Boolean);
  }
  observe(player) {
    this.#check(player); const r=this.#run,b=r.battle, active=['battle','levelup'].includes(r.phase)&&b;
    const o={version:'player-api-v4',revision:this.#revision,phase:r.phase,floor:r.floor,goalFloor:this.#options.goalFloor,character:r.character,
      position:{x:r.dungeon.x,y:r.dungeon.y,dir:r.dungeon.dir},level:r.level,xp:r.xp,xpRequired:r.xpRequired(),gold:r.gold,health:active?b.player.health:r.health,maxHealth:active?b.player.maxHealth:r.maxHealth,
      growth:r.growth,deck:r.deck.map(c=>cardView(c,null,r.combatSettings())),progress:{...r.stats,steps:this.#steps,decisions:this.#decisions,invalidActions:this.#invalid},outcome:this.outcome()};
    o.lastAction=this.#lastAction;
    if(r.phase==='map'){
      const markers=this.#markers(),exit=markers.find(m=>['shovel','mansionDoor'].includes(m.object)&&!m.locked),boss=markers.find(m=>m.room==='boss'&&!m.completed);
      o.map={x:r.dungeon.x,y:r.dungeon.y,dir:r.dungeon.dir,grid:r.dungeon.grid,connections:r.dungeon.connections,markers,objective:exit?{kind:'enter_exit',key:exit.key}:boss?{kind:'defeat_boss',key:boss.key}:null};
    }
    if(active) o.battle={bossMechanics:E.bossRules.publicState(b),turn:b.turn,phase:b.phase,combo:b.combo,player:pick(b.player,['health','maxHealth','mana','armor','might','amount','area','magnet','luck','growth','curse','duration','recovery','greed','revival']),
      hand:b.piles.hand.map(c=>cardView(c,b)),piles:Object.fromEntries(Object.entries(b.piles).map(([key,cards])=>[key,cards.length])),
      discard:b.piles.discard.map(c=>({id:c.id,key:c.key})),
      enemies:b.enemies.filter(e=>e.health>0).map(e=>({...pick(e,['id','name','health','maxHealth','armor','row','column','slot','isBoss','freezeStacks']),intent:e.intent?{actions:e.intent.actions.map(a=>pick(a,['kind','value']))}:null}))};
    const choices=r.phase==='levelup'?r.levelChoice.choices:r.phase==='bosscard'?r.bossReward.cards:r.phase==='reward'?r.reward.choices:null;
    if(choices) o.rewards=choices.map((c,index)=>({index,card:cardView(c,null,r.combatSettings()),evolutions:r.rewardEvolutionHints(c).map(h=>pick(h,['resultName','resultKey','status']))}));
    if(r.phase==='shop') o.shop={offers:r.shop.offers.map(s=>({...pick(s,['id','price','sold']),card:cardView(s,null,r.combatSettings())})),refreshCost:r.shopRefreshCost(),healed:r.shop.healed};
    if(r.phase==='bossreward'||r.phase==='evolution') o.evolutions=r.evolutionChoices().map(e=>pick(e,['id','resultKey','resultName','componentIds','inheritedGems','gemSlots']));
    if(r.phase==='bossreward')o.gemOption={available:r.canChooseBossGem(),reason:r.canChooseBossGem()?'Choose a gem, then a compatible card':'No compatible cards; choose a new card or evolution instead'};
    if(r.phase==='gem') {
      const selected=r.gemChoice.selected,targets=selected?r.deck.map(c=>E.gems.insertionPreview(c,selected)).filter(p=>p.ok):[];
      o.gems={stage:selected?'choose_card':'choose_gem',selected,source:r.gemChoice.source,
        nextAction:selected?(targets.length?'Choose a socket action to attach the selected gem to ONE card and finish. Selecting another gem only changes the selection.':'No compatible cards. Change gem or cancel.'):'Choose a gem, then socket it onto one compatible card.',
        compatibleCards:targets,offers:(r.gemObject()?.offers||[]).map(key=>({key,...pick(E.gems.catalog.gems[key],['name','english','effect','value','description']),compatibleCardCount:r.deck.filter(c=>E.gems.canInsert(c,key).ok).length}))};
    }
    return copy(o);
  }
  legal_actions(player) {
    this.#check(player); if(this.outcome().terminal)return [];
    const r=this.#run,b=r.battle,actions=[];
    const add=(id,type,arg,details={})=>actions.push({id,revision:this.#revision,type,...(arg===undefined?{}:{arg}),...details});
    if(r.phase==='map') {
      RELATIVE.forEach((dir,i)=>{const v=D.dirs[(r.dungeon.dir+i)%4];if(D.canTraverse(r.dungeon,r.dungeon.x,r.dungeon.y,r.dungeon.x+v.x,r.dungeon.y+v.y))add('move:'+dir,'move',dir);});
      add('turn:left','turn',-1);add('turn:right','turn',1);
      for(const m of this.#markers()) {
        // Navigation targets are meaningful markers, not already-cleared waypoints.
        // Primitive movement is still available for deliberate revisits.
        if(!m.object&&m.completed&&m.room!=='shop')continue;
        if(m.service&&(!m.service.available||m.service.deferred))continue;
        if(m.locked&&!(m.room==='boss'&&!m.completed))continue;
        const path=pathTo(r.dungeon,m.key);if(path===null)continue;
        const here=path.length===0;
        // A same-cell bump is allowed for a visible object / uncompleted room.
        if(here&&(!m.object&&m.completed||m.locked))continue;
        if(here&&!m.object&&!m.room)continue;
        add('navigate:'+m.key,'navigate',m.key,{distance:path.length,destination:m.object||m.room,completed:m.completed,...(m.service?{service:m.service}:{})});
      }
    } else if(r.phase==='battle'&&b.phase==='player') {
      for(const c of b.piles.hand)if(b.canPlay(c.id).ok)add('play:'+c.id,'play',c.id);
      add('end_turn','end_turn');
    } else if(['levelup','bosscard','reward'].includes(r.phase)) {
      const choices=r.phase==='levelup'?r.levelChoice.choices:r.phase==='bosscard'?r.bossReward.cards:r.reward.choices;
      choices.forEach((c,i)=>add('choose:'+i,'choose',i));
    } else if(r.phase==='bossreward') {
      for(const kind of ['card',...(r.canChooseBossGem()?['gem']:[]),...(r.evolutionChoices().length?['evolution']:[])])add('boss:'+kind,'boss',kind);
    } else if(r.phase==='evolution') {
      r.evolutionChoices().forEach(e=>add('fuse:'+e.id,'fuse',e.id));add('cancel','cancel');
    } else if(r.phase==='gem') {
      if(r.gemChoice.selected)for(const c of r.deck)if(E.gems.canInsert(c,r.gemChoice.selected).ok)add('socket:'+c.id,'socket',c.id,{description:'Attach selected gem to this card and finish reward',cardName:E.definition(c).english,preview:E.gems.insertionPreview(c,r.gemChoice.selected)});
      for(const key of r.gemObject()?.offers||[])if(key!==r.gemChoice.selected&&r.deck.some(c=>E.gems.canInsert(c,key).ok))add('gem:'+key,'gem',key,{description:r.gemChoice.selected?'Change selected gem; does not finish reward':'Select gem; next choose a card'});
      add('cancel','cancel');
    } else if(r.phase==='shop') {
      r.shop.offers.filter(o=>!o.sold&&o.price<=r.gold).forEach(o=>add('buy:'+o.id,'buy',o.id));
      if(!r.shop.healed&&r.health<r.maxHealth&&r.gold>=25)add('heal','heal');
      if(r.gold>=r.shopRefreshCost())add('refresh','refresh');
      for(const c of r.deck){const info=r.slotExpansionInfo(c.id);if(!info.full&&r.gold>=info.price)add('expand:'+c.id,'expand',c.id);}
      add('leave','leave');
    } else if(r.phase==='removal') {
      if(r.deck.length>2)for(const c of r.deck)if(E.definition(c).kind!=='character')add('remove:'+c.id,'remove',c.id);
      add('cancel','cancel');
    } else if(r.phase==='camp')add('rest','rest');
    else if(r.phase==='treasure')add('open','open');
    return copy(actions);
  }
  #advance() {
    const r=this.#run;
    for(let n=0;n<1000&&!this.outcome().terminal;n++) {
      if(r.phase==='battle') {
        r.syncExperience();r.settleBattle();
        if(r.phase!=='battle')continue;
        if(r.battle.phase==='enemy') {this.#steps++;r.battle.resolveNextEnemy();continue;}
      }
      if(r.phase==='digging') {this.#steps++;r.digStep();continue;}
      if(r.phase==='gate') {this.#steps++;if(!r.nextFloor())this.#terminal='engine_stall';continue;}
      return;
    }
  }
  #navigate(key) {
    const r=this.#run,d=r.dungeon,path=pathTo(d,key);
    if(!path) return {ok:false,reason:'unreachable'};
    if(!path.length) {
      this.#steps++;
      const o=D.objectAt(d);return o&&!o.locked?r.useObject(d.x,d.y):r.interact();
    }
    let result={ok:true};
    for(const dir of path) {
      if(this.outcome().terminal)break;
      this.#steps++;
      const v=D.dirs[dir],x=d.x+v.x,y=d.y+v.y,room=D.roomAt(d,x,y),object=D.objectAt(d,x,y);
      const service=r.serviceStatus(D.key(x,y)),passService=D.key(x,y)!==key&&service&&(service.deferred||!service.available);
      result=r.walk(RELATIVE[(dir-d.dir+4)%4],{passDeferredServices:!!passService});
      // Never walk past an encounter, loot, a service or a changing floor.
      if(!result.ok||r.phase!=='map'||r.dungeon!==d||object&&!passService||room&&!r.completed.includes(room.id)&&!passService)break;
    }
    return result;
  }
  step(player, action) {
    this.#check(player);if(this.outcome().terminal)return {ok:false,reason:'terminal',outcome:this.outcome()};
    const keys=action&&typeof action==='object'?Object.keys(action).sort().join(','):'';
    const legal=keys==='id,revision'&&action.revision===this.#revision?this.legal_actions(player).find(a=>a.id===action.id):null;
    this.#revision++;
    if(!legal) {this.#decisions++;this.#invalid++;return {ok:false,reason:'illegal_or_stale_action',observation:this.observe(player),outcome:this.outcome()};}
    const r=this.#run,{type,arg}=legal,before={phase:r.phase,floor:r.floor,x:r.dungeon.x,y:r.dungeon.y};let result;
    if(type==='navigate')result=this.#navigate(arg);
    else {
      this.#steps++;
      switch(type) {
        case 'move':result=r.walk(arg);break;case 'turn':result=r.turn(arg);break;
        case 'play':result=r.battle.play(arg);break;case 'end_turn':result=r.battle.endTurn();break;
        case 'choose':result=r.phase==='levelup'?r.chooseLevelCard(arg):r.phase==='bosscard'?r.claimBossCard(arg):r.claimReward(arg);break;
        case 'boss':result=r.chooseBossReward(arg);break;case 'fuse':result=r.fuse(arg);break;
        case 'gem':result=r.chooseGem(arg);break;case 'socket':result=r.socketGem(arg);break;
        case 'buy':result=r.buy(arg);break;case 'heal':result=r.buyHeal();break;case 'refresh':result=r.refreshShop();break;
        case 'expand':result=r.addGemSlot(arg);break;case 'leave':result=r.leave();break;
        case 'remove':result=r.removeCard(arg);break;
        case 'cancel':result=r.phase==='gem'?r.cancelGem():r.phase==='removal'?r.cancelRemoval():r.skipEvolution();break;
        case 'rest':result=r.rest();break;case 'open':result=r.openTreasure('gold');break;
      }
    }
    if(result===false||result?.ok===false) this.#invalid++;
    this.#advance();this.#decisions++;
    this.#lastAction={id:legal.id,accepted:result!==false&&result?.ok!==false,phaseChanged:before.phase!==r.phase,positionChanged:before.x!==r.dungeon.x||before.y!==r.dungeon.y||before.floor!==r.floor,
      ...(type==='navigate'?{destination:arg,reached:before.floor===r.floor&&D.key(r.dungeon.x,r.dungeon.y)===arg,interruptedBy:r.phase!=='map'?r.phase:before.floor!==r.floor?'new_floor':D.key(r.dungeon.x,r.dungeon.y)!==arg?'object_or_step_limit':null}:{})};
    this.#publish();
    return {ok:result!==false&&result?.ok!==false,reason:result?.reason,observation:this.observe(player),outcome:this.outcome()};
  }
  outcome() {
    if(!this.#run)return {terminal:false,reason:'not_started',score:0};
    const r=this.#run, active=['battle','levelup'].includes(r.phase)&&r.battle;
    const reason=this.#terminal||(r.phase==='won'?'game_won':r.phase==='lost'?'defeat':r.floor>=this.#options.goalFloor?'goal_reached':this.#invalid>=this.#options.invalidLimit?'invalid_limit':this.#steps>=this.#options.stepLimit?'step_limit':this.#decisions>=this.#options.decisionLimit?'decision_limit':'ongoing');
    const kills=r.stats.kills+(active?r.battle.enemies.filter(e=>e.health<=0).length:0);
    return {terminal:reason!=='ongoing',reason,success:['game_won','goal_reached'].includes(reason),score:(r.floor-1)*1000+r.stats.wins*100+kills*5+r.level*10,
      floor:r.floor,health:active?r.battle.player.health:r.health,wins:r.stats.wins,kills,level:r.level,steps:this.#steps,decisions:this.#decisions,invalidActions:this.#invalid};
  }
}
module.exports={PlayerEnvironment,cardView};
