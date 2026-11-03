/* Authored encounter adapter. Visual variants do not claim new extracted enemy AI. */
(function(root){
  'use strict';
  const themes=typeof module!=='undefined'&&module.exports?require('./floor-themes.js'):root.CrawlerThemes;
  const variants=Object.freeze([
    {visualKey:'ghost',key:'ghost',name:'幽灵',english:'Ghost'},
    {visualKey:'zombie',key:'zombie',name:'腐尸',english:'Shambler'},
    {visualKey:'skeleton',key:'zombie',name:'骷髅卫兵',english:'Skeleton Guard'},
    {visualKey:'bat',key:'ghost',name:'地穴蝙蝠',english:'Crypt Bat'},
    {visualKey:'slime',key:'ghost',name:'腐蚀软泥',english:'Slime'},
    {visualKey:'golem',key:'lion',name:'石像卫士',english:'Stone Sentinel'}
  ]);
  const bosses=[{visualKey:'bossLion',name:'地穴狮王',english:'Crypt Lion'},
    {visualKey:'bossWraith',name:'墓穴怨灵',english:'Tomb Wraith'},
    {visualKey:'bossDemon',name:'永夜魔王',english:'Lord of Night'}];
  function partition(total,weights){
    const sum=weights.reduce((n,x)=>n+x,0),raw=weights.map(w=>total*w/sum),values=raw.map(Math.floor);
    const order=raw.map((x,i)=>({i,f:x-values[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
    for(let left=total-values.reduce((n,x)=>n+x,0),j=0;left>0;left--,j++)values[order[j%order.length].i]++;
    return values;
  }
  function budget(floor,node,catalog,xp){
    const keys=node.type==='boss'?['lion','ghost']:node.type==='elite'?['lion','zombie']:node.stage===0?['ghost','zombie']:['ghost','zombie','lion'];
    return keys.reduce((out,key)=>{
      const e=catalog.enemies[key],boss=node.type==='boss'&&key==='lion';
      const scale=boss?1.4+floor*.45:node.type==='elite'?1.05+floor*.22:.8+floor*.2;
      out.health+=Math.round(e.health*scale);out.xp+=xp[key]?.xp||0;out.armor+=boss?10*floor:0;
      out.attack+=Math.max(...e.intents.flatMap(i=>i.actions.filter(a=>a.kind==='attack').map(a=>a.value+floor-1+(node.type==='elite'?1:0)+(boss?floor+1:0))),0);
      out.shield+=Math.max(...e.intents.flatMap(i=>i.actions.filter(a=>a.kind==='armor').map(a=>a.value)),0);return out;
    },{health:0,xp:0,attack:0,shield:0,armor:0});
  }
  function createLegacy({floor,node,catalog,xp,random}){
    const boss=node.type==='boss',elite=node.type==='elite',count=boss?(floor>=3?4:3):elite?(floor===1?4:5):node.stage===0?3:4;
    const pool=[...variants];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const selected=Array.from({length:count},(_,i)=>boss&&i===count-1?{...bosses[Math.min(floor-1,bosses.length-1)],key:'lion'}:pool[i]);
    const total=budget(floor,node,catalog,xp),weights=selected.map((_,i)=>boss&&i===count-1?3.5:1+(i%3)*.15);
    const hp=partition(total.health,weights),experience=partition(total.xp,weights),attacks=partition(total.attack,weights),shields=partition(total.shield,weights);
    return selected.map((variant,i)=>{
      const isBoss=boss&&i===count-1,source=catalog.enemies[variant.key],slot=isBoss?{row:1,column:2}:i<3?{row:0,column:count===3&&boss?i*4:i*2}:{row:1,column:i===3?0:4};
      return {...JSON.parse(JSON.stringify(source)),...variant,health:hp[i],armor:isBoss?total.armor:0,xpOverride:experience[i],slot,
        encounterRole:isBoss?'boss':boss?'minion':elite?'elite':'normal',visualScale:isBoss?1.35:variant.visualKey==='bat'?.9:1,
        encounterBudget:{version:9,...total},adaptation:'Visual variant and divided encounter budget; source intent weights retained.',
        intents:source.intents.map((intent,j)=>({...intent,weight:isBoss?(j===0?80:20):intent.weight,actions:intent.actions.map(a=>({...a,value:a.kind==='attack'?attacks[i]:a.kind==='armor'?shields[i]:a.value}))}))};
    });
  }
  // Five columns are native. Counts/HP allocation below are prototype tuning,
  // not claims about the original game's encounter templates.
  function formation(floor,node){
    const f=Math.max(1,Math.min(5,Math.trunc(floor)||1));
    const boss=node.type==='boss',elite=node.type==='elite';
    const columns=[0,1,2,3,4];
    const depth=3+Math.floor((f-1)/2)+(boss||elite||node.stage>=3?1:0);
    return {columns,depth,count:columns.length*depth};
  }
  function createWaves({floor,node,catalog,xp,random}){
    const boss=node.type==='boss',elite=node.type==='elite',shape=formation(floor,node);
    const total=budget(floor,node,catalog,xp),theme=themes.get(floor),pool=[...theme.enemies];
    const bossStats=theme.stats;
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const selected=[];
    for(let row=0;row<shape.depth;row++)for(const column of shape.columns){
      const isBoss=boss&&row===shape.depth-1&&column===2;
      const variant=isBoss?theme.boss:pool[(selected.length+row)%pool.length];
      selected.push({...variant,slot:{row,column},isBoss});
    }
    // Ordinary encounters retain their budget; final guardians get a separate,
    // stronger authored budget and wait until every minion has fallen.
    const weights=selected.map(v=>v.isBoss?0:1);
    const hp=partition(boss?Math.round(total.health*.48):total.health,weights),experience=partition(total.xp,weights),shields=partition(total.shield,weights);
    if(boss){const i=selected.findIndex(v=>v.isBoss);hp[i]=bossStats.health;experience[i]=bossStats.xp;shields[i]=bossStats.shield;}
    const laneWeights=shape.columns.map(column=>boss&&column===2?2:1);
    const minimumThreat=total.attack>=shape.columns.length?1:0;
    const laneThreat=partition(total.attack-minimumThreat*shape.columns.length,laneWeights).map(x=>x+minimumThreat);
    return selected.map((variant,i)=>{
      const {isBoss,slot,...visual}=variant,source=catalog.enemies[variant.key];
      const columnIndex=shape.columns.indexOf(slot.column),attack=isBoss?bossStats.attack:laneThreat[columnIndex];
      return {...JSON.parse(JSON.stringify(source)),...visual,finalBoss:isBoss,theme:theme.id,health:hp[i],armor:isBoss?bossStats.armor:0,xpOverride:experience[i],slot,
        formationRow:slot.row,formationDepth:shape.depth,formationColumns:shape.columns.length,encounterRulesVersion:12,
        encounterRole:isBoss?'boss':boss?'minion':elite?'elite':'normal',visualScale:isBoss?1.35:variant.visualKey==='bat'?.9:1,
        encounterBudget:{version:24,...total,health:hp.reduce((s,n)=>s+n,0),xp:experience.reduce((s,n)=>s+n,0),shield:shields.reduce((s,n)=>s+n,0),armor:boss?bossStats.armor:0,maxFrontAttack:Math.max(total.attack,boss?bossStats.attack:0),rows:shape.depth,enemyCount:shape.count},
        adaptation:'Five-column queues follow native movement; row counts and divided HP/XP are authored balance. Only the front of each column acts.',
        intents:source.intents.map((intent,j)=>({...intent,weight:isBoss?(j===0?80:20):intent.weight,actions:intent.actions.map(a=>({...a,value:a.kind==='attack'?attack:a.kind==='armor'?shields[i]:a.value}))}))};
    });
  }
  // Callers with old saved rules keep the old encounter population. New runs
  // opt in explicitly, so loading an existing battle never recreates enemies.
  function create(options){return (options.rulesVersion||9)>=12?createWaves(options):createLegacy(options);}
  const api={version:12,variants,bosses,partition,budget,formation,create};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerEncounters=api;
})(typeof globalThis!=='undefined'?globalThis:this);
