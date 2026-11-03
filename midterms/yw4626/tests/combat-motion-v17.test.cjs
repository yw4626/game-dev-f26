'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../dist/combat-motion'),{catalog}=require('../dist/engine');
const enemy=(id,column,row,health=10)=>({id,health,slot:{column,row}});
test('all catalog attacks map to a weapon family, including evolved variants',()=>{
 const supported=new Set(Object.values(M.groups).flat());
 const cards=Object.values(catalog.cards).filter(c=>c.kind==='attack');
 assert.equal(cards.length,40);assert.ok(cards.every(c=>supported.has(c.group.replace('CardGroup_',''))));
 assert.equal(M.family(catalog.cards.bible),'bible');assert.equal(M.family(catalog.cards.noFuture),'rune');
 assert.equal(M.family(catalog.cards.deathSpiral),'axe');assert.equal(M.family(catalog.cards.clockLancet),'ice');
 assert.equal(new Set(cards.map(M.family)).size,19);
});
test('death keeps the old visual positions until release; survivors then advance only in the emptied column',()=>{
 const enemies=[enemy(1,0,0),enemy(2,0,1),enemy(3,0,2),enemy(4,0,3),enemy(5,1,0),enemy(6,1,1)];
 const before=M.formation(enemies,Infinity),positions=new Map(before.map(p=>[p.enemy.id,{column:p.column,depth:p.depth,reserves:p.reserves}]));
 enemies[0].health=0;for(const e of enemies.slice(1,4))e.slot.row--;
 const held=M.hold(enemies,positions,new Set([1]));
 assert.equal(held.find(p=>p.enemy.id===1).fallen,true);assert.equal(held.find(p=>p.enemy.id===2).depth,1);
 assert.equal(held.find(p=>p.enemy.id===3).depth,2);assert.ok(!held.some(p=>p.enemy.id===4));
 const released=M.formation(enemies);assert.ok(!released.some(p=>p.enemy.id===1));
 assert.deepEqual([2,3,4,5,6].map(id=>released.find(p=>p.enemy.id===id).depth),[0,1,2,0,1]);
 assert.deepEqual(released.filter(p=>p.depth!==positions.get(p.enemy.id).depth).map(p=>p.enemy.id).sort(),[2,3,4]);
});
test('old saves with row gaps and multi-kill beats retain correct rank and depth',()=>{
 const enemies=[enemy(1,0,0,0),enemy(2,0,4),enemy(3,0,7),enemy(4,0,9),enemy(5,1,5)];
 const before=M.formation(enemies,Infinity),positions=new Map(before.map(p=>[p.enemy.id,p]));enemies[1].health=0;enemies[2].health=0;
 const held=M.hold(enemies,positions,new Set([2,3]));assert.deepEqual(held.filter(p=>p.fallen).map(p=>p.depth).sort(),[0,1]);
 assert.equal(held.find(p=>p.enemy.id===4).depth,2);assert.equal(M.formation(enemies).find(p=>p.enemy.id===4).depth,0);
});
test('walking begins at the previously rendered sprite bounds and ends at the new bounds',()=>{
 const from={left:140,top:80,width:80,height:100},to={left:100,top:60,width:160,height:200};
 for(const options of [{},{floating:true},{heavy:true}]){
  const frames=M.stride(from,to,options);
  assert.match(frames[0].transform,/translate\(calc\(-50% \+ 0.00px\),-80.00px\) scale\(0.5000,0.5000\)/);
  assert.equal(frames.at(-1).transform,'translate(calc(-50% + 0px),0px) scale(1.0000,1.0000)');
  assert.ok(frames.every(f=>!(/NaN|Infinity/.test(f.transform))&&f.opacity===1));
 }
 assert.equal(M.stride({...from,virtual:true},to)[0].opacity,0);
});
test('long combos have bounded presentation time without truncating beats',()=>{
 assert.equal(M.pace(1),1);
 for(let beats=1;beats<=12;beats++){assert.ok(M.pace(beats)>0);assert.ok(beats*700*M.pace(beats)<3800);}
});
