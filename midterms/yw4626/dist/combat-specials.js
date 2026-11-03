/* Native effect constants with an explicit, deterministic browser arena adapter.
 * See SPECIAL_EFFECTS_V12_NATIVE.md for source addresses and geometry limits. */
(function(root){
  'use strict';
  const noFuture=Object.freeze({multiplier:Math.fround(.2),delay:Math.fround(.1),speed:30,minLifetime:.5,maxLifetime:2.5,margin:Math.fround(.02),minAngle:20,maxAngle:50});
  const runetracer=Object.freeze({...noFuture,speed:20,maxLifetime:1.5});
  const projectileConfig=def=>def.key==='noFuture'?noFuture:runetracer;
  const isAreaAttack=def=>['front-row','whip'].includes(def.attackPattern)||['bible','unholyVespers'].includes(def.key);
  function rearSplashDamage(damage,area=0,ratio=.2){return Math.max(0,damage*ratio*(1+area/100));}
  const areaConfig=Object.freeze({multiplier:Math.fround(.2),normalization:100,minSize:Math.fround(.1),maxSize:10});
  function areaInfo(def,player={},damage=0){
    const raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
    const normalized=raw?._ignoreArea?0:Math.fround(Math.fround((def.area||0)+(player.area||0))/100);
    return {normalized,multiplier:areaConfig.multiplier,damage:Math.max(0,normalized*damage*areaConfig.multiplier),size:Math.max(areaConfig.minSize,Math.min(areaConfig.maxSize,1+normalized*(raw?._areaSizeCoefficient??.5)))};
  }
  function roundEven(n){const low=Math.floor(n),f=n-low;return f===.5?(low%2===0?low:low+1):Math.round(n);}
  function explosionDamage(damage){return roundEven(damage*noFuture.multiplier);}
  // The shipped game uses a perspective camera and 3D collisions. These fixed
  // world units are our viewport adapter, independent of browser pixel size.
  const arena=Object.freeze({width:9,height:6,enemyY:3,columnSpan:7,radius:.2});
  function columnPosition(column,width=arena.width,height=arena.height){return {x:width/2+(column-2)*arena.columnSpan/4,y:height/2};}
  function traceProjectile({origin,direction,speed=noFuture.speed,duration=noFuture.maxLifetime,width=arena.width,height=arena.height,radius=arena.radius,initialColumn=null}={}){
    const bounds={left:width*noFuture.margin,right:width*(1-noFuture.margin),bottom:height*noFuture.margin,top:height*(1-noFuture.margin)};
    let x=origin.x,y=origin.y,dx=direction.x,dy=direction.y,time=0;
    const length=Math.hypot(dx,dy);if(!Number.isFinite(length)||length<=0||!Number.isFinite(speed)||speed<=0||!Number.isFinite(duration)||duration<0)throw Error('Invalid projectile path');
    dx/=length;dy/=length;
    if(x<bounds.left||x>bounds.right||y<bounds.bottom||y>bounds.top)throw Error('Projectile origin outside arena');
    const events=[],visited=new Set(initialColumn===null?[]:[initialColumn]);
    if(initialColumn!==null)events.push({type:'contact',time:0,column:initialColumn,position:{x,y}});
    while(time<duration-1e-9){
      const tx=Math.abs(dx)<1e-12?Infinity:((dx>0?bounds.right:bounds.left)-x)/(dx*speed);
      const ty=Math.abs(dy)<1e-12?Infinity:((dy>0?bounds.top:bounds.bottom)-y)/(dy*speed);
      const dt=Math.min(tx,ty,duration-time),distance=dt*speed;
      for(let column=0;column<5;column++){
        if(visited.has(column))continue;
        const p=columnPosition(column,width,height),rx=p.x-x,ry=p.y-y,along=rx*dx+ry*dy,perp2=Math.max(0,rx*rx+ry*ry-along*along);
        if(perp2>radius*radius)continue;
        const near=along-Math.sqrt(Math.max(0,radius*radius-perp2)),far=along+Math.sqrt(Math.max(0,radius*radius-perp2));
        if(far<0||near>distance)continue;
        const d=Math.max(0,near);visited.add(column);events.push({type:'contact',time:time+d/speed,column,position:{x:x+dx*d,y:y+dy*d}});
      }
      x+=dx*distance;y+=dy*distance;time+=dt;
      const hitX=tx<=dt+1e-9,hitY=ty<=dt+1e-9;
      if(hitX){events.push({type:'boundary',time,boundary:dx>0?'right':'left',position:{x,y}});dx=-dx;visited.clear();}
      if(hitY){events.push({type:'boundary',time,boundary:dy>0?'top':'bottom',position:{x,y}});dy=-dy;visited.clear();}
      if(!hitX&&!hitY)break;
    }
    return events.sort((a,b)=>a.time-b.time);
  }
  function projectileTimeline(effect,def,random,initialColumns=[0,1,2,3,4]){
    const raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
    const config=projectileConfig(def),speed=config.speed*(1+(raw?._amountSpeedCoefficient??.1)*(effect.hits/def.baseAmount-1));
    const timeline=[],angles=[];
    for(let wave=1;wave<=effect.hits;wave++){
      const column=initialColumns[Math.floor(random()*initialColumns.length)]??2,angle=(noFuture.minAngle+random()*(noFuture.maxAngle-noFuture.minAngle))*Math.PI/180;
      const direction={x:Math.cos(angle)*(random()<.5?-1:1),y:Math.sin(angle)*(random()<.5?-1:1)};
      // Launch interval follows the card's serialized min/max fire delay.
      const delay=raw?._minMaxFireDelay?.$values||[.1,.15];
      const launch=wave===1?0:angles.at(-1).launch+delay[0]+random()*(delay[1]-delay[0]);
      angles.push({launch});
      const size=Math.max(.1,Math.min(10,1+Math.fround(Math.fround(effect.area||0)/100)*(raw?._areaSizeCoefficient??.5))),radius=arena.radius*size;
      const events=traceProjectile({origin:columnPosition(column),direction,speed,duration:config.maxLifetime,radius,initialColumn:column});
      for(const event of events){
        timeline.push({...event,wave,time:launch+event.time});
        if(event.type==='boundary'&&def.key==='noFuture')timeline.push({...event,type:'explosion',wave,time:launch+event.time+noFuture.delay});
      }
    }
    return timeline.sort((a,b)=>a.time-b.time);
  }
  function describe(def,{player={},multiplier=1,damage=def.baseDamage||0,en=false,rearSplashRatio=.2,rulesVersion=13}={}){
    const lines=[],compact=[];const say=(zh,english)=>en?english:zh;
    const raw=def.effectDescriptors?.find(e=>e.kind==='damage')?.raw;
    if(def.freezeStacks>0&&!(def.baseDamage>0)){
      const stacks=def.freezeStacks*(raw?._freezeStacksScaleWithCombo?multiplier:1);
      return {lines:[say(`每发随机命中一名前排敌人，施加${stacks}层冻结，不造成直接伤害。连击增加发射次数。冻结保留时敌人本轮无法行动；受到主击时消耗1层并承受双倍伤害，层数耗尽会恢复原意图。敌人回合结束清除剩余冻结；受冻结抗性影响。`,`Each shot freezes a random front enemy for ${stacks} stack(s), with no direct damage. Combo adds shots. Frozen enemies skip their action; a main hit consumes one stack for double damage, restoring the intent when no stacks remain. Remaining freeze clears after the enemy turn; resistance applies.`)],compact:say('冻结停手 · 受击双倍','Freeze skips action · hit ×2'),variable:false};
    }
    if(rulesVersion===12&&isAreaAttack(def)){
      const ratio=rearSplashRatio*(1+((def.area||0)+(player.area||0))/100),value=rearSplashDamage(damage,(def.area||0)+(player.area||0),rearSplashRatio);
      lines.push(say(`每次范围攻击对当前前排造成完整主击伤害，后排每个敌人仅承受${Number(value.toFixed(2))}点溅射（基础20%，受攻击范围加成）。前后排名单在本次攻击前固定，刚补位的敌人不会在同次再承受全额主击；溅射不暴击、不消耗冰冻层。`,`Each area wave deals full main-hit damage to the current front and only ${Number(value.toFixed(2))} splash to each reserve (base 20%, increased by Area). Front/rear membership is fixed before this wave, so promoted reserves do not also take full damage in the same wave. Splash does not crit or consume freeze.`));
    }
    if(rulesVersion>=13){
      if(def.targetingMode==='FrontRowTargeting')lines.push(say('本次整排伤害效果锁定起始前排，所有连发与溅射跳过已死亡目标；新补位敌人从下一次伤害效果开始参与。','This front-row damage effect locks its starting front for every wave and splash, skipping dead targets. Replacements can be hit by the next damage effect.'));
      const info=areaInfo(def,player,damage);
      lines.push(say(`Area溅射：每个当前前排额外受到${Number(info.damage.toFixed(4))}点。公式为每击伤害 × ((基础Area + 当前Area)/100) × 0.2；Area为0时没有溅射。尚未补位的后排不被直接波及。溅射保留小数，独立扣除护甲；普通溅射不继承主击暴击或冰冻倍率。`,`Area splash: ${Number(info.damage.toFixed(4))} extra damage to each current front enemy. Formula: hit damage × ((base Area + current Area)/100) × 0.2. Zero Area means zero splash. Waiting reserves are not directly hit. Fractional damage and armor apply; ordinary splash does not inherit critical or frozen multipliers.`));
      if(['noFuture','runetracer'].includes(def.key))lines.push(say('持续弹体的实际碰撞溅射使用该次冰冻增伤后的伤害；碰边爆炸不触发溅射。','Live projectile contact splash uses that contact’s frozen-amplified damage; boundary explosions do not splash.'));
    }
    if(def.key==='noFuture'){
      const value=explosionDamage(damage);
      compact.push(say(`碰边爆炸 +${value} / 次`,`Wall burst +${value} each`));
      lines.push(say(`每次碰边后延迟0.1秒，对爆炸位置最近的可受击前排敌人造成${value}点伤害（主击的20%，取整）。冰冻可增伤；不触发暴击、吸血或范围溅射。`,`Each wall collision deals ${value} damage after 0.1s to the nearest targetable front enemy (rounded 20% of main-hit damage). Freeze can amplify it; no critical hit, healing or area splash.`));
      lines.push(say('弹体持续飞行，碰边后可再次命中同一列。爆炸次数取决于弹道、碰边次数与存活时间，初次主击数值不包含重复命中或额外爆炸。','The projectile keeps flying and can hit the same column again after bouncing. Collision count varies with its path and lifetime; initial-hit numbers exclude repeat hits and explosions.'));
    }
    if(def.key==='runetracer'){
      compact.push(say('反弹后可再次命中','Can hit again after a bounce'));
      lines.push(say('弹体持续飞行1.5秒；每次碰边重置各列命中记录，可再次命中该列当前前排。初次主击不包含这些重复命中。','The projectile flies for 1.5 seconds. Each wall collision resets per-column hit memory, allowing it to hit the current front again. Initial-hit numbers exclude these repeated contacts.'));
    }
    if(def.canCrit){
      const chance=Math.min(1,(1+(player.luck||0)/100)*(def.critChance||0));
      compact.push(say(`暴击 ${Math.round(chance*100)}% ×${def.critMultiplier}`,`Crit ${Math.round(chance*100)}% ×${def.critMultiplier}`));
      lines.push(say(`每次主击有${Math.round(chance*100)}%概率造成${def.critMultiplier}倍伤害；运气提高暴击率。`,`Each main hit has a ${Math.round(chance*100)}% chance to deal ×${def.critMultiplier} damage; Luck raises this chance.`));
      for(const e of def.criticalEffects||[])if(e.type==='HealEffect'){
        compact.push(say(`暴击治疗${e._healAmount}`,`Crit heals ${e._healAmount}`));
        const limit=raw?._critEffectType===0?say('每次出牌最多一次','at most once per card play'):raw?._critEffectType===1?say('每轮投射最多一次','at most once per projectile wave'):say('每次暴击','each critical hit');
        lines.push(say(`暴击恢复${e._healAmount}生命，${limit}；治疗量不随连击额外翻倍。`,`Critical hits heal ${e._healAmount}, ${limit}; this heal is not multiplied by combo.`));
      }
    }
    if(raw?._canKnockback&&def.knockback){
      compact.push(say(`击退 ${def.knockback}%`,`Knockback ${def.knockback}%`));
      lines.push(say(`主击尝试击退并取消攻击意图，基础概率${def.knockback}%，受敌人击退抗性影响；每轮投射至多尝试一次。`,`Main hits can knock back and cancel an attack intent: base chance ${def.knockback}%, reduced by resistance, at most one attempt per projectile wave.`));
    }
    if(def.priority===1){compact.push(say('攻击意图优先','Attack intent first'));lines.push(say('优先选择带攻击意图的前排敌人；没有这类目标时使用通常索敌顺序。','Targets front enemies with attack intents first, then falls back to the normal targeting order.'));}
    for(const e of def.effectDescriptors||[]){
      if(e.sourceType==='BouncyEffect'){
        compact.push(say('运气弹射','Luck ricochets'));
        lines.push(say('每轮投射独立尝试额外弹射：20% ×（1 + 运气/100），每次成功后下次概率乘0.8；额外弹射可再次命中同一目标。','Each projectile wave rolls for extra ricochets: 20% × (1 + Luck/100), multiplied by 0.8 after each success. Ricochets can hit the same target again.'));
      }
      if(e.sourceType==='HealEffect'){
        const amount=e.raw._healAmount*(def.receivesComboMultiplier?multiplier:1);
        compact.push(say(`治疗${amount}`,`Heal ${amount}`));lines.push(say(`攻击结算后恢复${amount}生命，上限为生命上限。`,`After the attack, heal ${amount}, capped by maximum health.`));
      }
      if(e.sourceType==='RemoveIntentEffect'){
        compact.push(say(`解除${e.raw._count}个前排意图`,`Disarm ${e.raw._count} front enemies`));
        lines.push(say(`攻击后尝试移除最多${e.raw._count}个当前前排的${e.raw._removeAllIntents?'全部':'攻击'}意图；受缴械抗性影响，目标数不随连击增加。`,`After attacking, try to remove ${e.raw._removeAllIntents?'all':'attack'} intents from up to ${e.raw._count} current front enemies. Disarm resistance applies; combo does not increase the target count.`));
      }
    }
    if(def.damageEffectType==='PhieraggiEffect'){
      const shots=Math.min(10,Math.floor(((player.revivalStacks||0)*100+(player.revival||0))*.01));
      compact.push(say(`复活加成 +${shots} 次`,`Revival +${shots} shots`));
      lines.push(say(`每100点复活值（含已有复活次数）额外发射1次，最多10次；当前额外${shots}次，已计入显示次数。`,`Each 100 revival points (including stored revivals) adds one shot, up to 10. Current bonus: ${shots}, already included in the displayed shot count.`));
    }
    if(rulesVersion===12&&isAreaAttack(def)&&!compact.length)compact.push(say('前排全伤 · 后排溅射','Full front · rear splash'));
    return {lines,compact:compact.join(say(' · ',' · ')),variable:['noFuture','runetracer','heavenSword'].includes(def.key)||def.canCrit};
  }
  const api={areaConfig,areaInfo,noFuture,runetracer,projectileConfig,isAreaAttack,rearSplashDamage,arena,columnPosition,traceProjectile,projectileTimeline,explosionDamage,describe};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CombatSpecials=api;
})(typeof globalThis!=='undefined'?globalThis:this);
