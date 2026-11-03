/* Presentation metadata derived from the existing card groups; no combat rules. */
(function(root){
 'use strict';
 const roster=typeof module!=='undefined'&&module.exports?require('./battle-roster.js'):root.BattleRoster;
 const groups={
  whip:['Whip','BloodyTear','VentoSacro','Fuwalafuwaloo'],axe:['Axe','DeathSpiral'],bible:['KingBible','UnholyVespers'],
  wand:['MagicWand','HolyWand'],fire:['FireWand','Hellfire'],knife:['Knife','ThousandEdge'],cross:['Cross','HeavenSword'],
  lightning:['LightningRing','ThunderLoop'],aura:['Garlic','SoulEater'],rune:['Runetracer','NOFUTURE'],water:['SantaWater','LaBorra'],
  claw:['GattiAmari','ViciousHunger'],birds:['Peachone','EbonyWings','Vandalier'],guns:['PhieraDerTuphello','EightTheSparrow','Phieraggi'],
  drill:['ShadowPinion','ValkyrieTurner'],song:['SongOfMana','Mannajja'],ice:['ClockLancet','InfiniteCorridor'],cart:['Carrello'],flowers:['CelestialDusting']
 };
 function family(card){const group=(card?.group||'').replace('CardGroup_','');return Object.entries(groups).find(([,names])=>names.includes(group))?.[0]||'wand';}
 function formation(enemies,limit=3){const columns=new Map(),result=[];enemies.forEach((enemy,index)=>{if(enemy.health<=0||roster.waiting(enemy,enemies))return;const column=enemy.slot?.column??index,list=columns.get(column)||[];list.push({enemy,index,column});columns.set(column,list);});for(const list of columns.values())list.sort((a,b)=>(a.enemy.slot?.row??0)-(b.enemy.slot?.row??0)||a.index-b.index).forEach((entry,depth)=>{if(depth<limit)result.push({...entry,depth,reserves:list.length-1});});for(const [index,enemy] of enemies.entries())if(enemy.health>0&&roster.waiting(enemy,enemies))result.push({enemy,index,column:2,depth:3,reserves:0,waitingBoss:true});return result.sort((a,b)=>b.depth-a.depth||a.column-b.column);}
 function hold(enemies,positions,fallen=new Set()){return enemies.flatMap((enemy,index)=>{const position=positions.get(enemy.id);return position&&(position.depth<3||enemy.finalBoss)&&(enemy.health>0||fallen.has(enemy.id))?[{enemy,index,...position,fallen:fallen.has(enemy.id)}]:[];}).sort((a,b)=>b.depth-a.depth||a.column-b.column);}
 function pace(beats){return Math.min(1,1200/(Math.max(1,beats)*380));}
 function stride(from,to,{floating=false,heavy=false}={}){
  const dx=from.left+from.width/2-to.left-to.width/2,dy=from.top+from.height-to.top-to.height,sx=from.width/Math.max(1,to.width),sy=from.height/Math.max(1,to.height),frames=[];
  for(let i=0;i<=8;i++){const t=i/8,e=t*t*(3-2*t),walk=Math.sin(t*Math.PI*4)*(heavy?1:floating?1:2),lift=Math.sin(t*Math.PI*(floating?2:4))*(floating?2:1.5),x=dx*(1-e)+walk,y=dy*(1-e)+lift;frames.push({offset:t,transform:`translate(calc(-50% + ${i===8?0:x.toFixed(2)}px),${i===8?0:y.toFixed(2)}px) scale(${(sx+(1-sx)*e).toFixed(4)},${(sy+(1-sy)*e).toFixed(4)})`,opacity:from.virtual?Math.min(1,t*3):1});}
  return frames;
 }
 const api={family,formation,hold,pace,stride,groups};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CombatMotion=api;
})(globalThis);
