'use strict';
// Deliberately no engine import. All strategy inputs cross the public JSON boundary.
function value(c) {
  if(c.kind==='character')return 200;
  if(c.costType==='wild')return 38+(c.drawCount||0)*20+(c.mana||0)*15+(c.armor||0)*3;
  if(c.kind==='attack')return (c.baseAttack?.totalDamage||c.baseDamage*(c.baseAmount||1)||0)/(1+(c.cost||0));
  return (c.mana||0)*22+(c.drawCount||0)*25+(c.might||0)*3+(c.amount||0)*30+(c.armor||0)*4+(c.dealCountBoost||0)*35+5;
}
function createScriptedPlayer() {
  const visitedServices=new Set();let floor=0;
  return {id:'heuristic-v1', choose({observation:o,legalActions:actions}) {
    if(!actions.length)throw Error('No legal action');
    if(floor!==o.floor){floor=o.floor;visitedServices.clear();}
    const currentKey=`${o.position.x},${o.position.y}`;
    const byId=id=>actions.find(a=>a.id===id);
    const best=(list,score)=>[...list].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0];
    if(o.phase==='map') {
      const candidates=actions.filter(a=>a.type==='navigate').map(a=>({a,m:o.map.markers.find(m=>m.key===a.arg)}));
      const rank=m=>{
        if(['mansionDoor','shovel'].includes(m.object)&&!m.locked)return 10000;
        if(['manaCart','bracerCart'].includes(m.object)||['mana','deal'].includes(m.pickup?.kind))return 1000;
        if(m.object==='pickup')return 700;
        if(['crate','barrel','gargoyle'].includes(m.object))return 650;
        if(m.object==='gemchest'&&!visitedServices.has(m.key))return 450;
        if(m.room==='treasure'&&!m.completed)return 600;
        if(m.room==='shop'&&!visitedServices.has(m.key)&&o.gold>=25)return 350;
        if(m.room==='camp'&&!m.completed&&o.health<o.maxHealth*.85)return 550;
        if(m.room==='battle'&&!m.completed)return 250;
        if(m.room==='elite'&&!m.completed)return 200;
        if(m.room==='boss'&&!m.completed)return 100;
        return -10000;
      };
      const selected=candidates.sort((a,b)=>(rank(b.m)-b.a.distance*3)-(rank(a.m)-a.a.distance*3)||a.a.id.localeCompare(b.a.id))[0];
      return (selected?.a||actions[0]).id;
    }
    if(o.phase==='battle') {
      const score=a=>{
        const c=o.battle.hand.find(c=>c.id===a.arg),p=c.preview;
        const mechanics=o.battle.bossMechanics;
        let mechanicBonus=0;
        for(const boss of mechanics?.bosses||[]){
          if(boss.activeIn||boss.broken)continue;
          if(boss.kind===2&&((p.wildcard&&!boss.wildUsed)||(!p.wildcard&&!boss.colors.includes(c.mechanicColor))))mechanicBonus+=500;
          if(boss.kind===4&&boss.charging&&c.kind==='attack')mechanicBonus+=650;
        }
        if(mechanics?.plague>0&&p.healGain>0)mechanicBonus+=220;
        return mechanicBonus+(p.character?1000:0)+(p.wildcard?800:0)+(p.totalDamage||p.damage*p.hits||0)+(p.draw||0)*20+(p.manaGain||0)*20+(p.mightGain||0)*3+(p.amountGain||0)*30+(p.armor||0)-(p.payment||0);
      };
      return (best(actions.filter(a=>a.type==='play'),score)||byId('end_turn')).id;
    }
    if(o.rewards)return best(actions.filter(a=>a.type==='choose'),a=>value(o.rewards[a.arg].card)+(o.rewards[a.arg].evolutions.some(h=>h.status==='ready')?50:0)).id;
    if(o.phase==='bossreward')return (byId('boss:evolution')||byId('boss:card')).id;
    if(o.phase==='evolution')return (actions.find(a=>a.type==='fuse')||byId('cancel')).id;
    if(o.phase==='gem') {
      visitedServices.add(currentKey);
      const socket=best(actions.filter(a=>a.type==='socket'),a=>value(o.deck.find(c=>c.id===a.arg)));
      if(socket)return socket.id;
      if(o.gems.selected)return 'cancel';
      return (actions.find(a=>a.type==='gem')||byId('cancel')).id;
    }
    if(o.phase==='shop') {
      visitedServices.add(currentKey);
      if(byId('heal')&&o.maxHealth-o.health>=10)return 'heal';
      const buys=actions.filter(a=>a.type==='buy'&&value(o.shop.offers.find(s=>s.id===a.arg).card)>10);
      return (best(buys,a=>value(o.shop.offers.find(s=>s.id===a.arg).card))||byId('leave')).id;
    }
    if(o.phase==='removal')return (best(actions.filter(a=>a.type==='remove'),a=>-value(o.deck.find(c=>c.id===a.arg)))||byId('cancel')).id;
    return actions[0].id;
  }};
}
module.exports={createScriptedPlayer,value};
