(function(root){
  'use strict';
  const engine=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Crawler;
  const {Battle,catalog,profiles,rng,shuffle,definition,gems,characters,evolutionRecipes}=engine;
  const dungeon=typeof module!=='undefined'&&module.exports?require('./dungeon.js'):root.CrawlerDungeon;
  const pickups=typeof module!=='undefined'&&module.exports?require('./pickup-catalog.js'):root.PickupCatalog;
  const progression=typeof module!=='undefined'&&module.exports?require('./progression-catalog.js'):root.ProgressionCatalog;
  const encounters=typeof module!=='undefined'&&module.exports?require('./encounters.js'):root.CrawlerEncounters;
  const copy=x=>JSON.parse(JSON.stringify(x));
  const themes=typeof module!=='undefined'&&module.exports?require('./floor-themes.js'):root.CrawlerThemes;
  const floorNames=themes.floors.map(t=>t.name);
  const roomNames={battle:'怪物巢穴',elite:'精英巡卫',shop:'流浪商人',camp:'守夜营地',treasure:'遗失的宝箱',boss:'地窖守关者'};
  const starter=['whip','whip','wand','wand','fire','fire','axe','axe','cross','cross','draw','draw','armor','armor'];
  function enabledEvolutionRecipes(run){
    return evolutionRecipes.filter(recipe=>!recipe.sourceDisabled&&(run.combatVersion>=10?recipe.runtimeEnabled:['holyWand','hellfire','thousandEdge'].includes(recipe.id))&&(run.profile==='demo'||progression.cardUnlocks[recipe.resultAssetId]?.defaultUnlocked));
  }
  function evolutionWeaponIssue(recipe,weapon){
    if(!weapon)return 'missingWeapon';
    if(weapon.gemRulesVersion>=14)return gems.validate({...weapon,key:recipe.resultKey,baseKey:weapon.baseKey||weapon.key,evolutionRecipe:recipe.id,evolved:true}).ok?null:'incompatible';
    if(gems.installed(weapon).length>=gems.slotCount(weapon))return 'full';
    if(!gems.availableTags(weapon).includes('GemTag_Evolve'))return 'incompatible';
    const result={key:recipe.resultKey,baseKey:weapon.baseKey||weapon.key,evolutionRecipe:recipe.id,gemSlots:gems.slotCount(weapon),gems:[...gems.installed(weapon),'evolve']};
    return gems.validate(result).ok?null:'incompatible';
  }
  function* evolutionCombinations(recipe,deck,{candidate=null,partial=false}={}){
    const pools=recipe.componentGroups.map(group=>deck.filter(c=>catalog.cards[c.key]?.group===group).filter((c,i,all)=>all.findIndex(other=>other.id===c.id)===i));
    function* combine(index,components){
      if(index===pools.length){if(!candidate||components.includes(candidate))yield components;return;}
      for(const card of pools[index])if(!components.some(c=>c&&c.id===card.id))yield* combine(index+1,[...components,card]);
      if(partial)yield* combine(index+1,[...components,null]);
    }
    yield* combine(0,[]);
  }
  class Run {
    constructor({seed='CRAWL-01',profile='demo',exploration=true,legacyProgression=false,rulesVersion=8,character='antonio',combatVersion=13,wildStrength=true,shopRulesVersion=combatVersion>=13?14:12,worldRulesVersion=combatVersion>=13?16:14,friendshipRulesVersion=combatVersion>=13?19:0,wildBalanceVersion=combatVersion>=13?20:0,shopPriceVersion=combatVersion>=13?21:0,lootEconomyVersion=combatVersion>=13?21:0}={}){
      this.seed=String(seed).slice(0,80)||'CRAWL-01';this.profile=profiles[profile]?profile:'demo';
      this.progressionVersion=legacyProgression?6:rulesVersion===7?7:8;this.character=this.progressionVersion>=8?character:null;
      this.combatVersion=this.progressionVersion>=8?combatVersion:8;this.totalFloors=this.combatVersion>=10?5:3;this.wildStrength=this.combatVersion>=10&&!!wildStrength;this.handRulesVersion=this.combatVersion>=10?11:8;
      this.encounterRulesVersion=this.combatVersion>=12?12:9;
      this.lootEconomyVersion=lootEconomyVersion;this.friendshipRulesVersion=friendshipRulesVersion;this.wildBalanceVersion=wildBalanceVersion;
      this.gemRulesVersion=this.combatVersion>=13?(worldRulesVersion>=15?15:14):12;
      this.shopRulesVersion=this.progressionVersion>=8?shopRulesVersion:12;this.shopPriceVersion=this.shopRulesVersion>=14?shopPriceVersion:0;
      this.worldRulesVersion=this.progressionVersion>=8?worldRulesVersion:14;this.slotExpansionCounts={};this.removalChoice=null;
      if(this.character&&!characters[this.character])throw Error('Unknown character');
      this.level=1;this.xp=0;this.pendingLevels=[];this.levelChoice=null;this.xpCursor=0;
      this.phase='map';this.floor=1;this.stage=-1;this.current=null;this.completed=[];this.gold=60;
      this.health=profiles[this.profile].health+(characters[this.character]?.statModifiers.healthModifier||0);this.maxHealth=this.health;
      this.growth={mana:0,deal:0};this.combatBonuses={growth:0,luck:0};this.slotUpgrades={};this.gemChoice=null;this.evolution=null;this.evolutionFloors=[];this.bossReward=null;this.bossRewardFloors=[];this.nextCardId=1;
      const keys=this.character?characters[this.character].deckAssetIds.map(id=>Object.keys(catalog.cards).find(k=>catalog.cards[k].assetId===id)):starter;
      if(keys.some(k=>!k))throw Error('Unsupported character starter');this.deck=keys.map(key=>this.makeCard(key));
      this.battle=null;this.reward=null;this.shop=null;this.history=[];this.battles=[];this.stats={wins:0,kills:0,turns:0,goldEarned:0,upgrades:0,rooms:0};
      this.maps=Array.from({length:this.totalFloors},(_,i)=>this.buildMap(i+1));this.dungeon=exploration?dungeon.build(this.seed,1,this.maps[0]):null;if(this.dungeon)this.dungeon.themeVersion=this.progressionVersion>=7?24:0;this.populateGems();this.populateGrowth();this.populateWildLoot();this.populateRemoval();this.populateLootEconomy();this.log('start','新的探索开始了。');
    }
    makeCard(key,level=0){return {id:this.nextCardId++,key,level,...(this.gemRulesVersion>=14?{gemRulesVersion:this.gemRulesVersion}:{}),gems:[],gemSlots:this.slotUpgrades?.[key]??gems.slotCount({key}),free:false,temporaryFree:false,modifiers:[0,0,0,0]};}
    enableGemV14(){
      if(this.gemRulesVersion>=14)return false;
      const migrate=card=>{card.gemRulesVersion=14;if(card.baseKey){card.evolved=true;card.gems=(card.gems||[]).filter(k=>k!=='evolve');}};
      this.deck.forEach(migrate);if(this.battle)Object.values(this.battle.piles).flat().forEach(migrate);
      this.gemRulesVersion=14;if(this.evolution)this.evolution.choices=this.evolutionChoices();return true;
    }
    log(type,text,extra={}){this.history.push({id:this.history.length+1,floor:this.floor,type,text,...extra});}
    buildMap(floor){
      // Route topology is deliberately authored; rewards and encounters use independent seed streams.
      const swapped=rng(this.seed+':map:'+floor)()>.5;
      const stages=[['battle'],swapped?['treasure','battle']:['battle','treasure'],swapped?['camp','shop']:['shop','camp'],['elite','battle'],...((this.combatVersion>=10&&floor>=4)?Array.from({length:floor-3},(_,i)=>[i%2?'elite':'battle']):[]),['boss']];
      return stages.flatMap((kinds,stage)=>kinds.map((type,lane)=>({id:`${floor}-${stage}-${lane}`,floor,stage,lane,type,name:roomNames[type]})));
    }
    available(){return this.phase==='map'?this.maps[this.floor-1].filter(n=>n.stage===this.stage+1):[];}
    currentRoom(){return this.maps[this.floor-1].find(n=>n.id===this.current)||null;}
    enter(id){
      const at=this.dungeon?dungeon.roomAt(this.dungeon):null;
      const node=this.dungeon?(this.phase==='map'&&at?.id===id&&(!this.completed.includes(id)||at.type==='shop')?this.maps[this.floor-1].find(n=>n.id===id):null):this.available().find(n=>n.id===id);
      if(!node)return {ok:false,reason:'请先走到这个地点'};
      this.current=id;this.stage=node.stage;if(!this.completed.includes(id))this.stats.rooms++;this.log('enter',`进入${floorNames[this.floor-1]} · ${node.name}`,{room:id});
      if(['battle','elite','boss'].includes(node.type)){
        const enemies=this.encounter(node);
        this.battle=new Battle({seed:this.seed+':'+node.id,profile:this.profile,deck:this.deck,enemies,settings:{...this.combatSettings(),bossFloor:node.type==='boss'?this.floor:0},player:{health:this.health,maxHealth:this.maxHealth}});
        this.xpCursor=0;this.phase='battle';
      }else if(node.type==='shop'){this.shop=this.dungeon?.shops[id]||this.makeShop(node);if(this.dungeon){this.dungeon.shops[id]=this.shop;this.noteService(dungeon.key(this.dungeon.x,this.dungeon.y),'visited');}this.phase='shop';}
      else this.phase=node.type;
      if(this.worldRulesVersion>=15&&this.phase==='treasure')return this.openTreasure('gold');
      if(this.progressionVersion>=7&&this.phase==='camp')return this.rest();
      return {ok:true};
    }
    walk(direction,options={}){
      if(this.phase!=='map'||!this.dungeon)return {ok:false,reason:'当前不能移动'};
      if(this.worldRulesVersion>=15)return this.bumpWalk(direction,options);
      const offset={forward:0,right:1,back:2,left:3}[direction];
      if(offset!==undefined){const v=dungeon.dirs[(this.dungeon.dir+offset)%4],x=this.dungeon.x+v.x,y=this.dungeon.y+v.y;if(dungeon.canTraverse(this.dungeon,this.dungeon.x,this.dungeon.y,x,y)&&dungeon.objectAt(this.dungeon,x,y)&&!dungeon.objectAt(this.dungeon,x,y).locked&&dungeon.objectAt(this.dungeon,x,y).type!=='gemchest')return this.useObject(x,y);}
      const result=dungeon.move(this.dungeon,direction);if(!result.ok)return result;
      this.log('step',`移动到 (${this.dungeon.x}, ${this.dungeon.y})`,{direction});
      const room=dungeon.roomAt(this.dungeon);
      if(room&&room.type!=='stairs'&&!this.completed.includes(room.id))return this.enter(room.id);
      return result;
    }
    bumpWalk(direction,{passDeferredServices=false}={}){
      const d=this.dungeon,offset={forward:0,right:1,back:2,left:3}[direction];
      if(offset===undefined)return {ok:false,reason:'未知移动方向'};
      // Legacy saves may already stand inside an unopened treasure room.
      if(this.worldRulesVersion>=16&&direction==='forward'){
        const own=dungeon.objectAt(d),room=dungeon.roomAt(d);
        if(own?.type==='pickup')return this.objectFeedback(d.x,d.y);
        if(room?.type==='treasure'&&!this.completed.includes(room.id)&&!own)return this.openChestAt(d.x,d.y);
      }
      // After a guardian, the player already stands on the revealed exit.
      if(direction==='forward'&&['shovel','mansionDoor'].includes(dungeon.objectAt(d)?.type)&&!dungeon.objectAt(d).locked)return this.useObject(d.x,d.y);
      if(direction==='forward'&&dungeon.roomAt(d)?.type==='stairs'){
        const boss=this.maps[this.floor-1].find(n=>n.type==='boss');
        if(this.completed.includes(boss.id)){this.phase='gate';this.nextFloor();return {ok:true,stationary:true};}
      }
      const v=dungeon.dirs[(d.dir+offset)%4],x=d.x+v.x,y=d.y+v.y;
      if(dungeon.canTraverse(d,d.x,d.y,x,y)){
        const obj=dungeon.objectAt(d,x,y);
        if(this.worldRulesVersion>=16){
          if(obj?.type==='pickup'){
            const collected=this.objectFeedback(x,y);if(!collected.ok)return collected;
            dungeon.move(d,direction);this.log('step',`移动到 (${d.x}, ${d.y})`,{direction});
            return {...collected,stationary:false};
          }
          const room=dungeon.roomAt(d,x,y);
          if(!obj&&room?.type==='treasure'&&!this.completed.includes(room.id))return this.openChestAt(x,y);
          if(obj&&['crate','barrel','gargoyle','manaCart','bracerCart'].includes(obj.type))return this.objectFeedback(x,y);
        }
        if(obj&&!obj.locked&&!['gemchest','removal'].includes(obj.type))return this.useObject(x,y);
      }
      const result=dungeon.move(d,direction);if(!result.ok)return result;
      this.log('step',`移动到 (${d.x}, ${d.y})`,{direction});
      const service=this.serviceStatus(dungeon.key(d.x,d.y));
      const passService=passDeferredServices&&service&&(service.deferred||!service.available);
      const obj=dungeon.objectAt(d);if(obj&&['gemchest','removal'].includes(obj.type)&&!passService)return this.useObject(d.x,d.y);
      const room=dungeon.roomAt(d);
      if(room?.type==='stairs'){
        const boss=this.maps[this.floor-1].find(n=>n.type==='boss');
        if(!this.completed.includes(boss.id))return {...result,notice:'守关者的封印尚未解除'};
        this.phase='gate';this.nextFloor();return {ok:true,stationary:true};
      }
      if(room&&(room.type==='shop'||!this.completed.includes(room.id))&&!passService){
        const entered=this.enter(room.id);
        if(entered.ok&&this.phase==='treasure')return this.openTreasure('gold');
        return entered;
      }
      return result;
    }
    openChestAt(x,y){
      const d=this.dungeon,room=d&&dungeon.roomAt(d,x,y);
      if(this.phase!=='map'||!room||room.type!=='treasure'||this.completed.includes(room.id)||dungeon.objectAt(d,x,y))return {ok:false,reason:'宝箱已经打开或收集'};
      if(Math.abs(d.x-x)+Math.abs(d.y-y)>1||(d.x!==x||d.y!==y)&&!dungeon.canTraverse(d,d.x,d.y,x,y))return {ok:false,reason:'请先靠近宝箱'};
      d.objects??={};d.objects[dungeon.key(x,y)]={id:'treasure-drop-'+room.id,type:'pickup',active:true,broken:false,openedChest:true,sourceRoomId:room.id,roomCounted:this.current===room.id,reward:{kind:'gold',amount:100}};
      this.log('chest_open','宝箱打开了，100金币留在原地。向前再走一步拾取。',{room:room.id});
      return {ok:true,stationary:true,notice:'宝箱已打开 · 再向前一步拾取100金币',feedback:{kind:'open',source:'treasure',x,y,reward:{kind:'gold',amount:100}}};
    }
    objectFeedback(x,y){
      const before=dungeon.objectAt(this.dungeon,x,y);if(!before)return {ok:false,reason:'这里已经没有物品'};
      const source=before.type,reward=copy(before.reward||{}),result=this.useObject(x,y);
      if(!result.ok)return result;
      const goldGain=source==='pickup'&&reward.kind==='gold'?reward.amount:0;
      return {...result,goldGain,feedback:{kind:source==='pickup'?'collect':'break',source,x,y,reward,goldGain,openedChest:!!before.openedChest}};
    }
    populateLootEconomy(){
      if(this.lootEconomyVersion<21||!this.dungeon)return false;
      let changed=false;
      for(const [key,obj]of Object.entries(this.dungeon.objects||{})){
        if(!obj.active||obj.openedChest||obj.reward?.kind!=='gold'||obj.lootEconomyVersion>=21)continue;
        if(!['crate','barrel','gargoyle'].includes(obj.type)&&!(obj.type==='pickup'&&obj.containerBroken))continue;
        const statue=obj.type==='gargoyle'||obj.id?.startsWith('wild-statue'),depth=5*Math.max(0,this.floor-1);
        const amount=(statue?30:20+Math.floor(rng(this.seed+':container-gold-v21:'+this.floor+':'+key)()*21))+depth;
        obj.reward.amount=Math.max(obj.reward.amount||0,amount);obj.lootEconomyVersion=21;changed=true;
      }
      return changed;
    }
    enableLootEconomyV21(){const changed=this.lootEconomyVersion!==21;this.lootEconomyVersion=21;return this.populateLootEconomy()||changed;}
    enableWorldV16(){
      if(this.worldRulesVersion>=16)return false;
      const pending=this.phase==='treasure';if(pending)this.phase='map';
      this.enableWorldV15();this.worldRulesVersion=16;
      if(pending&&this.dungeon)this.openChestAt(this.dungeon.x,this.dungeon.y);
      else if(pending){this.phase='treasure';this.openTreasure('gold');}
      return true;
    }
    enableWorldV15(){
      if(this.worldRulesVersion>=15)return false;
      this.enableGemV14();this.gemRulesVersion=15;for(const c of [...this.deck,...(this.battle?Object.values(this.battle.piles).flat():[])])c.gemRulesVersion=15;
      this.worldRulesVersion=15;this.slotExpansionCounts??={};this.removalChoice??=null;
      for(const [key,slots]of Object.entries(this.slotUpgrades||{}))this.slotExpansionCounts[key]??=Math.max(0,slots-(gems.metadata({key})?.slots||0));
      this.populateRemoval();if(this.phase==='treasure')this.openTreasure('gold');return true;
    }
    populateRemoval(){
      const d=this.dungeon;if(this.worldRulesVersion<15||!d||d.removalEvent)return;
      d.objects??={};const queue=[[d.x,d.y]],seen=new Set([dungeon.key(d.x,d.y)]),candidates=[];
      for(let i=0;i<queue.length;i++){
        const [x,y]=queue[i],k=dungeon.key(x,y);
        if(i&&!d.rooms[k]&&!d.objects[k]&&k!==d.exit?.key)candidates.push(k);
        for(const v of dungeon.dirs){const nx=x+v.x,ny=y+v.y,nk=dungeon.key(nx,ny);if(!seen.has(nk)&&dungeon.canTraverse(d,x,y,nx,ny)){seen.add(nk);queue.push([nx,ny]);}}
      }
      const key=shuffle(candidates,rng(this.seed+':removal:'+this.floor))[0];if(!key)return;
      d.removalEvent={key,used:false};d.objects[key]={id:`removal-${this.floor}`,type:'removal',active:true};
    }
    serviceFingerprint(type){
      const deck=this.deck.map(c=>[c.id,c.key,gems.slotCount(c),gems.installed(c)]);
      return JSON.stringify(type==='shop'?[deck,this.gold,this.health,this.maxHealth]:deck);
    }
    serviceStatus(key){
      const d=this.dungeon,obj=d?.objects?.[key],room=d?.rooms?.[key];
      const type=obj?.active!==false&&['gemchest','removal'].includes(obj?.type)?obj.type:room?.type==='shop'?'shop':null;
      if(!type)return null;
      const note=this.serviceNotes?.[this.floor+':'+key];let available=true,reason='',compatibleCards;
      if(type==='gemchest'){
        // Unopened contents stay sealed. Lack of any compatible slot is public deck information.
        const offers=obj.offers||gems.enabled;
        compatibleCards=this.deck.filter(c=>offers.some(g=>gems.canInsert(c,g).ok)).length;
        available=compatibleCards>0;if(!available)reason='no_compatible_cards';
      }else if(type==='removal'){
        available=this.deck.length>2&&this.deck.some(c=>definition(c).kind!=='character');
        if(!available)reason='no_removable_cards';
      }
      const deferred=note?.deferredFingerprint===this.serviceFingerprint(type);
      return {type,visited:!!note?.visits,visits:note?.visits||0,available,deferred,reason:reason||(deferred?'declined_unchanged':'available'),...(type==='gemchest'?{inspected:!!obj.offers,compatibleCards}:{}),lastOutcome:note?.lastOutcome||null};
    }
    noteService(key,outcome){
      const status=this.serviceStatus(key);if(!status)return;
      this.serviceNotes??={};const id=this.floor+':'+key,note=this.serviceNotes[id]??={visits:0};
      if(outcome==='visited')note.visits++;
      if(outcome==='declined')note.deferredFingerprint=this.serviceFingerprint(status.type);
      note.lastOutcome=outcome;
    }
    cancelRemoval(){if(this.phase!=='removal')return false;this.noteService(this.removalChoice.objectKey,'declined');this.log('service_deferred','暂缓删牌；获得新卡后可再次考虑。');this.removalChoice=null;this.phase='map';return true;}
    turn(amount){
      if(this.phase!=='map'||!this.dungeon)return {ok:false,reason:'当前不能转向'};
      return {ok:dungeon.turn(this.dungeon,amount)};
    }
    interact(){
      if(this.phase!=='map'||!this.dungeon)return {ok:false,reason:'当前不能交互'};
      const standing=dungeon.roomAt(this.dungeon);
      const standingService=standing&&(standing.type==='shop'||(['camp','treasure'].includes(standing.type)&&!this.completed.includes(standing.id)));
      if(standingService&&!dungeon.objectAt(this.dungeon))return this.enter(standing.id);
      const target=dungeon.interaction(this.dungeon);
      if(target?.kind==='object'&&!target.object.locked)return this.useObject(target.x,target.y);
      const room=dungeon.roomAt(this.dungeon);
      if(!room)return {ok:false,reason:'这里没有可交互的物品，继续探索吧'};
      if(room.type==='stairs'){
        const boss=this.maps[this.floor-1].find(n=>n.type==='boss');
        if(!this.completed.includes(boss.id))return {ok:false,reason:'守关者的封印尚未解除'};
        this.phase='gate';return {ok:true};
      }
      if(this.completed.includes(room.id)&&room.type!=='shop')return {ok:false,reason:'这里已经探索完毕'};
      return this.enter(room.id);
    }
    useObject(x,y){
      const d=this.dungeon;
      if(this.phase!=='map'||!d||Math.abs(d.x-x)+Math.abs(d.y-y)>1)return {ok:false,reason:'请先靠近物品'};
      if((d.x!==x||d.y!==y)&&!dungeon.canTraverse(d,d.x,d.y,x,y))return {ok:false,reason:'物品被墙壁挡住了'};
      const obj=dungeon.objectAt(d,x,y);if(!obj)return {ok:false,reason:'这里已经没有物品'};
      if(obj.type==='removal'){
        if(d.removalEvent?.used||d.removalEvent?.key!==dungeon.key(x,y))return {ok:false,reason:'本层删牌机会已使用'};
        this.noteService(dungeon.key(x,y),'visited');this.removalChoice={objectKey:dungeon.key(x,y)};this.phase='removal';return {ok:true,stationary:true};
      }
      if(obj.type==='gemchest'){
        if(!obj.offers)obj.offers=this.gemOffers(obj.id);
        this.noteService(dungeon.key(x,y),'visited');
        this.gemChoice={objectKey:dungeon.key(x,y),selected:null};this.phase='gem';return {ok:true,stationary:true};
      }
      if(obj.type==='mansionDoor'){
        if(this.floor!==1||!d.exit?.ready||d.exit.used)return {ok:false,reason:'宅邸大门尚未开启'};
        d.exit.used=true;this.phase='gate';this.log('mansion_enter','推开宅邸大门，进入禁忌图书馆。');this.nextFloor();return {ok:true,stationary:true,notice:'穿过宅邸大门 · 禁忌图书馆'};
      }
      if(obj.type==='shovel'){
        if(this.floor>=this.totalFloors||d.exit.used)return {ok:false,reason:'没有可进入的下一层'};
        this.dig={floor:this.floor,steps:0,total:3,bonus:100,paid:0,durationMs:2500};this.phase='digging';this.log('dig_start','开始挖掘出口，暂时无法移动。');return {ok:true,stationary:true};
      }
      if(obj.type==='hole')return {ok:false,reason:'洞口已经使用'};
      if(['manaCart','bracerCart'].includes(obj.type)){
        const item=pickups.items[obj.reward.kind];obj.type='pickup';obj.containerBroken=true;
        this.log('break',`打碎推车，露出${item.name}。`);return {ok:true,stationary:true,notice:`推车碎开，再碰一下拾取${item.name}。`};
      }
      if(obj.type==='gargoyle'){
        obj.type='pickup';obj.containerBroken=true;this.log('break','石像碎开，留下掉落物。');
        return {ok:true,stationary:true,notice:'石像已破坏，再碰一下拾取掉落。'};
      }
      if(obj.type==='pickup'&&obj.reward?.kind==='card'){
        if(this.deck.length>=100)return {ok:false,reason:'牌组已满，请在遗忘祭坛移除卡牌'};
        const card=this.makeCard(obj.reward.key);this.deck.push(card);obj.broken=true;obj.active=false;
        this.log('card_pickup',`拾取「${definition(card).name}」，加入本次探索牌组`,{cardId:card.id,key:card.key,source:obj.containerBroken?'breakable':'map'});
        return {ok:true,stationary:true,notice:`获得 ${definition(card).name} · 下场战斗可以抽到`};
      }
      if(['crate','barrel'].includes(obj.type)){
        // One-stage container is this prototype's selected prop, not a universal native rule.
        const oldId=obj.id;obj.type='pickup';obj.containerBroken=true;
        this.log('break',`打碎${oldId.includes('prop')?'容器':'物品'}，露出${obj.reward.kind==='heal'?'鸡肉':'金币'}。`);
        return {ok:true,stationary:true,notice:'容器碎开了，再碰一下 拾取掉落。'};
      }
      if(obj.type==='pickup'&&['mana','deal'].includes(obj.reward?.kind)){
        const kind=obj.reward.kind,item=pickups.items[kind];this.growth??={mana:0,deal:0};
        const before=this.combatSettings();this.growth[kind]+=item.amount;const after=this.combatSettings();
        obj.broken=true;obj.active=false;
        const stat=kind==='mana'?'startingMana':'dealCount',gain=after[stat]-before[stat];
        const notice=kind==='mana'?`回合起始法力 +${gain} · 本次探索保留`:`回合抽牌 +${gain} · 本次探索保留`;
        this.log('growth',`拾取${item.name}：${notice}`,{kind,amount:gain,before:before[stat],after:after[stat]});
        return {ok:true,stationary:true,notice};
      }
      if(obj.type==='pickup'){
        obj.broken=true;obj.active=false;
        if(obj.reward.kind==='gold'){this.gold+=obj.reward.amount;this.stats.goldEarned+=obj.reward.amount;this.log('pickup',`拾取 ${obj.reward.amount} 金币`);}
        else {const gain=Math.min(obj.reward.amount,this.maxHealth-this.health);this.health+=gain;this.log('pickup',`拾取鸡肉，恢复 ${gain} 生命`);}
        if(obj.sourceRoomId&&!this.completed.includes(obj.sourceRoomId)){
          const room=this.maps[this.floor-1].find(n=>n.id===obj.sourceRoomId);this.current=room.id;this.stage=room.stage;if(!obj.roomCounted)this.stats.rooms++;this.completeRoom();
        }
        return {ok:true,stationary:true,notice:obj.reward.kind==='gold'?`拾取 ${obj.reward.amount} 金币`:`拾取鸡肉（基础治疗 ${obj.reward.amount}）`};
      }
      return {ok:false,reason:'无法使用此物品'};
    }
    xpRequired(level=this.level){
      let cost=progression.levelConfig.baseXpReq;
      for(let n=1;n<level;n++){const range=progression.levelConfig.ranges.find(r=>n>r.Range.x&&n<=r.Range.y)||progression.levelConfig.ranges.at(-1);cost+=range.XpIncreasePerLevel;}
      return cost;
    }
    availableCards(){
      return Object.keys(catalog.cards).filter(key=>{const def=catalog.cards[key],rule=progression.cardUnlocks[def.assetId];return def.kind!=='character'&&!def.isEvolved&&!def.isPickup&&def.addToRewardPool!==false&&rule?.addToRewardPool!==false&&(!def.introducedVersion||def.introducedVersion<10||(this.combatVersion>=10&&def.runtimeEnabled&&!def.sourceDisabled))&&(this.profile==='demo'||rule?.defaultUnlocked);});
    }
    experienceGain(event){
      if(event.type==='experience_gain')return event.amount;
      if(event.type!=='kill'||!this.battle)return 0;
      const enemy=this.battle.enemies.find(n=>n.id===event.enemyId);if(!enemy)return 0;
      return Math.ceil((enemy.xpOverride??progression.enemies[enemy.key]?.xp??0)*(1+(this.battle.player.growth||0)/100)*(1+(this.battle.player.curse||0)/100));
    }
    syncExperience(){
      if(this.progressionVersion<7||this.phase!=='battle'||!this.battle)return false;
      const events=this.battle.events.filter(e=>e.id>this.xpCursor);this.xpCursor=this.battle.eventId;
      for(const e of events)if(e.type==='card_destroy'){
        const card=this.deck.find(c=>c.id===e.cardId);if(card){this.deck=this.deck.filter(c=>c.id!==e.cardId);this.log('card_destroy',`「${definition(card).name}」从本次探索牌组中永久移除`,{cardId:e.cardId,key:card.key});}
      }
      for(const e of events)if(e.type==='coins_gain'){this.gold+=e.amount;this.stats.goldEarned+=e.amount;this.log('coins',`卡牌获得 ${e.amount} 金币`,{amount:e.amount});}
      for(const e of events)if(e.type==='kill'||e.type==='experience_gain'){
        const enemy=e.type==='kill'?this.battle.enemies.find(n=>n.id===e.enemyId):null,gain=this.experienceGain(e);
        this.xp+=gain;this.log('xp',`${enemy?`击败${enemy.name}`:'角色卡效果'}，经验 +${gain}`,{amount:gain,source:e.type});
        while(this.xp>=this.xpRequired()){this.xp-=this.xpRequired();this.level++;this.pendingLevels.push(this.level);this.log('level',`角色升至 Lv.${this.level}`);}
      }
      if(this.pendingLevels.length&&this.battle.phase!=='defeat'){this.openLevelChoice();return true;}return events.some(e=>['kill','experience_gain','card_destroy','coins_gain'].includes(e.type));
    }
    openLevelChoice(){
      const level=this.pendingLevels[0];if(!level)return;
      let pool=this.availableCards();
      if(level<=progression.levelChoice.weaponsOnlyUntilLevel)pool=pool.filter(k=>catalog.cards[k].kind==='attack');
      if(level<=progression.levelChoice.newCardsOnlyUntilLevel){const fresh=pool.filter(k=>!this.deck.some(c=>c.key===k));if(fresh.length)pool=fresh;}
      const random=rng(this.seed+':level:'+level),choices=[];
      while(choices.length<3&&pool.length){let total=pool.reduce((n,k)=>n+(progression.cardUnlocks[catalog.cards[k].assetId]?.rewardProbability||1)*(this.deck.some(c=>c.key===k)?progression.levelChoice.cardsInDeckMultiplier:1),0),roll=random()*total,idx=pool.length-1;
        for(let i=0;i<pool.length;i++){const k=pool[i];roll-=(progression.cardUnlocks[catalog.cards[k].assetId]?.rewardProbability||1)*(this.deck.some(c=>c.key===k)?progression.levelChoice.cardsInDeckMultiplier:1);if(roll<0){idx=i;break;}}
        choices.push({key:pool.splice(idx,1)[0],level:0});}
      this.levelChoice={level,choices};this.phase='levelup';
    }
    chooseLevelCard(index){
      if(this.phase!=='levelup'||!Number.isInteger(index)||index<0||index>=this.levelChoice.choices.length)return {ok:false,reason:'请选择升级卡牌'};
      const offer=this.levelChoice.choices[index],card=this.makeCard(offer.key,0);this.deck.push(card);
      // Player-turn selection fills an available hand slot; otherwise DrawPile.
      const toHand=this.battle.phase==='player'&&this.battle.piles.hand.length<this.battle.settings.handLimit;
      const battleCard=copy(card);
      if(toHand&&(this.combatVersion||8)>=10){battleCard.free=true;battleCard.rewardFreeTurn=this.battle.turn;}
      this.battle.piles[toHand?'hand':'draw'].push(battleCard);this.battle.cardCount++;
      this.log('level_card',`Lv.${this.levelChoice.level} 选择「${definition(card).name}」，加入${toHand?'手牌':'抽牌堆'}`,{cardId:card.id});
      this.pendingLevels.shift();this.levelChoice=null;this.phase='battle';if(this.pendingLevels.length)this.openLevelChoice();
      return {ok:true};
    }
    enableExpandedHand(){
      if(this.combatVersion<10||this.handRulesVersion>=11)return false;
      const before=this.combatSettings();this.handRulesVersion=11;const after=this.combatSettings();
      if(this.battle){this.battle.settings.handLimit=Math.max(20,this.battle.settings.handLimit);this.battle.settings.handLimitCeiling=20;this.battle.settings.dealCount+=after.dealCount-before.dealCount;}
      return true;
    }
    enableCombatV12(){
      if(this.combatVersion<10||this.combatVersion>=12)return false;
      this.combatVersion=12;this.encounterRulesVersion=12;
      this.battle?.enableCombatV12();return true;
    }
    enableCombatV13(){
      if(this.combatVersion<10||this.combatVersion>=13)return false;
      this.enableCombatV12();this.combatVersion=13;this.encounterRulesVersion=12;
      if(this.battle){this.battle.settings.attackRulesVersion=13;delete this.battle.settings.rearSplashRatio;}
      return true;
    }
    enableWildBalanceV20(){
      if(this.combatVersion<10)return false;
      const changed=this.wildBalanceVersion!==20||!!this.battle&&this.battle.settings.wildBalanceVersion!==20;
      this.wildBalanceVersion=20;if(this.battle)this.battle.settings.wildBalanceVersion=20;
      return changed;
    }
    enableFriendshipV19(){
      if(this.combatVersion<10)return false;
      const changed=this.friendshipRulesVersion!==19||!!this.battle&&this.battle.settings.friendshipRulesVersion!==19;
      this.friendshipRulesVersion=19;if(this.battle)this.battle.settings.friendshipRulesVersion=19;
      return changed;
    }
    combatSettings(){
      const base=profiles[this.profile],g=this.growth||{mana:0,deal:0},ch=characters[this.character]?.statModifiers||{};
      const handLimit=this.handRulesVersion>=11?20:base.handLimit;
      return {...base,bossRulesVersion:this.combatVersion>=13?28:0,handLimit,handLimitCeiling:this.handRulesVersion>=11?20:7,attackRulesVersion:this.combatVersion||8,friendshipRulesVersion:this.friendshipRulesVersion||0,wildBalanceVersion:this.wildBalanceVersion||0,...(this.combatVersion===12?{rearSplashRatio:.2}:{}),wildStrength:!!this.wildStrength,startingMana:Math.min(pickups.bounds.technicalMaxMana,base.startingMana+g.mana+(ch.manaModifier||0)),dealCount:Math.min(handLimit,base.dealCount+g.deal+(ch.dealCountModifier||0)),
        area:ch.areaModifier||0,startingArmor:base.startingArmor+(ch.armorModifier||0),might:base.might+(ch.mightModifier||0),amount:base.amount+(ch.amountModifier||0),magnet:base.magnet+(ch.magnetModifier||0),
        growth:(ch.growthModifier||0)+(this.combatBonuses?.growth||0),luck:engine.wildCards.luckStat.base+(ch.luckModifier||0)+(this.combatBonuses?.luck||0),curse:(ch.curseModifier||0)+(this.combatBonuses?.curse||0),duration:(ch.durationModifier||0)+(this.combatBonuses?.duration||0),greed:this.combatBonuses?.greed||0,revival:this.combatBonuses?.revival||0,revivalStacks:this.combatBonuses?.revivalStacks||0};
    }
    populateGrowth(){
      const d=this.dungeon;if(!d?.gemSites)return;
      const queue=[[d.x,d.y]],seen=new Set([dungeon.key(d.x,d.y)]),cells=[];
      for(let i=0;i<queue.length;i++){const [x,y]=queue[i],k=dungeon.key(x,y);
        if(i&&!d.objects[k]&&!d.rooms[k])cells.push(k);
        for(const v of dungeon.dirs){const nx=x+v.x,ny=y+v.y,nk=dungeon.key(nx,ny);if(!seen.has(nk)&&dungeon.canTraverse(d,x,y,nx,ny)){seen.add(nk);queue.push([nx,ny]);}}
      }
      // New room layouts reserve cart sites inside rooms, leaving corridors and
      // room exits empty. Legacy layouts retain their reachable-cell placement.
      const planned=d.generation?.supplySites;
      const sites=Array.isArray(planned)?planned.map(p=>dungeon.key(p.x,p.y)).filter(k=>cells.includes(k)):cells;
      ['manaCart','bracerCart'].forEach((type,i)=>{const k=sites[i];if(k)d.objects[k]={id:`growth-${this.floor}-${i}`,type,active:true,reward:{kind:pickups.breakables[type].item,amount:1}};});
    }
    wildLootPool(){
      const raw=engine.wildV10.pickupPools.find(p=>p.gameObject==='DestructibleCardCanvas');
      return raw.entries.filter(e=>catalog.cards[e.key]?.runtimeEnabled);
    }
    rollWild(id){
      const pool=this.wildLootPool(),random=rng(this.seed+':wild-loot:'+this.floor+':'+id);let roll=random()*pool.reduce((n,e)=>n+e.weight,0);
      for(const e of pool){roll-=e.weight;if(roll<0)return e.key;}return pool.at(-1)?.key||'cloverPetal';
    }
    populateWildLoot(){
      const d=this.dungeon;if(this.combatVersion<10||!d?.generation?.zones||d.wildLootPlaced)return;
      const clear=new Set(d.generation.zones.flatMap(z=>z.clearCells.map(p=>dungeon.key(p.x,p.y))));
      const candidates=d.generation.zones.flatMap(z=>z.cells.map(p=>({...p,zone:z.id}))).filter(p=>{const k=dungeon.key(p.x,p.y);return !d.objects[k]&&!d.rooms[k]&&!clear.has(k)&&(p.x!==d.x||p.y!==d.y);});
      candidates.sort((a,b)=>Math.abs(a.x-d.x)+Math.abs(a.y-d.y)-Math.abs(b.x-d.x)-Math.abs(b.y-d.y));
      const ground=candidates.shift();
      if(ground)d.objects[dungeon.key(ground.x,ground.y)]={id:`wild-ground-${this.floor}`,type:'pickup',active:true,reward:{kind:'card',key:this.rollWild('ground')},lootSource:'DestructibleCardCanvas'};
      const statue=candidates.find(p=>!ground||p.zone!==ground.zone)||candidates.find(p=>!ground||Math.abs(p.x-ground.x)+Math.abs(p.y-ground.y)>1);
      if(statue){const roll=rng(this.seed+':gargoyle:'+this.floor)(),card=roll>=60/90;
        d.objects[dungeon.key(statue.x,statue.y)]={id:`wild-statue-${this.floor}`,type:'gargoyle',active:true,reward:card?{kind:'card',key:this.rollWild('gargoyle')}:{kind:'gold',amount:10},lootSource:'DestructibleGargoyle',prototypePool:'Coin 60 : Card 30; unsupported town Reroll entry excluded'};
      }
      d.wildLootPlaced=true;
    }
    populateGems(){
      const d=this.dungeon;if(!d?.gemSites)return;
      for(const [i,p] of d.gemSites.entries()){const k=dungeon.key(p.x,p.y);if(!d.objects[k])d.objects[k]={id:`gem-${this.floor}-${i}`,type:'gemchest',active:true};}
    }
    gemOffers(id){
      const random=rng(this.seed+':gems:'+id),pool=[...gems.enabled],result=[];
      const bonus=this.combatVersion>=9&&rng(this.seed+':gem-luck:'+id)()<this.gemLuckChance()?1:0;
      const count=Math.min(gems.catalog.gemChoiceConfig.MaxChoices,3+bonus);
      // The native modal defaults to three options. The eight-effect pool and
      // two chest sites per floor are this prototype's supported subset.
      while(result.length<count&&pool.length){const total=pool.reduce((a,k)=>a+gems.catalog.gems[k].weight,0);let roll=random()*total,index=pool.length-1;
        for(let i=0;i<pool.length;i++){roll-=gems.catalog.gems[pool[i]].weight;if(roll<0){index=i;break;}}
        result.push(pool.splice(index,1)[0]);}
      return result;
    }
    gemLuckChance(){return Math.max(0,Math.min(1,this.combatSettings().luck/100*gems.catalog.gemChoiceConfig.LuckChanceModifier));}
    gemObject(){return this.gemChoice?.source==='boss'?this.bossReward?.gem:this.dungeon?.objects?.[this.gemChoice?.objectKey];}
    chooseGem(key){
      const obj=this.gemObject();
      if(this.phase!=='gem'||!obj?.offers?.includes(key))return {ok:false,reason:'请选择箱内的宝石'};
      if(!this.deck.some(c=>gems.canInsert(c,key).ok))return {ok:false,reason:'没有兼容卡牌，请更换宝石或暂时离开'};
      if(this.gemChoice.selected===key)return {ok:true,changed:false,reason:'已选择这颗宝石，请选择卡牌完成镶嵌'};
      this.gemChoice.selected=key;return {ok:true};
    }
    socketGem(id){
      if(this.phase!=='gem')return {ok:false,reason:'请先打开宝石箱'};
      const card=this.deck.find(c=>c.id===id),key=this.gemChoice?.selected,obj=this.gemObject();
      if(!card||!obj?.active||!obj.offers?.includes(key))return {ok:false,reason:'请先选择宝石和卡牌'};
      const legal=gems.canInsert(card,key);if(!legal.ok)return legal;
      card.gems=[...gems.installed(card),key];obj.active=false;obj.broken=true;
      this.log('socket',`将「${gems.catalog.gems[key].name}」镶入「${definition(card).name}」 #${card.id}`,{cardId:id,gem:key});
      const fromBoss=this.gemChoice.source==='boss';this.gemChoice=null;
      if(fromBoss)this.finishBossReward('gem');else this.phase='map';return {ok:true};
    }
    cancelGem(){if(this.phase!=='gem')return false;const fromBoss=this.gemChoice?.source==='boss';if(!fromBoss){this.noteService(this.gemChoice.objectKey,'declined');this.log('service_deferred','暂缓镶嵌；新增卡牌或扩槽后可以再来。');}this.gemChoice=null;this.phase=fromBoss?'bossreward':'map';return true;}
    addGemSlot(id){
      if(this.phase!=='shop')return {ok:false,reason:'请到商店扩充槽位'};
      const card=this.deck.find(c=>c.id===id),meta=card&&gems.metadata(card);
      if(!card||!meta||gems.slotCount(card)>=meta.maxSlots)return {ok:false,reason:'已达到此卡的槽位上限'};
      const info=this.slotExpansionInfo(id);if(info.used>=info.limit)return {ok:false,reason:'本次探索同名卡最多扩槽两次'};
      if(this.gold<info.price)return {ok:false,reason:`扩槽需要${info.price}金币`};
      // Native blacksmith upgrades a card configuration. Run-local currency and
      // shop placement replace its persistent town economy in this prototype.
      this.gold-=info.price;this.slotUpgrades??={};const slots=gems.slotCount(card)+1,key=card.baseKey||card.key;this.slotUpgrades[key]=slots;
      if(this.worldRulesVersion>=15){this.slotExpansionCounts??={};this.slotExpansionCounts[key]=info.used+1;}
      for(const c of this.deck)if((c.baseKey||c.key)===key)c.gemSlots=slots;
      this.log('slots',`「${catalog.cards[card.key].name}」全部同类卡扩充至 ${slots} 槽，花费${info.price}金币`);return {ok:true};
    }
    slotExpansionInfo(id){
      const c=this.deck.find(c=>c.id===id),key=c?.baseKey||c?.key,meta=c&&gems.metadata(c),used=this.slotExpansionCounts?.[key]??Math.max(0,(this.slotUpgrades?.[key]??meta?.slots??0)-(meta?.slots||0));
      return {used,limit:this.worldRulesVersion>=15?2:Infinity,price:this.worldRulesVersion>=15?100:50,full:!meta||gems.slotCount(c)>=meta.maxSlots||(this.worldRulesVersion>=15&&used>=2)};
    }
    digStep(){
      if(this.phase!=='digging'||!this.dig||this.dig.floor!==this.floor||this.dig.steps>=this.dig.total)return false;
      const d=this.dig,base=Math.trunc(d.bonus/d.total);d.steps++;
      const coins=base+(d.steps===d.total?d.bonus-base*d.total:0);
      this.gold+=coins;this.stats.goldEarned+=coins;d.paid+=coins;
      this.log('dig',`挖掘 ${d.steps}/${d.total}，获得 ${coins} 金币`,{coins,step:d.steps});
      if(d.steps===d.total){this.dungeon.exit.used=true;this.phase='gate';this.nextFloor();}
      return true;
    }
    encounter(node){
      const f=this.floor, random=rng(this.seed+':encounter:'+node.id);
      if(this.combatVersion>=9){const group=encounters.create({floor:f,node,catalog,xp:progression.enemies,random,rulesVersion:this.encounterRulesVersion||9});if(this.combatVersion>=10)for(const e of group){const data=engine.wildV10.enemyResistances[e.assetId]||{};e.instakillResist=e.encounterRole==='boss'?.9:data.instakill||0;e.freezeResistance=data.freeze||0;e.resistanceSource=e.encounterRole==='boss'?'Prototype guardian resistance (90%)':data.source;}return group;}
      let keys=node.type==='boss'?['lion','ghost']:node.type==='elite'?['lion','zombie']:node.stage===0?['ghost','zombie']:['ghost','zombie','lion'];
      keys=shuffle(keys,random);
      return keys.map((key,i)=>{
        const e=copy(catalog.enemies[key]);
        const boss=node.type==='boss'&&key==='lion';
        const scale=boss?1.4+f*.45:node.type==='elite'?1.05+f*.22:.8+f*.2;
        e.health=Math.round(e.health*scale);
        if(boss)e.name=f===this.totalFloors?'永夜守门者':`第${f}层守关者`;
        else if(node.type==='elite')e.name='精英'+e.name;
        // Prototype encounter tuning, not the original game's enemy level formula.
        e.intents=e.intents.map(intent=>({...intent,actions:intent.actions.map(a=>({...a,value:a.kind==='attack'?a.value+f-1+(node.type==='elite'?1:0)+(boss?f+1:0):a.value}))}));
        if(boss){e.armor=10*f;e.intents[0].weight=80;e.intents[1].weight=20;}
        return e;
      });
    }
    settleBattle(){
      if(this.phase==='levelup'&&this.floor===this.totalFloors&&this.currentRoom()?.type==='boss'&&this.battle?.phase==='victory'){this.pendingLevels=[];this.levelChoice=null;this.phase='battle';}
      if(this.progressionVersion>=7&&this.phase==='battle'){const finalVictory=this.floor===this.totalFloors&&this.currentRoom()?.type==='boss'&&this.battle?.phase==='victory';this.syncExperience();if(finalVictory&&this.phase==='levelup'){this.pendingLevels=[];this.levelChoice=null;this.phase='battle';}if(this.phase==='levelup')return false;}
      if(this.phase!=='battle'||!['victory','defeat'].includes(this.battle?.phase))return false;
      const b=this.battle, node=this.currentRoom();this.health=b.player.health;this.maxHealth=b.player.maxHealth;
      if(this.character){this.combatBonuses??={growth:0};this.combatBonuses.growth=Math.max(0,(b.player.growth||0)-(characters[this.character].statModifiers.growthModifier||0));}
      if(this.combatVersion>=10)for(const key of ['greed','duration','curse','revival','revivalStacks'])this.combatBonuses[key]=Math.max(0,(b.player[key]||0)-(characters[this.character]?.statModifiers[key+'Modifier']||0));
      if(this.combatVersion>=9)this.combatBonuses.luck=Math.max(0,(b.player.luck||0)-engine.wildCards.luckStat.base-(characters[this.character]?.statModifiers.luckModifier||0));
      this.stats.turns+=b.turn;this.stats.kills+=b.enemies.filter(e=>e.health<=0).length;
      this.battles.push({room:this.current,...b.export()});
      if(b.phase==='defeat'){this.phase='lost';this.log('defeat','探索在这里结束。');return true;}
      if(this.combatVersion>=10&&b.player.recovery>0){const before=this.health,amount=Math.min(b.player.recovery,Math.max(0,this.maxHealth-before));this.health+=amount;b.player.health=this.health;this.log('recovery',`战后恢复 ${amount} 生命（${before} → ${this.health}）`,{amount,before,after:this.health,pending:b.player.recovery});}
      this.stats.wins++;const coins=20+this.floor*5+(node.type==='elite'?15:node.type==='boss'?30:0);
      this.gold+=coins;this.stats.goldEarned+=coins;this.log('victory',`战斗获胜，获得 ${coins} 金币`,{gold:coins});
      if(node.type==='boss'&&this.floor===this.totalFloors){this.completed.push(this.current);this.phase='won';this.log('complete',`永夜守门者倒下。${this.totalFloors} 层地窖全部通关。`);return true;}
      if(this.progressionVersion>=7){this.reward=null;this.completeRoom();if(this.progressionVersion>=8&&node.type==='boss'){if(this.combatVersion>=10)this.openBossReward();else this.openEvolution();}return true;}
      const keys=shuffle(Object.keys(catalog.cards).filter(k=>!['character','wild'].includes(catalog.cards[k].kind)&&!catalog.cards[k].isEvolved),rng(this.seed+':reward:'+this.current)).slice(0,3);
      this.reward={gold:coins,choices:keys.map(key=>({key,level:this.progressionVersion<7&&(node.type==='elite'||node.type==='boss')&&this.canUpgrade({key,level:0})?1:0}))};this.phase='reward';return true;
    }
    claimReward(index){
      if(this.phase!=='reward'||!Number.isInteger(index)||index< -1||index>=this.reward.choices.length)return {ok:false,reason:'奖励已处理或选择无效'};
      if(index>=0){const offer=this.reward.choices[index],card=this.makeCard(offer.key,offer.level);this.deck.push(card);this.log('reward',`获得「${definition(card).name}」`,{card:copy(card)});}
      else this.log('reward_skip','跳过卡牌奖励，保持精简牌组。');
      this.reward=null;this.completeRoom();return {ok:true};
    }
    completeRoom(){
      if(!this.completed.includes(this.current))this.completed.push(this.current);
      dungeon.refreshExit(this.dungeon,this.completed);
      this.phase=!this.dungeon&&this.currentRoom().type==='boss'?'gate':'map';
    }
    openBossReward(){
      if(this.floor>=this.totalFloors||!['map','gate'].includes(this.phase)||this.currentRoom()?.type!=='boss'||!this.completed.includes(this.current)||(this.bossRewardFloors||[]).includes(this.floor))return false;
      const choices=shuffle(this.availableCards(),rng(this.seed+':boss-cards:'+this.floor)).slice(0,3).map(key=>({key,level:0}));
      this.bossReward={floor:this.floor,returnPhase:this.phase,cards:choices,gem:{type:'gemchest',active:true,offers:this.gemOffers('boss-'+this.floor)}};
      this.phase='bossreward';return true;
    }
    canChooseBossGem(){const g=this.bossReward?.gem;return !!g&&this.deck.some(c=>(g.inspected?g.offers:gems.enabled).some(key=>gems.canInsert(c,key).ok));}
    chooseBossReward(kind){
      if(this.phase!=='bossreward'||!this.bossReward)return {ok:false,reason:'当前没有守关奖励'};
      if(kind==='evolution'){
        if(!this.evolutionChoices().length)return {ok:false,reason:'还没有满足配方的材料，请选择卡牌或宝石'};
        this.evolution={floor:this.floor,returnPhase:'bossreward',choices:this.evolutionChoices()};this.phase='evolution';
      }else if(kind==='card')this.phase='bosscard';
      else if(kind==='gem'){if(!this.canChooseBossGem())return {ok:false,reason:'没有兼容卡牌，请选择新牌或进化'};this.bossReward.gem.inspected=true;this.gemChoice={source:'boss',selected:null};this.phase='gem';}
      else return {ok:false,reason:'请选择一种奖励'};
      return {ok:true};
    }
    claimBossCard(index){
      if(this.phase!=='bosscard'||!Number.isInteger(index)||!this.bossReward?.cards[index])return {ok:false,reason:'请选择一张奖励牌'};
      const card=this.makeCard(this.bossReward.cards[index].key);this.deck.push(card);this.log('boss_card',`守关奖励：获得「${definition(card).name}」`,{cardId:card.id});
      this.finishBossReward('card');return {ok:true};
    }
    returnToBossReward(){if(!this.bossReward||!['bosscard','evolution'].includes(this.phase))return false;this.evolution=null;this.phase='bossreward';return true;}
    finishBossReward(kind){
      if(!this.bossReward)return false;this.bossRewardFloors??=[];this.bossRewardFloors.push(this.floor);
      this.log('boss_reward',`领取守关奖励：${kind}`,{kind});this.phase=this.bossReward.returnPhase;this.bossReward=null;return true;
    }
    evolutionChoices(){
      const choices=[];
      for(const recipe of enabledEvolutionRecipes(this)){
        for(const components of evolutionCombinations(recipe,this.deck)){
          const weapon=components[0];
          if(evolutionWeaponIssue(recipe,weapon))continue;
          choices.push({id:`${recipe.id}:${components.map(c=>c.id).join(':')}`,recipeId:recipe.id,resultKey:recipe.resultKey,resultName:catalog.cards[recipe.resultKey].name,
            weaponId:weapon.id,supportId:components[1]?.id,componentIds:components.map(c=>c.id),components:components.map(c=>({id:c.id,key:c.key,name:definition(c).name})),
            inheritedGems:gems.installed(weapon),lostSupportGems:components.slice(1).flatMap(c=>gems.installed(c)),gemSlots:gems.slotCount(weapon)});
        }
      }return choices;
    }
    rewardEvolutionHints(offer){
      const offered=catalog.cards[offer?.key];if(!offered)return [];
      // Preview a new instance without allocating an ID, changing the deck or
      // consuming the reward. Slot upgrades match makeCard's acquisition path.
      const candidate={...offer,gemRulesVersion:this.gemRulesVersion,id:Symbol('reward-preview'),level:offer.level||0,gems:[...(offer.gems||[])],gemSlots:offer.gemSlots??this.slotUpgrades?.[offer.key]??gems.slotCount(offer)};
      const deck=[...this.deck,candidate],hints=[];
      for(const recipe of enabledEvolutionRecipes(this).filter(r=>r.componentGroups.includes(offered.group))){
        let best=null,bestRank=Infinity;
        for(const components of evolutionCombinations(recipe,deck,{candidate,partial:true})){
          const missingCount=components.filter(c=>!c).length,slotIssue=evolutionWeaponIssue(recipe,components[0]),rank=missingCount*10+(slotIssue?1:0);
          if(rank>=bestRank)continue;
          best={components,missingCount,slotIssue};bestRank=rank;if(rank===0)break;
        }
        if(!best)continue;
        const components=best.components.map((card,i)=>{
          const key=card?.key||recipe.componentKeys[i].find(k=>catalog.cards[k]),def=key?definition({key,level:card?.level||0}):null;
          return {group:recipe.componentGroups[i],id:card&&card!==candidate?card.id:null,key,name:def?.name||recipe.componentGroups[i],english:def?.english||def?.name||recipe.componentGroups[i],isOffer:card===candidate,missing:!card};
        });
        const weapon=best.components[0],result=catalog.cards[recipe.resultKey];
        hints.push({recipeId:recipe.id,resultKey:recipe.resultKey,resultName:result.name,resultEnglish:result.english||result.name,
          status:best.missingCount?'progress':best.slotIssue?'needsSocket':'ready',components,missingGroups:components.filter(c=>c.missing).map(c=>c.group),missingCards:components.filter(c=>c.missing),
          weaponId:weapon&&weapon!==candidate?weapon.id:null,gemSlots:weapon?gems.slotCount(weapon):null,inheritedGems:weapon?gems.installed(weapon):[],slotIssue:best.slotIssue});
      }
      const order={ready:0,needsSocket:1,progress:2};return hints.sort((a,b)=>order[a.status]-order[b.status]||a.missingCards.length-b.missingCards.length);
    }
    openEvolution(){
      if(this.progressionVersion<8||this.floor>=this.totalFloors||!['map','gate'].includes(this.phase)||this.currentRoom()?.type!=='boss'||!this.completed.includes(this.current)||(this.evolutionFloors||[]).includes(this.floor))return false;
      // The original insertion/consumption rules are retained; this floor-end
      // station is an authored access point until original placement is known.
      this.evolution={floor:this.floor,returnPhase:this.phase,choices:this.evolutionChoices()};this.phase='evolution';return true;
    }
    finishEvolution(){
      this.evolutionFloors??=[];this.evolutionFloors.push(this.floor);
      const fromBoss=this.evolution.returnPhase==='bossreward';this.phase=this.evolution.returnPhase;this.evolution=null;if(fromBoss)this.finishBossReward('evolution');
    }
    fuse(choiceId){
      if(this.phase!=='evolution'||!this.evolution)return {ok:false,reason:'当前没有进化机会'};
      const requested=Number.isInteger(choiceId)?this.evolution.choices[choiceId]?.id:choiceId;
      const choice=this.evolutionChoices().find(c=>c.id===requested);
      if(!choice||!this.evolution.choices.some(c=>c.id===requested))return {ok:false,reason:'材料不足或卡牌数据不兼容'};
      const weapon=this.deck.find(c=>c.id===choice.weaponId),result=this.makeCard(choice.resultKey);
      result.baseKey=weapon.baseKey||weapon.key;result.evolutionRecipe=choice.recipeId;result.gemSlots=gems.slotCount(weapon);result.gems=[...gems.installed(weapon),'evolve'];
      if(this.gemRulesVersion>=14){result.evolved=true;result.gems=gems.installed(weapon);}
      if(!gems.validate(result).ok){this.nextCardId--;return {ok:false,reason:'进化宝石与材料不兼容'};}
      this.deck=this.deck.filter(c=>!choice.componentIds.includes(c.id));this.deck.push(result);
      this.log('evolution',`消耗${choice.components.map(c=>`「${c.name}」`).join('与')}，获得「${choice.resultName}」。继承主武器的槽位和宝石；${this.gemRulesVersion>=14?'进化不占槽位':'进化宝石占用一槽'}。`,{recipeId:choice.recipeId,consumed:choice.componentIds,card:copy(result),lostSupportGems:choice.lostSupportGems});
      this.finishEvolution();return {ok:true,card:copy(result)};
    }
    skipEvolution(){
      if(this.phase!=='evolution'||!this.evolution)return {ok:false,reason:'当前没有进化机会'};
      if(this.evolution.returnPhase==='bossreward'){this.returnToBossReward();return {ok:true};}
      this.log('evolution_skip','跳过本层进化机会。');this.finishEvolution();return {ok:true};
    }
    nextFloor(){
      if(this.phase!=='gate'||this.floor>=this.totalFloors)return false;
      const physicalExit=this.dungeon?.version>=4;
      if(physicalExit&&!this.dungeon.exit.used)return false;
      this.floor++;this.stage=-1;this.current=null;this.battle=null;this.shop=null;
      if(this.dungeon){this.dungeon=dungeon.build(this.seed,this.floor,this.maps[this.floor-1]);this.populateGems();this.populateGrowth();this.populateWildLoot();this.populateRemoval();this.populateLootEconomy();}
      const restored=physicalExit?0:Math.min(8,this.maxHealth-this.health);this.health+=restored;this.phase='map';this.dig=null;
      this.log('descend',`进入第 ${this.floor} 层${restored?`，旧版楼梯恢复 ${restored} 生命`:''}`);return true;
    }
    makeShop(node){
      if(this.shopRulesVersion>=14)return {nodeId:node.id,offers:this.rollShopOffers(node.id,0),refreshCount:0,healed:false,removed:false};
      const shop={offers:shuffle(this.progressionVersion>=7?this.availableCards():Object.keys(catalog.cards).filter(k=>!['character','wild'].includes(catalog.cards[k].kind)&&!catalog.cards[k].isEvolved),rng(this.seed+':shop:'+node.id)).slice(0,3).map((key,i)=>{
        const level=this.progressionVersion<7&&this.floor>=2&&i===0&&this.canUpgrade({key,level:0})?1:0;
        return {id:i,key,level,price:35+level*20,sold:false};
      }),healed:false,removed:false};
      if(this.combatVersion>=9&&this.floor===1)shop.offers[shop.offers.length-1]={id:shop.offers.length-1,key:'cloverPetal',level:0,price:engine.wildCards.acquisitionAdapter.price,sold:false,acquisitionAdapter:true};
      return shop;
    }
    rollShopOffers(nodeId,refreshCount,previous=[]){
      const ordinary=this.availableCards(),wild=Object.keys(catalog.cards).filter(key=>{const d=catalog.cards[key];return d.kind==='wild'&&d.runtimeEnabled&&!d.sourceDisabled;});
      const pool=[...new Set([...ordinary,...wild])],rolled=shuffle(pool,rng(this.seed+':shop-v14:'+nodeId+':'+refreshCount));
      const keys=rolled.slice(0,3);
      // A paid refresh should visibly change the assortment when alternatives exist.
      if(rolled.length>keys.length&&keys.every(key=>previous.some(o=>o.key===key)))keys[keys.length-1]=rolled[keys.length];
      return keys.map((key,i)=>({id:refreshCount*3+i,key,level:0,price:this.shopCardPrice(key),sold:false}));
    }
    shopCardPrice(key,level=0){
      const def=catalog.cards[key];
      return def.costType==='wild'?(this.shopPriceVersion>=21?(def.destroyOnPlay?10:100):15):35+level*20;
    }
    enableShopPricesV21(){
      if(this.shopRulesVersion<14)return false;
      let changed=this.shopPriceVersion!==21;
      this.shopPriceVersion=21;
      for(const shop of new Set([this.shop,...Object.values(this.dungeon?.shops||{})])){
        for(const offer of shop?.offers||[])if(!offer.sold&&catalog.cards[offer.key]?.costType==='wild'){
          const price=this.shopCardPrice(offer.key,offer.level||0);if(offer.price!==price){offer.price=price;changed=true;}
        }
      }
      return changed;
    }
    enableShopV14(){
      if(this.progressionVersion<8||this.shopRulesVersion>=14)return false;
      this.shopRulesVersion=14;
      for(const [nodeId,shop] of Object.entries(this.dungeon?.shops||{})){shop.nodeId=nodeId;shop.refreshCount??=0;}
      if(this.shop){this.shop.nodeId??=this.current;this.shop.refreshCount??=0;if(this.dungeon&&this.currentRoom()?.type==='shop')this.dungeon.shops[this.current]=this.shop;}
      return true;
    }
    shopRefreshCost(){
      const count=this.shop?.refreshCount||0;
      return count===0?25:count*50;
    }
    refreshShop(){
      if(this.phase!=='shop'||!this.shop||this.shopRulesVersion<14)return {ok:false,reason:'当前不能刷新商店'};
      const price=this.shopRefreshCost();if(this.gold<price)return {ok:false,reason:'金币不足'};
      const count=(this.shop.refreshCount||0)+1,nodeId=this.shop.nodeId||this.current;
      const offers=this.rollShopOffers(nodeId,count,this.shop.offers);
      this.gold-=price;this.shop.offers=offers;this.shop.refreshCount=count;this.shop.nodeId=nodeId;
      this.log('shop_refresh',`花费 ${price} 金币刷新商品，下次需要 ${this.shopRefreshCost()} 金币`,{room:nodeId,refreshCount:count,price});
      return {ok:true,price,nextPrice:this.shopRefreshCost()};
    }
    buy(index){
      if(this.phase!=='shop')return {ok:false,reason:'不在商店中'};
      const offer=this.shop.offers.find(o=>o.id===index);
      if(!offer||offer.sold)return {ok:false,reason:'商品已售出'};
      if(this.gold<offer.price)return {ok:false,reason:'金币不足'};
      this.gold-=offer.price;offer.sold=true;const card=this.makeCard(offer.key,offer.level);this.deck.push(card);this.log('buy',`花费 ${offer.price} 金币购买「${definition(card).name}」`);return {ok:true};
    }
    buyHeal(){
      if(this.phase!=='shop'||this.shop.healed)return {ok:false,reason:'本店药剂已售出'};
      if(this.health>=this.maxHealth)return {ok:false,reason:'生命已满'};
      if(this.gold<25)return {ok:false,reason:'金币不足'};
      const gain=Math.min(18,this.maxHealth-this.health);this.gold-=25;this.health+=gain;this.shop.healed=true;this.log('heal',`花费25金币，恢复 ${gain} 生命`);return {ok:true};
    }
    upgradeCost(id){const card=this.deck.find(c=>c.id===id);return card?45+(card.level||0)*20:Infinity;}
    canUpgrade(card){
      if(!card||(card.level||0)>=2)return false;
      const a=definition(card),b=definition({...card,level:(card.level||0)+1});
      return ['baseDamage','baseAmount','drawCount','armor'].some(key=>a[key]!==b[key]);
    }
    upgrade(id){
      if(this.progressionVersion>=7)return {ok:false,reason:'当前规则不提供普通卡牌升级'};
      if(!['shop','camp'].includes(this.phase))return {ok:false,reason:'只能在商店或营地升级'};
      const card=this.deck.find(c=>c.id===id);if(!card||(card.level||0)>=2)return {ok:false,reason:'这张牌已达当前升级上限'};
      if(!this.canUpgrade(card))return {ok:false,reason:'此档仅改变本原型尚未实现的属性，不收取升级费用'};
      const price=this.phase==='shop'?this.upgradeCost(id):0;if(this.gold<price)return {ok:false,reason:'金币不足'};
      this.gold-=price;card.level=(card.level||0)+1;this.stats.upgrades++;this.log('upgrade',`升级「${definition(card).name}」${price?`，花费${price}金币`:'（营地免费）'}`,{cardId:id});
      if(this.phase==='camp')this.completeRoom();return {ok:true};
    }
    removeCard(id){
      if(this.worldRulesVersion>=15){
        const d=this.dungeon,obj=d?.objects?.[this.removalChoice?.objectKey];
        if(this.phase!=='removal'||!obj?.active||obj.type!=='removal'||d.removalEvent?.used)return {ok:false,reason:'请在地图的遗忘祭坛免费删牌'};
        const index=this.deck.findIndex(c=>c.id===id);
        if(index<0||catalog.cards[this.deck[index].key].kind==='character')return {ok:false,reason:'不能移除当前角色卡'};
        if(this.deck.length<=2)return {ok:false,reason:'牌组至少保留角色卡和另一张牌'};
        const [card]=this.deck.splice(index,1);obj.active=false;obj.broken=true;d.removalEvent.used=true;this.removalChoice=null;this.phase='map';
        this.log('remove',`遗忘祭坛：免费移除「${definition(card).name}」，本层机会已使用。`,{cardId:id});return {ok:true};
      }
      if(this.phase!=='shop'||this.shop.removed)return {ok:false,reason:'本店移除服务已使用'};
      if(this.deck.length<=(this.progressionVersion>=8?4:8))return {ok:false,reason:`牌组至少保留${this.progressionVersion>=8?4:8}张`};
      if(this.gold<30)return {ok:false,reason:'金币不足'};
      const index=this.deck.findIndex(c=>c.id===id);if(index<0)return {ok:false,reason:'牌不在牌组中'};
      if(catalog.cards[this.deck[index].key].kind==='character')return {ok:false,reason:'不能移除当前角色卡'};
      const [card]=this.deck.splice(index,1);this.gold-=30;this.shop.removed=true;this.log('remove',`花费30金币移除「${definition(card).name}」`);return {ok:true};
    }
    rest(){
      if(this.phase!=='camp')return {ok:false,reason:'不在营地中'};
      const gain=Math.min(18,this.maxHealth-this.health);this.health+=gain;this.log('rest',`营地休息，恢复 ${gain} 生命`,{amount:gain});this.completeRoom();
      return {ok:true,healGain:gain,notice:gain?`篝火 · 生命 +${gain}`:'生命已满，篝火已休息',...(gain&&this.dungeon?{feedback:{kind:'collect',x:this.dungeon.x,y:this.dungeon.y,reward:{kind:'heal',amount:gain}}}:{})};
    }
    openTreasure(choice){
      if(this.worldRulesVersion>=16&&this.dungeon){
        if(this.phase==='treasure')this.phase='map';
        return this.openChestAt(this.dungeon.x,this.dungeon.y);
      }
      if(this.worldRulesVersion>=15){
        if(this.phase!=='treasure'||this.completed.includes(this.current))return {ok:false,reason:'宝箱已经收集'};
        this.gold+=100;this.stats.goldEarned+=100;this.log('treasure','撞开宝箱，收集100金币。');this.completeRoom();return {ok:true,stationary:true,goldGain:100,notice:'宝箱 · 金币 +100'};
      }
      if(this.phase!=='treasure'||!['gold','vitality'].includes(choice))return {ok:false,reason:'宝箱已经处理'};
      if(choice==='gold'){this.gold+=30;this.stats.goldEarned+=30;this.log('treasure','从宝箱中取出30金币。');}
      else {this.maxHealth+=5;this.health=Math.min(this.maxHealth,this.health+5);this.log('treasure','生命上限增加5，恢复5生命。');}
      this.completeRoom();return {ok:true};
    }
    leave(){if(!['shop','camp'].includes(this.phase))return false;if(this.phase==='shop'&&this.dungeon)this.noteService(dungeon.key(this.dungeon.x,this.dungeon.y),'declined');this.log('leave',`离开${this.currentRoom().name}`);if(this.dungeon&&this.phase==='camp')this.phase='map';else this.completeRoom();return true;}
    snapshot(){const data=copy({...this,battle:null});return {format:'duskvault-run-v2',data,battle:this.battle?.snapshot()||null};}
    static restore(save){
      if(save?.format!=='duskvault-run-v2'||!save.data)throw Error('存档版本不支持');
      const d=copy(save.data);d.totalFloors??=3;if(![3,5].includes(d.totalFloors))throw Error('楼层数量无效');
      const phases=['map','battle','reward','shop','camp','treasure','gate','digging','gem','levelup','evolution','bossreward','bosscard','removal','won','lost'];
      if(!phases.includes(d.phase)||!Number.isInteger(d.floor)||d.floor<1||d.floor>d.totalFloors||!Array.isArray(d.deck)||d.deck.length<(d.progressionVersion>=8?2:8)||d.deck.length>100||d.deck.some(c=>!gems.validate(c).ok||!catalog.cards[c.key]||!Number.isInteger(c.id)||!Number.isInteger(c.level)||c.level<0||c.level>2)||new Set(d.deck.map(c=>c.id)).size!==d.deck.length||!Number.isFinite(d.health)||d.health<0||d.health>d.maxHealth||!Number.isFinite(d.gold)||d.gold<0)throw Error('存档内容无效');
      if(d.deck.some(c=>catalog.cards[c.key].isEvolved&&!c.baseKey||c.baseKey&&!evolutionRecipes.some(r=>r.id===c.evolutionRecipe&&r.resultKey===c.key&&r.componentGroups[0]===catalog.cards[c.baseKey]?.group)))throw Error('进化卡来源无效');
      if(d.progressionVersion>=8&&(!characters[d.character]||d.deck.filter(c=>catalog.cards[c.key].kind==='character').length!==1||!d.deck.some(c=>c.key===characters[d.character].cardKey)))throw Error('角色存档无效');
      if(d.growth&&['mana','deal'].some(k=>!Number.isInteger(d.growth[k])||d.growth[k]<0||d.growth[k]>pickups.bounds.technicalMaxMana))throw Error('成长存档无效');
      const run=Object.assign(Object.create(Run.prototype),d);run.battle=save.battle?Battle.restore(save.battle):null;
      if(run.phase==='removal'&&(run.worldRulesVersion<15||!run.dungeon?.objects?.[run.removalChoice?.objectKey]?.active||run.dungeon.objects[run.removalChoice.objectKey].type!=='removal'||run.dungeon.removalEvent?.used||run.dungeon.removalEvent?.key!==run.removalChoice.objectKey))throw Error('删牌事件存档无效');
      if(run.slotExpansionCounts&&Object.values(run.slotExpansionCounts).some(n=>!Number.isInteger(n)||n<0))throw Error('扩槽次数无效');
      if(run.shopRulesVersion>=14)for(const shop of new Set([run.shop,...Object.values(run.dungeon?.shops||{})].filter(Boolean))){
        if(!Number.isSafeInteger(shop.refreshCount)||shop.refreshCount<0||!Number.isSafeInteger(shop.refreshCount*50)||!Number.isSafeInteger(shop.refreshCount*3+2)||!Array.isArray(shop.offers)||!shop.offers.length||shop.offers.length>3||shop.offers.some(o=>!catalog.cards[o.key]||catalog.cards[o.key].kind==='character'||catalog.cards[o.key].isEvolved||!Number.isSafeInteger(o.id)||!Number.isSafeInteger(o.price)||o.price<0||typeof o.sold!=='boolean'))throw Error('商店存档无效');
      }
      if(!Object.prototype.hasOwnProperty.call(d,'dungeon')){
        run.dungeon=dungeon.buildLegacy(run.seed,run.floor,run.maps[run.floor-1]);
        const entry=Object.entries(run.dungeon.rooms).find(([,r])=>r.id===run.current);
        if(entry){[run.dungeon.x,run.dungeon.y]=entry[0].split(',').map(Number);dungeon.reveal(run.dungeon);}
        if(run.shop&&run.currentRoom()?.type==='shop')run.dungeon.shops[run.current]=run.shop;
        if(run.phase==='gate')run.phase='map';
      }
      if(run.dungeon){dungeon.validate(run.dungeon);if(run.phase==='shop')run.dungeon.shops[run.current]=run.shop;}
      if(run.phase==='digging'&&(!run.dungeon?.exit?.ready||run.dig?.floor!==run.floor||!Number.isInteger(run.dig.steps)||run.dig.steps<0||run.dig.steps>=3||run.dig.total!==3||run.dig.bonus!==100||run.dig.paid!==33*run.dig.steps))throw Error('挖掘存档无效');
      if(run.progressionVersion>=7){if(!Number.isInteger(run.level)||run.level<1||!Number.isFinite(run.xp)||run.xp<0||!Array.isArray(run.pendingLevels)||!Number.isInteger(run.xpCursor))throw Error('经验存档无效');if(run.phase==='levelup'&&(!run.battle||!run.levelChoice?.choices?.length||run.levelChoice.level!==run.pendingLevels[0]||run.levelChoice.choices.some(c=>!catalog.cards[c.key])))throw Error('升级选择存档无效');}
      if(run.phase==='gem'){const obj=run.gemObject();if(obj?.type!=='gemchest'||!obj.active||!Array.isArray(obj.offers)||obj.offers.length<3||obj.offers.length>(run.combatVersion>=9?4:3)||new Set(obj.offers).size!==obj.offers.length||obj.offers.some(k=>!gems.enabled.includes(k))||(run.gemChoice.selected!==null&&!obj.offers.includes(run.gemChoice.selected)))throw Error('宝石存档无效');}
      if(run.bossReward){const r=run.bossReward;if(run.combatVersion<10||r.floor!==run.floor||run.floor>=run.totalFloors||!['map','gate'].includes(r.returnPhase)||run.currentRoom()?.type!=='boss'||!run.completed.includes(run.current)||(run.bossRewardFloors||[]).includes(run.floor)||!Array.isArray(r.cards)||!r.cards.length||r.cards.some(c=>!catalog.cards[c.key])||!r.gem?.active||!r.gem.offers?.every(k=>gems.enabled.includes(k)))throw Error('守关奖励存档无效');}
      if((['bossreward','bosscard'].includes(run.phase)||run.gemChoice?.source==='boss'||run.evolution?.returnPhase==='bossreward')&&!run.bossReward)throw Error('缺少守关奖励');
      if(run.phase==='battle'&&!run.battle)throw Error('缺少战斗状态');
      if(run.phase==='evolution'){
        if(run.progressionVersion<8||run.evolution?.floor!==run.floor||run.floor>=run.totalFloors||!['map','gate','bossreward'].includes(run.evolution.returnPhase)||run.currentRoom()?.type!=='boss'||!run.completed.includes(run.current)||(run.evolutionFloors||[]).includes(run.floor))throw Error('进化存档无效');
        run.evolution.choices=run.evolutionChoices();
      }
      if(!Array.isArray(run.maps)||run.maps.length!==run.totalFloors||run.available().some(n=>!roomNames[n.type]))throw Error('地图存档无效');
      if(run.tutorial)return (typeof module!=='undefined'&&module.exports?require('./tutorial.js'):root.CrawlerTutorial).restore(run);
      return run;
    }
    export(){return {...this.snapshot(),catalogSources:catalog.sources,gemSources:gems.catalog.sources,pickupSources:pickups.sources,progressionSources:progression.sources};}
  }
  const api={Run,floorNames,roomNames,characters};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerRun=api;
})(typeof globalThis!=='undefined'?globalThis:this);
