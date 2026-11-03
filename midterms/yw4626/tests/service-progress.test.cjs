'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js');
const {PlayerEnvironment}=require('../agents/environment.cjs'),{createScriptedPlayer}=require('../agents/scripted.cjs');
const {ProgressGuard}=require('../agents/progress-guard.cjs');
test('full sockets disable gem selections, defer without consuming loot, and reactivate after deck changes',()=>{
 const r=new Run({seed:'SERVICE-DEV-A'}),[key,obj]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='gemchest');
 for(const c of r.deck)c.gemSlots=0;[r.dungeon.x,r.dungeon.y]=key.split(',').map(Number);obj.offers=['draw','armor','costDown'];
 assert.equal(r.serviceStatus(key).available,false);assert.equal(r.serviceStatus(key).inspected,true);
 assert.ok(r.useObject(r.dungeon.x,r.dungeon.y).ok);assert.equal(r.chooseGem('draw').ok,false);assert.ok(r.cancelGem());assert.equal(obj.active,true);assert.equal(r.serviceStatus(key).deferred,true);
 const restored=Run.restore(r.snapshot());assert.equal(restored.serviceStatus(key).deferred,true);
 restored.deck.push(restored.makeCard('whip'));assert.equal(restored.serviceStatus(key).available,true);assert.equal(restored.serviceStatus(key).deferred,false);
});
test('passing a deferred service keeps the route open; deliberate human bump still reopens it',()=>{
 const r=new Run({seed:'SERVICE-DEV-B'}),key=r.dungeon.removalEvent.key,[x,y]=key.split(',').map(Number),d=r.dungeon;
 [d.x,d.y]=[x,y];assert.ok(r.useObject(x,y).ok);r.cancelRemoval();
 const dir=D.dirs.findIndex(v=>D.canTraverse(d,x-v.x,y-v.y,x,y));assert.ok(dir>=0);const v=D.dirs[dir];
 [d.x,d.y,d.dir]=[x-v.x,y-v.y,dir];assert.ok(r.walk('forward',{passDeferredServices:true}).ok);assert.equal(r.phase,'map');assert.deepEqual([d.x,d.y],[x,y]);assert.equal(d.removalEvent.used,false);
 [d.x,d.y,d.dir]=[x-v.x,y-v.y,dir];assert.ok(r.walk('forward').ok);assert.equal(r.phase,'removal');
});
test('boss gem branch cannot trap a full-slot deck; card reward remains available and unconsumed',()=>{
 const r=new Run({seed:'SERVICE-DEV-C'});r.current=r.maps[0].find(n=>n.type==='boss').id;r.completed.push(r.current);r.phase='map';r.openBossReward();
 for(const c of r.deck)c.gemSlots=0;
 assert.equal(r.canChooseBossGem(),false);assert.equal(r.chooseBossReward('gem').ok,false);assert.equal(r.phase,'bossreward');assert.ok(r.bossReward);assert.ok(r.chooseBossReward('card').ok);assert.equal(r.bossRewardFloors.length,0);
});
test('API omits deferred and completed navigation targets; durable marker and objective are public',()=>{
 const e=new PlayerEnvironment({goalFloor:6,decisionLimit:2000,stepLimit:15000}),p=createScriptedPlayer();e.reset('AGENT-DEV-A');let reached=false;
 while(!e.outcome().terminal){const o=e.observe('player'),actions=e.legal_actions('player');
   if(o.phase==='gem'){
     const key=o.position.x+','+o.position.y;e.step('player',{id:'cancel',revision:o.revision});
     const map=e.observe('player'),legal=e.legal_actions('player');assert.ok(map.map.markers.find(m=>m.key===key).service.deferred);assert.ok(!legal.some(a=>a.id==='navigate:'+key));assert.ok(map.map.objective);
     for(const a of legal.filter(a=>a.type==='navigate')){const m=map.map.markers.find(m=>m.key===a.arg);assert.ok(m.object||!m.completed||m.room==='shop');assert.ok(a.destination);}
     assert.ok(legal.some(a=>a.type==='move'),'manual movement is not locked');reached=true;break;
   }
   assert.ok(e.step('player',{id:p.choose({observation:o,legalActions:actions,history:[]}),revision:o.revision}).ok);
 }assert.ok(reached);
});
test('public repeat guard warns on unchanged navigation loops, resets with meaningful resource change, ignores combat',()=>{
 const g=new ProgressGuard({repetitionWindow:12,repetitionWarnAt:2,repetitionLimit:3}),o={floor:1,phase:'map',position:{x:1,y:1,dir:0},health:30,gold:50,level:1,progress:{wins:0,kills:0},deck:[]};
 assert.equal(g.inspect(o).repeats,1);assert.ok(g.inspect(o).notice);assert.equal(g.inspect(o).stalled,true);assert.equal(g.inspect({...o,gold:100}).stalled,false);
 for(let i=0;i<20;i++)assert.equal(g.inspect({...o,phase:'battle'}),null);assert.equal(g.inspect(o).repeats,1);
});
