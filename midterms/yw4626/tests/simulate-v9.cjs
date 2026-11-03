'use strict';
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js'),E=require('../dist/engine.js');
function route(d,target){
  const queue=[[d.x,d.y,[]]],seen=new Set([D.key(d.x,d.y)]);
  for(let i=0;i<queue.length;i++){
    const [x,y,path]=queue[i];if(D.key(x,y)===target)return path;
    for(let dir=0;dir<4;dir++){const v=D.dirs[dir],nx=x+v.x,ny=y+v.y,k=D.key(nx,ny);if(D.canTraverse(d,x,y,nx,ny)&&!seen.has(k)){seen.add(k);queue.push([nx,ny,[...path,dir]]);}}
  }throw Error('unreachable '+target);
}
function cardValue(key){const d=E.definition({key}),p=d.kind==='attack'?E.attackSummary(d):{};return d.kind==='attack'?(p.totalDamage||0)/(d.cost+1):d.kind==='mana'?20:d.kind==='draw'?25:d.kind==='might'?15:d.kind==='amount'?25:5;}
function simulate({seed,profile,character,combatVersion=9}){
  let r=new Run({seed,profile,character,combatVersion}),floor=1,targetIndex=0,steps=0,moves=0,playedW=0,seenMinions=0;
  const targets=['treasure','shop','camp','boss'];
  while(!['won','lost'].includes(r.phase)&&steps++<10000){
    if(r.floor!==floor){floor=r.floor;targetIndex=0;}
    if(r.phase==='battle'){
      const b=r.battle;
      if(b.phase==='player'){
        const score=c=>{const p=b.cardPreview(c);return (p.character?1000:0)+(p.wildcard?800:0)+(p.totalDamage||p.damage*p.hits||0)+p.draw*20+p.manaGain*20+p.mightGain*3+p.amountGain*30+p.armor-p.payment;};
        const card=b.piles.hand.filter(c=>b.canPlay(c.id).ok).sort((a,z)=>score(z)-score(a))[0];
        if(card){if(card.key==='cloverPetal')playedW++;b.play(card.id);}else b.endTurn();
      }else if(b.phase==='enemy')b.resolveNextEnemy();
      seenMinions=Math.max(seenMinions,b.enemies.filter(e=>e.encounterRole==='minion').length);r.syncExperience();r.settleBattle();
    }else if(r.phase==='levelup')r.chooseLevelCard(r.levelChoice.choices.reduce((best,c,i,a)=>cardValue(c.key)>cardValue(a[best].key)?i:best,0));
    else if(r.phase==='evolution'){if(r.evolution.choices.length)r.fuse(0);else r.skipEvolution();}
    else if(r.phase==='treasure')r.openTreasure('vitality');
    else if(r.phase==='shop'){
      const wild=r.shop.offers.find(o=>o.key==='cloverPetal'&&!o.sold);if(wild)r.buy(wild.id);
      if(r.health<r.maxHealth-10)r.buyHeal();
      const offer=r.shop.offers.filter(o=>!o.sold&&r.gold>=o.price).sort((a,z)=>cardValue(z.key)-cardValue(a.key))[0];if(offer)r.buy(offer.id);r.leave();
    }else if(r.phase==='camp')r.rest();
    else if(r.phase==='digging')r.digStep();
    else if(r.phase==='map'){
      const supply=Object.entries(r.dungeon.objects).find(([,o])=>o.active&&!o.broken&&['mana','deal'].includes(o.reward?.kind));
      const entry=supply||Object.entries(r.dungeon.rooms).find(([,n])=>n.type===targets[Math.min(targetIndex,3)]);
      if(!entry)throw Error('missing target');const [dest]=entry;
      if(D.key(r.dungeon.x,r.dungeon.y)===dest){if(supply)r.useObject(r.dungeon.x,r.dungeon.y);else if(targetIndex===3)r.interact();else targetIndex++;}
      else{const direction=route(r.dungeon,dest)[0],delta=(direction-r.dungeon.dir+4)%4;const result=r.walk(['forward','right','back','left'][delta]);if(!result.ok)throw Error(result.reason);moves++;}
    }else if(r.phase==='gem')r.cancelGem();else throw Error('unexpected '+r.phase);
    if(steps%37===0)r=Run.restore(r.snapshot());
  }
  if(steps>=10000)throw Error('simulation did not terminate');
  return {seed,profile,character,combatVersion,outcome:r.phase,floor:r.floor,level:r.level,health:r.health,steps,moves,playedW,seenMinions,growth:r.growth,luck:r.combatSettings().luck};
}
module.exports={simulate};
if(require.main===module){const rows=[];for(const version of [8,9])for(const profile of ['base','demo'])for(const character of ['antonio','imelda'])for(let i=0;i<6;i++)rows.push(simulate({seed:'V9-BAL-'+i,profile,character,combatVersion:version}));console.log(JSON.stringify(rows,null,2));}
