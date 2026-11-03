'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),M=require('../dist/enemy-turn-motion');
const hit=(healthBefore,healthAfter,armorBefore,armorAfter)=>({type:'player_damage',healthBefore,healthAfter,armorBefore,armorAfter});
test('enemy impact distinguishes full block, exact armor break and spill into health from recorded deltas',()=>{
 assert.deepEqual(M.impact(hit(30,30,10,6)),{healthLoss:0,absorbed:4,broken:false,blocked:true,empty:false,health:30,armor:6});
 assert.deepEqual(M.impact(hit(30,30,4,0)),{healthLoss:0,absorbed:4,broken:true,blocked:true,empty:false,health:30,armor:0});
 assert.deepEqual(M.impact(hit(30,26,3,0)),{healthLoss:4,absorbed:3,broken:true,blocked:false,empty:false,health:26,armor:0});
});
test('zero-damage and overkill presentation use actual health loss instead of requested damage',()=>{
 assert.equal(M.impact({...hit(3,0,0,0),damage:999}).healthLoss,3);
 assert.equal(M.impact(hit(30,30,0,0)).empty,true);
 assert.equal(M.impact(hit(30,30,0,0)).broken,false);
});
test('mixed intents, repeated hits and revival retain exact event order without mutating the engine events',()=>{
 const events=[{type:'enemy_action'},{type:'enemy_armor',amount:4},hit(3,0,2,0),{type:'revive',health:60,remaining:0},hit(60,54,0,0),{type:'enemy_wait'},{type:'turn_start'}],saved=JSON.stringify(events);
 assert.deepEqual(M.steps(events).map(s=>s.kind),['guard','attack','revive','attack','wait']);
 assert.equal(M.steps(events)[2].event.health,60);assert.equal(JSON.stringify(events),saved);
});
test('a frozen or disarmed skipped enemy creates no synthetic damage or lunge',()=>assert.deepEqual(M.steps([{type:'turn_start'},{type:'intent'},{type:'draw'}]),[]));
test('lunge hits at the largest forward pose and returns to the original transform for all creature weights',()=>{
 for(const options of [{},{heavy:true},{floating:true}]){const frames=M.lunge(options);assert.equal(frames[0].transform,frames.at(-1).transform);assert.equal(frames[2].offset,.46);assert.equal(frames[2].transform,frames[3].transform);assert.match(frames[2].transform,/scale\(1\.(17|3)\)/);assert.ok(frames.every(f=>!(/NaN|Infinity/.test(f.transform))));}
});
