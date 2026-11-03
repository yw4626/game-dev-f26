'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PlayerEnvironment}=require('./environment.cjs'),{GeminiPlayer}=require('./gemini.cjs'),{createScriptedPlayer}=require('./scripted.cjs'),{publicInput,versionHashes}=require('./evaluate.cjs');
const {ProgressGuard}=require('./progress-guard.cjs');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function summarize(manifest,rows){return '# 五层 AI 实验 / Full five-floor evaluation\n\n'+
  `实验 ${manifest.id}。模型 ${manifest.config.model}；最近 6 步公开记忆；3 角色 × 2 次，目标第五层最终胜利。模型仅接收公开玩家接口。用户授权本组六局不限金额；费用仍逐次记录。\n\n`+
  `已结束 ${rows.length}/6，成功 ${rows.filter(r=>r.success).length}。未完成试次不能计入成功率。\n\n`+
  '| 角色 | 试次 | 结果 | 到达层 | 决策 | 请求 / 失败 | 击杀 | 剩余生命 | 估算 USD |\n|---|---:|---|---:|---:|---|---:|---:|---:|\n'+
  rows.map(r=>`| ${r.character} | ${r.trial} | ${r.reason} | ${r.floor} | ${r.decisions} | ${r.calls}/${r.failedCalls} | ${r.kills} | ${r.health} | ${r.costUSD.toFixed(5)} |`).join('\n')+
  '\n\n限制：15000 引擎步、6000 决策、6500 请求、每局4小时、单请求30秒。同一非战斗状态在128次决策内重复16次则记录停滞失败。临时限流/服务错误最多退避重试4次（5秒起，最多60秒）；每次失败单独留痕并保留缺失usage的费用预留，不用脚本接管，不替换失败局。未触发游戏变化时重试同一次公开观察。\n\n本组是宝石流程修改后的独立五层实验，不与旧版本第一层结果直接合并。脚本在同版本同种子另跑六局作为基线；观看页标注实时实验或回放，观看不触发付费模型请求。\n\n价格来源和版本哈希见 manifest.json；结果和全部请求见 results.json、traces/*.jsonl。费用估算不等于云账单。\n';}
