'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {PlayerEnvironment}=require('../agents/environment.cjs');
const {createScriptedPlayer}=require('../agents/scripted.cjs');
const {episode,publicInput}=require('../agents/evaluate.cjs');
const {GeminiPlayer}=require('../agents/gemini.cjs');
const suite=require('../agents/suite.json'),config=require('../agents/gemini.example.json');
function fresh(options={}){const e=new PlayerEnvironment(options);e.reset('AGENT-DEV-A');return e;}
function scriptedEpisode(seed,options={}) {
  const e=new PlayerEnvironment(options),p=createScriptedPlayer(),phases=new Set();e.reset(seed);
  while(!e.outcome().terminal) {
    const input=publicInput(e,[],'none',6);phases.add(input.observation.phase);
    const action=p.choose(input),result=e.step('player',{id:action,revision:input.observation.revision});
    assert.ok(result.ok,result.reason);assert.ok(result.observation.health>=0);assert.ok(result.observation.gold>=0);
  }
  return {outcome:e.outcome(),phases};
}
test('five operations deterministic reset; observations are detached; wrong roles rejected',()=>{
  const a=fresh(),b=fresh(),original=b.observe('player');assert.deepEqual(a.observe('player'),original);
  const changed=a.observe('player');changed.deck[0].key='cheat';changed.map.grid[0]='...';changed.health=99999;
  const actions=a.legal_actions('player');actions[0].arg='hack';
  assert.deepEqual(a.observe('player'),original);assert.deepEqual(a.legal_actions('player'),b.legal_actions('player'));
  assert.throws(()=>a.observe('enemy'));assert.throws(()=>a.legal_actions('admin'));assert.throws(()=>a.step('enemy',{}));
  assert.deepEqual(a.reset('AGENT-DEV-A'),original);
});
test('observation and legal-action allowlists omit RNG, draws, raw assets, future rewards and sealed loot',()=>{
  const e=fresh(),o=e.observe('player'),text=JSON.stringify({o,a:e.legal_actions('player')});
  for(const secret of ['deckRng','intentRng','targetRandom','"seed"','sharedassets','effectDescriptors','future','rewardProbability','prototypePool'])assert.ok(!text.includes(secret),secret);
  assert.ok(!('maps' in o));assert.ok(!('objects' in o.map));
  for(const m of o.map.markers)if(m.object!=='pickup')assert.equal(m.pickup,undefined);
});
test('stale/forged/extra-field actions cannot mutate game state, and invalid allowance terminates',()=>{
  const e=fresh({invalidLimit:3}),before=e.observe('player');
  for(const action of [{id:'play:999',revision:0},{id:'turn:left',revision:0},{id:'turn:left',revision:2,seed:'cheat'}]) {
    const result=e.step('player',action);assert.equal(result.ok,false);
    assert.deepEqual(result.observation.position,before.position);assert.equal(result.observation.gold,before.gold);assert.deepEqual(result.observation.deck,before.deck);
  }
  assert.equal(e.outcome().reason,'invalid_limit');assert.deepEqual(e.legal_actions('player'),[]);assert.equal(e.step('player',{id:'turn:left',revision:3}).reason,'terminal');
});
test('navigation counts primitive steps; final allowed decision executes before truncation',()=>{
  const e=fresh({stepLimit:1});const a=e.legal_actions('player').find(a=>a.type==='navigate'&&a.distance>2);
  e.step('player',{id:a.id,revision:a.revision});assert.equal(e.outcome().steps,1);assert.equal(e.outcome().reason,'step_limit');
  const f=fresh({decisionLimit:1});const before=f.observe('player').position;
  f.step('player',{id:'turn:right',revision:0});assert.equal(f.observe('player').position.dir,(before.dir+1)%4);assert.equal(f.outcome().reason,'decision_limit');
});
test('genuine regression: DEV-B no longer loops between merchant and removal altar',()=>{
  // Observed 2026-11-01T03:16Z: 334 decisions / 1200 steps, cycling shop/removal.
  // Service memory stored pre-navigation location instead of actual player position.
  const result=scriptedEpisode('AGENT-DEV-B');assert.equal(result.outcome.reason,'goal_reached');assert.ok(result.outcome.decisions<200);
  for(const phase of ['map','battle','levelup','shop','bossreward'])assert.ok(result.phases.has(phase));
});
test('full five-floor autonomous path terminates successfully using only public inputs',()=>{
  const r=scriptedEpisode('AGENT-DEV-A',{goalFloor:6,stepLimit:15000,decisionLimit:6000});assert.equal(r.outcome.reason,'game_won');assert.equal(r.outcome.invalidActions,0);
});
test('bounded history changes only public history, not observations or actions',()=>{
  const e=fresh(),history=Array.from({length:9},(_,i)=>({action:'turn:left',phaseBefore:'map',index:i}));
  const none=publicInput(e,history,'none',6),bounded=publicInput(e,history,'bounded',6);
  assert.deepEqual(none.observation,bounded.observation);assert.deepEqual(none.legalActions,bounded.legalActions);assert.equal(none.history.length,0);assert.equal(bounded.history.length,6);assert.equal(bounded.history[0].index,3);
});
const caseInfo={id:'test-only',seed:'AGENT-DEV-A',character:'antonio',split:'test'};
test('runner counts failed provider calls and terminates without fallback (mock, not live)',async()=>{
  const rows=[];const result=await episode({testCase:caseInfo,kind:'gemini',memory:'none',suite,write:r=>rows.push(r),policyOverride:{choose:async()=>{throw Object.assign(Error('offline'),{code:'http_503',attempted:true});}}});
  assert.equal(result.reason,'http_503');assert.equal(result.calls,1);assert.equal(result.failedCalls,1);assert.equal(result.decisions,0);assert.equal(rows[1].result.accepted,false);
});
test('runner model-call limit prevents further calls (mock)',async()=>{
  let calls=0;
  const r=await episode({testCase:caseInfo,kind:'gemini',memory:'none',suite:{...suite,callLimit:2},policyOverride:{choose:async()=>{calls++;return {action:'turn:left',usage:{inputTokens:5,outputTokens:3,thinkingTokens:0},costUSD:.001,latencyMs:1};}}});
  assert.equal(calls,2);assert.equal(r.reason,'call_limit');assert.equal(r.inputTokens,10);assert.equal(r.costUSD,.002);
});
test('malformed model output consumes call AND invalid budget (mock)',async()=>{
  const r=await episode({testCase:caseInfo,kind:'gemini',memory:'none',suite:{...suite,invalidLimit:2},policyOverride:{choose:async()=>{throw Object.assign(Error(),{code:'invalid_response',attempted:true});}}});
  assert.equal(r.reason,'invalid_limit');assert.equal(r.calls,2);assert.equal(r.failedCalls,2);assert.equal(r.invalidActions,2);
});
test('Gemini sends structured public input only, parses action, accounts thinking tokens (mock)',async()=>{
  let request;
  const ledger={spentUSD:0},p=new GeminiPlayer(config,{apiKey:'unit-test-only',ledger,fetchImpl:async(url,options)=>{request={url,...options};return Response.json({modelVersion:'test-model',usageMetadata:{promptTokenCount:100,candidatesTokenCount:10,thoughtsTokenCount:20},candidates:[{content:{parts:[{text:'{"action":"turn:left"}'}]},finishReason:'STOP'}]});}});
  const result=await p.choose(publicInput(fresh(),[],'none',6)),body=JSON.parse(request.body);
  assert.equal(result.action,'turn:left');assert.equal(result.usage.thinkingTokens,20);assert.equal(result.costUSD,(100*.3+30*2.5)/1e6);assert.ok(Math.abs(ledger.spentUSD-result.costUSD)<1e-12);
  assert.equal(body.tools,undefined);assert.ok(!request.url.includes('unit-test-only'));assert.ok(!request.body.includes('unit-test-only'));assert.equal(body.generationConfig.responseMimeType,'application/json');
});
test('cost guard sends no request; timeout reserves unknown cost and never leaks key (mock)',async()=>{
  let sent=0;
  const p=new GeminiPlayer({...config,budgetUSD:0.00000001},{apiKey:'secret',fetchImpl:async()=>{sent++;}});
  await assert.rejects(()=>p.choose(publicInput(fresh(),[],'none',6)),e=>e.code==='cost_limit'&&e.attempted===false);assert.equal(sent,0);
  const ledger={spentUSD:0},q=new GeminiPlayer(config,{apiKey:'never-log-this',ledger,fetchImpl:async()=>{throw Object.assign(Error('never-log-this'),{name:'TimeoutError'});}});
  await assert.rejects(()=>q.choose(publicInput(fresh(),[],'none',6)),e=>e.code==='call_timeout'&&e.costUSD>0&&!JSON.stringify(e).includes('never-log-this'));assert.ok(ledger.spentUSD>0);
});
test('episode wall timeout prevents calls and AbortSignal cancels a pending provider request (mock)',async()=>{
  let called=false;
  const r=await episode({testCase:caseInfo,kind:'gemini',memory:'none',suite:{...suite,episodeTimeoutMs:0},policyOverride:{choose:async()=>{called=true;}}});
  assert.equal(r.reason,'episode_timeout');assert.equal(called,false);assert.equal(r.calls,0);
  const keepAlive=setTimeout(()=>{},1000);
  try {
    const p=new GeminiPlayer(config,{apiKey:'mock-only',fetchImpl:async(url,{signal})=>new Promise((resolve,reject)=>{if(signal.aborted)reject(signal.reason);else signal.addEventListener('abort',()=>reject(signal.reason),{once:true});})});
    await assert.rejects(()=>p.choose(publicInput(fresh(),[],'none',6),{timeoutMs:20}),e=>e.code==='call_timeout');
  }finally{clearTimeout(keepAlive);}
});
test('attack extras and support descriptions use the actual public card effects',()=>{
  const {cardView}=require('../agents/environment.cjs');
  const explosion=cardView({key:'noFuture'});assert.ok(explosion.effectText.some(s=>/explosion|bounce|wall|boundary/i.test(s)));
  const charm=cardView({key:'combo'});assert.ok(charm.effectText.some(s=>/combo/i.test(s)));
});
