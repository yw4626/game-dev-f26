'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PlayerEnvironment}=require('./environment.cjs');
const {createScriptedPlayer}=require('./scripted.cjs');
const {GeminiPlayer}=require('./gemini.cjs');
const ROOT=path.resolve(__dirname,'..');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function versionHashes() {
  const files=fs.readdirSync(path.join(ROOT,'dist')).filter(f=>f.endsWith('.js')).sort();
  return {game:hash(Buffer.concat(files.flatMap(f=>[Buffer.from(f),fs.readFileSync(path.join(ROOT,'dist',f))]))),suite:hash(fs.readFileSync(path.join(__dirname,'suite.json'))),
    interface:hash(fs.readFileSync(path.join(__dirname,'environment.cjs'))),baseline:hash(fs.readFileSync(path.join(__dirname,'scripted.cjs'))),prompt:hash(fs.readFileSync(path.join(__dirname,'player-prompt.txt'))),
    runner:hash(fs.readFileSync(__filename)),adapter:hash(Buffer.concat(['gemini.cjs','vertex-auth.cjs'].map(f=>fs.readFileSync(path.join(__dirname,f)))))};
}
function publicInput(env,history,memory,historyLength) {
  return JSON.parse(JSON.stringify({observation:env.observe('player'),legalActions:env.legal_actions('player'),history:memory==='bounded'?history.slice(-historyLength):[]}));
}
async function episode({testCase,trial=1,kind='scripted',memory='none',suite,config,ledger,write=()=>{},policyOverride}) {
  const env=new PlayerEnvironment({...suite,character:testCase.character});env.reset(testCase.seed);
  const policy=policyOverride||(kind==='gemini'?new GeminiPlayer(config,{ledger}):createScriptedPlayer());
  const started=performance.now(),history=[],latencies=[],totals={calls:0,failedCalls:0,inputTokens:0,outputTokens:0,thinkingTokens:0,costUSD:0,usageMissingCalls:0};
  let externalReason=null;
  write({type:'start',testCase,trial,kind,memory,startedAt:new Date().toISOString()});
  while(!env.outcome().terminal) {
    if(performance.now()-started>=suite.episodeTimeoutMs){externalReason='episode_timeout';break;}
    if(kind==='gemini'&&totals.calls>=suite.callLimit){externalReason='call_limit';break;}
    const input=publicInput(env,history,memory,suite.historyLength);
    if(!input.legalActions.length){externalReason='no_legal_actions';break;}
    let response,start=performance.now();
    try {
      if(kind==='gemini') {
        totals.calls++;
        response=await policy.choose(input,{timeoutMs:Math.min(suite.callTimeoutMs,suite.episodeTimeoutMs-(performance.now()-started))});
      } else response={action:policy.choose(input),usage:null,costUSD:0,latencyMs:performance.now()-start};
    } catch(error) {
      if(error.attempted===false)totals.calls--;
      else totals.failedCalls++;
      response={error:error.code||'policy_error',usage:error.usage||null,costUSD:error.costUSD||0,costBasis:error.costBasis,latencyMs:error.latencyMs||performance.now()-start,attempted:error.attempted};
      // Invalid model JSON is a failed decision and may be retried from a fresh observation;
      // transport/auth errors terminate the episode, with no fallback player.
      externalReason=response.error==='invalid_response'?null:response.error;
    }
    if(kind==='gemini') {
      totals.costUSD+=response.costUSD;
      if(response.usage)for(const k of ['inputTokens','outputTokens','thinkingTokens'])totals[k]+=response.usage[k]||0;
      else if(response.attempted!==false)totals.usageMissingCalls++;
    }
    latencies.push(response.latencyMs);
    const before=input.observation;
    const transition=externalReason?null:env.step('player',{id:response.action||'INVALID_RESPONSE',revision:before.revision});
    const after=transition?.observation;
    const summary={action:response.action||null,error:response.error||null,accepted:!!transition?.ok,phaseBefore:before.phase,phaseAfter:after?.phase||before.phase,
      floor:after?.floor||before.floor,health:after?.health??before.health,gold:after?.gold??before.gold};
    history.push(summary);if(history.length>suite.historyLength)history.shift();
    write({type:'decision',index:before.revision,input,response,result:summary,outcome:transition?.outcome||env.outcome()});
    if(externalReason)break;
  }
  const raw=env.outcome(),outcome=externalReason?{...raw,terminal:true,success:false,reason:externalReason}:raw;
  const sorted=[...latencies].sort((a,b)=>a-b),result={case:testCase.id,seed:testCase.seed,character:testCase.character,split:testCase.split,trial,player:kind,memory,
    ...outcome,...totals,elapsedMs:performance.now()-started,meanDecisionLatencyMs:latencies.reduce((a,b)=>a+b,0)/(latencies.length||1),p95DecisionLatencyMs:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]||0};
  write({type:'finish',result});return result;
}
function report(manifest,results) {
  const live=results.filter(r=>r.player==='gemini'),script=results.filter(r=>r.player==='scripted');
  const table=results.map(r=>`| ${r.case} | ${r.trial} | ${r.player}/${r.memory} | ${r.reason} | ${r.score} | ${r.steps} | ${r.decisions} | ${r.invalidActions} | ${r.calls}/${r.failedCalls} | ${r.meanDecisionLatencyMs.toFixed(1)} | ${r.inputTokens}/${r.outputTokens}/${r.thinkingTokens} | ${r.costUSD.toFixed(5)} |`).join('\n');
  return `# Evaluation — ${manifest.id}\n\nGenerated ${manifest.startedAt}. Game package ${manifest.gameVersion}. Suite ${manifest.suite.id}.\n\n`+
  `## Scope and predeclared design\n\n${manifest.suite.scope}\n\nThree frozen starts, two fresh episodes per start; one held-out case. Development seeds are separate. The deterministic baseline repeats check reproducibility, not independent statistical samples. Model modes: current observation only and last ${manifest.suite.historyLength} public decision summaries. Same engine, observations, action legality, start seeds, step limits and navigation macro. The heuristic also retains its own visited-service coordinates from public observations; this asymmetric policy memory is disclosed. A full five-floor test is a separate smoke test, not the primary suite.\n\n`+
  `Limits: ${manifest.suite.stepLimit} engine steps, ${manifest.suite.decisionLimit} decisions, ${manifest.suite.callLimit} attempted model decisions, ${manifest.suite.invalidLimit} illegal actions; ${manifest.suite.callTimeoutMs} ms per call and ${manifest.suite.episodeTimeoutMs} ms per episode. No fallback, no hidden retry. Provider/timeout failures terminate and count as failed calls. Invalid JSON is recorded and consumes an invalid action.\n\n`+
  `## Actual results\n\nBaseline completions: ${script.filter(r=>r.success).length}/${script.length}. Live-model completions: ${live.filter(r=>r.success).length}/${live.length}.\n\n`+
  (!live.length?'**Live Gemini evaluation has NOT run. These are genuine engine/baseline results, not model results. API credentials and approved budget are still required; model comparison and memory-effect conclusions remain pending.**\n\n':'Live rows are fresh API calls. Results are small-sample observations, not a statistical performance guarantee.\n\n')+
  `| Case | Trial | Player/memory | Terminal reason | Score | Steps | Decisions | Illegal | Calls/failed | Mean latency ms | Input/output/thinking tokens | Est. USD |\n|---|---:|---|---|---:|---:|---:|---:|---|---:|---|---:|\n${table}\n\n`+
  `## Reproduction and evidence\n\nThe adjacent manifest.json freezes seed suite, model/configuration, limits and SHA-256 hashes. results.json contains p95 latency and missing-usage counts. traces/*.jsonl contain every public model input, chosen action, provider metadata and engine outcome; no credentials or private engine state. Replay is a deterministic validation of the recorded actions, not a new live trial.\n\n`+
  `Hashes:\n\n\`\`\`json\n${JSON.stringify(manifest.hashes,null,2)}\n\`\`\`\n\n`+
  `Pricing: ${manifest.config?JSON.stringify(manifest.config.pricing):'No API calls; $0.'} Costs include thinking tokens. If usage is unavailable after a sent request, retain the conservative preflight reservation and mark usageMissingCalls; do not claim the request was free. Cached inputs are conservatively charged at standard input rates. Budget estimates are not a provider-side hard billing cap.\n\n`+
  `## Limitations and remaining course evidence\n\nEvaluation covers first-floor decisions, not complete five-floor model mastery. It uses structured state and omits visual/perceptual and animation latency. Success does not measure fun, clarity, or faithfulness to the original game. Seed matching cannot force identical RNG trajectories after policies take different actions. The suite was declared on October 31, not retrospectively at the October 19 checkpoint. No remote CI result, peer feedback, independent review, two-session skill-use proof, user-authored team log, or 3–5 minute recording is fabricated. See COURSE-READINESS.md for outstanding submission artifacts. Local tests are recorded separately; remote course CI remains pending.\n`;
}
function argsOf(argv) {
  const result={};for(let i=0;i<argv.length;i++){if(!argv[i].startsWith('--'))throw Error('Expected --option');const key=argv[i].slice(2);result[key]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;}return result;
}
async function main(argv=process.argv.slice(2)) {
  const args=argsOf(argv),kind=args.player||'scripted';if(!['scripted','gemini'].includes(kind))throw Error('--player must be scripted or gemini');
  const suite=JSON.parse(fs.readFileSync(path.join(__dirname,'suite.json'),'utf8'));
  let config=null;
  if(kind==='gemini') {
    if(!args.config)throw Error('Provide --config agents/gemini.local.json after local credential setup');
    try{config=JSON.parse(fs.readFileSync(path.resolve(args.config),'utf8'));}catch{throw Error('Cannot read valid model configuration JSON; check the local config file');}
    const allowed=['provider','model','temperature','maxOutputTokens','budgetUSD','pricing','project','location'];
    if(Object.keys(config).some(k=>!allowed.includes(k)))throw Error('Unknown config field; API keys must be environment variables, never config');
    new GeminiPlayer(config); // fail before creating a misleading empty live result folder
  }
  const formal=!args.dev&&!args.full;
  if(!formal){suite.cases=[{id:args.full?'full-run-smoke':'development',seed:args.seed||suite.developmentSeeds[0],character:args.character||'antonio',split:'development'}];suite.trials=1;if(args.full){suite.goalFloor=6;suite.stepLimit=15000;suite.decisionLimit=6000;}}
  const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+kind+(formal?'-suite':'-dev');
  const dir=path.join(ROOT,'evaluation',id);fs.mkdirSync(path.join(dir,'traces'),{recursive:true});
  const manifest={id,startedAt:new Date().toISOString(),gameVersion:require('../package.json').version,formal,kind,suite,config,hashes:versionHashes(),node:process.version};
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
  const ledger={spentUSD:0},results=[];
  const modes=kind==='gemini'?suite.memoryModes:['stateful-public-history'];
  suiteLoop: for(const testCase of suite.cases)for(let trial=1;trial<=suite.trials;trial++)for(const memory of modes) {
    const trace=path.join(dir,'traces',`${testCase.id}-${trial}-${memory}.jsonl`);
    const result=await episode({testCase,trial,kind,memory,suite,config,ledger,write:record=>fs.appendFileSync(trace,JSON.stringify(record)+'\n')});
    result.trace=path.relative(dir,trace).replaceAll('\\','/');results.push(result);
    fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));
    fs.writeFileSync(path.join(dir,'EVALUATION.md'),report(manifest,results));
    console.log(`${testCase.id} trial=${trial} ${memory}: ${result.reason}, ${result.decisions} decisions, ${result.calls} calls, $${result.costUSD.toFixed(4)}`);
    if(kind==='gemini'&&['cost_limit','authentication_error','http_401','http_403','http_429'].includes(result.reason))break suiteLoop;
  }
  console.log('Evidence: '+dir);
  return dir;
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={episode,publicInput,versionHashes,report,main};