async function runEpisode({testCase,trial,suite,config,ledger,dir,kind='gemini',policyOverride,sleepImpl=sleep}){
  const id=`${testCase.id}-${trial}`,file=path.join(dir,'traces',id+'.jsonl'),write=r=>fs.appendFileSync(file,JSON.stringify(r)+'\n');
  const game=new PlayerEnvironment({...suite,character:testCase.character});game.reset(testCase.seed);
  const policy=policyOverride||(kind==='gemini'?new GeminiPlayer(config,{ledger}):createScriptedPlayer()),history=[],started=Date.now(),latencies=[],guard=new ProgressGuard(suite);
  const totals={calls:0,failedCalls:0,inputTokens:0,outputTokens:0,thinkingTokens:0,costUSD:0,usageMissingCalls:0};let external=null;
  write({type:'start',testCase,trial,kind,memory:'bounded',startedAt:new Date().toISOString()});
  const status=(state,extra={})=>fs.writeFileSync(path.join(dir,'status.json'),JSON.stringify({state,episode:id,character:testCase.character,trial,outcome:game.outcome(),...totals,totalRunCostUSD:ledger.spentUSD,updatedAt:new Date().toISOString(),...extra}));
  while(!game.outcome().terminal&&!external){
    if(Date.now()-started>=suite.episodeTimeoutMs){external='episode_timeout';break;}
    const input=publicInput(game,history,'bounded',suite.historyLength);let response;
    const progress=guard.inspect(input.observation);
    if(progress?.stalled){external='repeated_state_limit';write({type:'stagnation',index:input.observation.revision,progress,outcome:game.outcome()});break;}
    if(progress?.notice)input.progressNotice={repeats:progress.repeats,message:progress.notice};
    if(!input.legalActions.length){external='no_legal_actions';break;}
    for(let retry=0;;retry++){
      if(kind==='gemini'&&totals.calls>=suite.callLimit){external='call_limit';break;}
      if(Date.now()-started>=suite.episodeTimeoutMs){external='episode_timeout';break;}
      status('running');const t=performance.now();
      write({type:'request_start',index:input.observation.revision,attempt:retry+1,at:new Date().toISOString(),inputHash:crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'),phase:input.observation.phase});
      try{
        if(kind==='gemini')totals.calls++;
        response=kind==='gemini'?await policy.choose(input,{timeoutMs:Math.min(suite.callTimeoutMs,suite.episodeTimeoutMs-(Date.now()-started))}):{action:policy.choose(input),costUSD:0,latencyMs:performance.now()-t};
      }catch(e){response={error:e.code||'policy_error',attempted:e.attempted,usage:e.usage||null,costUSD:e.costUSD||0,costBasis:e.costBasis,latencyMs:e.latencyMs||performance.now()-t,providerStatus:e.providerStatus,quota:e.quota};if(e.attempted===false)totals.calls--;else totals.failedCalls++;}
      if(kind==='gemini'){
        totals.costUSD+=response.costUSD||0;
        if(response.usage)for(const k of ['inputTokens','outputTokens','thinkingTokens'])totals[k]+=response.usage[k]||0;
        else if(response.attempted!==false)totals.usageMissingCalls++;
      }latencies.push(response.latencyMs);
      const canRetry=response.error&&suite.retry.codes.includes(response.error)&&retry<suite.retry.maxRetries;
      write({type:'request',index:input.observation.revision,attempt:retry+1,response,willRetry:!!canRetry});
      if(!canRetry)break;
      const delay=Math.min(suite.retry.initialDelayMs*2**retry,suite.retry.maximumDelayMs,Math.max(0,suite.episodeTimeoutMs-(Date.now()-started)));
      status('retry_wait',{error:response.error,retry:retry+1,retryAt:new Date(Date.now()+delay).toISOString()});
      console.log(`${id}: ${response.error}, retry ${retry+1} in ${delay/1000}s; total $${ledger.spentUSD.toFixed(4)}`);
      await sleepImpl(delay);
    }
    if(external)break;
    if(response.error&&response.error!=='invalid_response'){external=response.error;write({type:'decision',index:input.observation.revision,input,response,result:{accepted:false,phaseBefore:input.observation.phase,phaseAfter:input.observation.phase},outcome:game.outcome()});break;}
    const transition=game.step('player',{id:response.action||'INVALID_RESPONSE',revision:input.observation.revision});
    const result={action:response.action||null,error:response.error||null,accepted:transition.ok,phaseBefore:input.observation.phase,phaseAfter:transition.observation.phase,floor:transition.observation.floor,health:transition.observation.health,gold:transition.observation.gold};
    history.push(result);if(history.length>suite.historyLength)history.shift();
    write({type:'decision',index:input.observation.revision,input,response,result,outcome:transition.outcome});status('running');
    if(transition.outcome.decisions%50===0)console.log(`${id}: F${transition.outcome.floor}, ${transition.outcome.decisions} decisions, HP ${transition.outcome.health}, $${totals.costUSD.toFixed(4)}`);
  }
  const sorted=latencies.toSorted((a,b)=>a-b),raw=game.outcome();
  const result={case:testCase.id,seed:testCase.seed,character:testCase.character,trial,split:testCase.split,player:kind,memory:'bounded',...raw,...(external?{terminal:true,success:false,reason:external}:{}),...totals,elapsedMs:Date.now()-started,meanDecisionLatencyMs:latencies.reduce((a,b)=>a+b,0)/(latencies.length||1),p95DecisionLatencyMs:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]||0,trace:'traces/'+id+'.jsonl'};
  write({type:'finish',result});status('episode_finished',{result});return result;
}
async function main(){
  const suite=require('./full-suite.json'),kind=process.argv.includes('--scripted')?'scripted':'gemini',config=JSON.parse(fs.readFileSync(path.join(__dirname,'gemini.full.local.json'),'utf8'));
  const id='full-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+kind,dir=path.join(ROOT,'evaluation',id);fs.mkdirSync(path.join(dir,'traces'),{recursive:true});
  const manifest={id,startedAt:new Date().toISOString(),kind,suite,config,hashes:versionHashes(),fullRunnerHash:sha(__filename),progressGuardHash:sha(path.join(__dirname,'progress-guard.cjs')),fullSuiteHash:sha(path.join(__dirname,'full-suite.json')),gameVersion:require('../package.json').version};fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
  const rows=[],ledger={spentUSD:0},preserved=new Map();console.log('Evidence: '+dir);
  const resumeIndex=process.argv.indexOf('--resume-from');
  if(resumeIndex>=0){
    if(kind!=='gemini'||!process.argv[resumeIndex+1])throw Error('Resume requires a previous Gemini batch');
    const source=path.resolve(process.argv[resumeIndex+1]),prior=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8')),priorRows=JSON.parse(fs.readFileSync(path.join(source,'results.json'),'utf8'));
    assert.equal(prior.kind,kind);assert.deepEqual(prior.suite,suite);assert.deepEqual(prior.config,config);assert.equal(prior.progressGuardHash,manifest.progressGuardHash);
    for(const key of ['game','interface','prompt','baseline','suite'])assert.equal(prior.hashes[key],manifest.hashes[key],'Resume cannot change '+key);
    const expected=new Set(suite.cases.flatMap(c=>Array.from({length:suite.trials},(_,i)=>c.id+'-'+(i+1))));assert.equal(priorRows.length,expected.size);
    manifest.resumedFrom=path.relative(ROOT,source).replaceAll('\\','/');manifest.preservedEpisodes=[];manifest.retriedPreflightFailures=[];manifest.originalTransportHashes={adapter:prior.hashes.adapter,runner:prior.fullRunnerHash};
    for(const r of priorRows){
      const episode=r.case+'-'+r.trial;assert.ok(expected.delete(episode),'Duplicate or unexpected episode');
      const trace=path.resolve(source,r.trace);assert.equal(path.dirname(trace),path.join(source,'traces'));
      const requests=fs.readFileSync(trace,'utf8').trim().split('\n').map(JSON.parse).filter(x=>x.type==='request');
      const preflightOnly=['authentication_error','credential_timeout'].includes(r.reason)&&r.decisions===0&&requests.length>0&&requests.every(x=>x.response.attempted===false);
      if(preflightOnly){manifest.retriedPreflightFailures.push({episode,sourceTrace:r.trace,reason:r.reason});continue;}
      // Keep ALL actual game outcomes, including losses, limits and provider failures.
      preserved.set(episode,r);ledger.spentUSD+=r.costUSD||0;fs.copyFileSync(trace,path.join(dir,r.trace));manifest.preservedEpisodes.push({episode,sourceTrace:r.trace,reason:r.reason});
    }
    fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
  }
  if(kind==='gemini'){
    fs.writeFileSync(path.join(dir,'status.json'),JSON.stringify({state:'preparing_credentials',totalRunCostUSD:ledger.spentUSD}));
    const t=Date.now();try{await new GeminiPlayer(config,{ledger}).prepare();fs.writeFileSync(path.join(dir,'credential-preflight.json'),JSON.stringify({ready:true,elapsedMs:Date.now()-t,tokenLogged:false}));}
    catch(e){fs.writeFileSync(path.join(dir,'status.json'),JSON.stringify({state:'credential_preflight_failed',error:e.code||'authentication_error',totalRunCostUSD:ledger.spentUSD}));throw Error(e.code||'authentication_error');}
  }
  for(const testCase of suite.cases)for(let trial=1;trial<=suite.trials;trial++){
    rows.push(preserved.get(testCase.id+'-'+trial)||await runEpisode({testCase,trial,suite,config,ledger,dir,kind}));fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(rows,null,2));fs.writeFileSync(path.join(dir,'REPORT.md'),summarize(manifest,rows));
    const r=rows.at(-1);console.log(`${r.case}/${r.trial}: ${r.reason}, floor ${r.floor}, $${r.costUSD.toFixed(4)}`);
  }
  fs.writeFileSync(path.join(dir,'status.json'),JSON.stringify({state:'finished',totalRunCostUSD:ledger.spentUSD,episodes:rows.length,successes:rows.filter(r=>r.success).length}));console.log('All six episodes finished. '+dir);
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={runEpisode,summarize};
