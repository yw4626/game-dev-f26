const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {createRuntimeResolver}=require('../agents/watch-runtime.cjs');
const {PlayerEnvironment}=require('../agents/environment.cjs'),{createScriptedPlayer}=require('../agents/scripted.cjs');
test('spectator captures primitive moves, card resolution and individual enemy actions without changing outcomes',()=>{
 const runtime=createRuntimeResolver(path.resolve(__dirname,'..'))({}),options={goalFloor:6,decisionLimit:1200,stepLimit:8000},seed='AGENT-DEV-A';
 const p=runtime.create(options,seed),control=new PlayerEnvironment(options);control.reset(seed);const policy=createScriptedPlayer(),seen=new Set();let macro=false;
 for(let i=0;i<160&&!p.env.outcome().terminal;i++){
  const input={observation:p.env.observe('player'),legalActions:p.env.legal_actions('player'),history:[]},action={id:policy.choose(input),revision:input.observation.revision};
  const expected=control.step('player',action),actual=runtime.step(p,action);assert.deepEqual(actual.result,expected);
  for(const f of actual.timeline){seen.add(f.method);assert.ok(f.snapshot.data);assert.ok(Array.isArray(f.events));if(f.method==='play')assert.ok(f.preview);}
  if(actual.timeline.filter(f=>f.method==='walk').length>1)macro=true;
 }
 assert.ok(macro,'multi-tile navigation is retained');for(const key of ['walk','play','beginEnemyTurn','resolveNextEnemy','chooseLevelCard'])assert.ok(seen.has(key),key);
 assert.equal(p.env.observe('player').timeline,undefined);
});
