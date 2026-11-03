/* Read-only presentation of recorded enemy-turn events. */
(function(root){
 'use strict';
 function steps(events){const kinds={player_damage:'attack',enemy_armor:'guard',enemy_wait:'wait',revive:'revive'};return events.filter(e=>kinds[e.type]).map(event=>({kind:kinds[event.type],event}));}
 function impact(event){const healthLoss=Math.max(0,event.healthBefore-event.healthAfter),absorbed=Math.max(0,event.armorBefore-event.armorAfter);return {healthLoss,absorbed,broken:absorbed>0&&event.armorAfter===0,blocked:healthLoss===0&&absorbed>0,empty:healthLoss===0&&absorbed===0,health:event.healthAfter,armor:event.armorAfter};}
 function lunge({heavy=false,floating=false}={}){
  const forward=heavy?26:floating?20:32,scale=heavy?1.17:1.3;
  return [{offset:0,transform:'translate(-50%,0px) scale(1)'},{offset:.18,transform:`translate(-50%,-${heavy?3:6}px) scale(.96)`},{offset:.46,transform:`translate(-50%,${forward}px) scale(${scale})`},{offset:.58,transform:`translate(-50%,${forward}px) scale(${scale})`},{offset:.85,transform:`translate(-50%,${floating?-2:3}px) scale(1.015)`},{offset:1,transform:'translate(-50%,0px) scale(1)'}];
 }
 const api={steps,impact,lunge};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EnemyTurnMotion=api;
})(globalThis);
