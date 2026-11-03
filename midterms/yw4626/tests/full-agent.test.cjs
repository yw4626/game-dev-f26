'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {runEpisode}=require('../agents/full-evaluate.cjs'),{createWatchHandler}=require('../agents/watch-server.cjs'),{PlayerEnvironment}=require('../agents/environment.cjs');
const suite=require('../agents/full-suite.json');
test('recorded temporary failures retry same decision; cost and requests retained, no scripted fallback',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-full-test-'));fs.mkdirSync(path.join(dir,'traces'));let calls=0;const revisions=[],sleeps=[];
 const r=await runEpisode({dir,testCase:{id:'full-test',seed:'AGENT-DEV-A',character:'antonio'},trial:1,suite:{...suite,decisionLimit:1},config:{},ledger:{spentUSD:0},sleepImpl:async ms=>sleeps.push(ms),policyOverride:{choose:async input=>{revisions.push(input.observation.revision);calls++;if(calls===1)throw Object.assign(Error(),{code:'http_429',attempted:true,costUSD:.01});return {action:'turn:left',usage:{inputTokens:10,outputTokens:2},costUSD:.001,latencyMs:1};}}});
 assert.equal(r.reason,'decision_limit');assert.equal(calls,2);assert.deepEqual(revisions,[0,0]);assert.deepEqual(sleeps,[suite.retry.initialDelayMs]);assert.equal(r.failedCalls,1);assert.equal(r.decisions,1);assert.equal(r.usageMissingCalls,1);assert.ok(Math.abs(r.costUSD-.011)<1e-10);
});

test('repeated valid actions terminate as explicit stagnation; never replaced with scripted choices',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-stall-test-'));fs.mkdirSync(path.join(dir,'traces'));let calls=0,warnings=0;
 const r=await runEpisode({dir,testCase:{id:'full-test',seed:'AGENT-DEV-A',character:'antonio'},trial:1,suite:{...suite,decisionLimit:200,repetitionLimit:4,repetitionWarnAt:2,repetitionWindow:30},config:{},ledger:{spentUSD:0},policyOverride:{choose:async input=>{calls++;if(input.progressNotice)warnings++;return {action:'turn:left',costUSD:0,latencyMs:1};}}});
 assert.equal(r.reason,'repeated_state_limit');assert.equal(r.success,false);assert.equal(r.decisions,calls);assert.ok(calls<20);assert.ok(warnings>0);
});
test('persistent HTTP failures stop at the declared retry ceiling and preserve each attempt',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-retry-test-'));fs.mkdirSync(path.join(dir,'traces'));let calls=0;const waits=[];
 const r=await runEpisode({dir,testCase:{id:'full-test',seed:'AGENT-DEV-A',character:'antonio'},trial:1,suite:{...suite,retry:{...suite.retry,maxRetries:2}},config:{},ledger:{spentUSD:0},sleepImpl:async n=>waits.push(n),policyOverride:{choose:async()=>{calls++;throw Object.assign(Error(),{code:'http_429',attempted:true,costUSD:.01});}}});
 assert.equal(r.reason,'http_429');assert.equal(calls,3);assert.equal(r.failedCalls,3);assert.equal(r.decisions,0);assert.deepEqual(waits,[5000,10000]);
 const log=fs.readFileSync(path.join(dir,'traces','full-test-1.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(log.filter(x=>x.type==='request_start').length,3);assert.equal(log.filter(x=>x.type==='request').length,3);
});
test('trusted spectator receives detached render snapshots, never included in public observation',()=>{
 let snapshot;const e=new PlayerEnvironment({},s=>snapshot=s);e.reset('AGENT-DEV-A');snapshot.data.health=999;assert.notEqual(e.observe('player').health,999);assert.equal(e.observe('player').snapshot,undefined);e.step('player',{id:'turn:left',revision:0});assert.notEqual(snapshot.data.health,999);
});
test('viewer replays exact engine state, rewinds, rejects paths and non-read requests',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-watch-test-')),dir=path.join(root,'evaluation','full-test');fs.mkdirSync(path.join(dir,'traces'),{recursive:true});
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({suite,kind:'scripted'}));const testCase={seed:'AGENT-DEV-A',character:'antonio'},e=new PlayerEnvironment({...suite,character:'antonio'});e.reset(testCase.seed);const input={observation:e.observe('player')},t=e.step('player',{id:'turn:left',revision:0});
 fs.writeFileSync(path.join(dir,'traces','full-test-1.jsonl'),[JSON.stringify({type:'start',testCase,kind:'scripted'}),JSON.stringify({type:'decision',input,response:{action:'turn:left'},result:{accepted:t.ok}}),''].join('\n'));
 const handler=createWatchHandler(root);function call(url,method='GET'){let status,body;handler({url,method,headers:{}},{writeHead:s=>status=s,end:s=>body=JSON.parse(s)});return {status,body};}
 const url='/api/ai/frame?run=full-test&episode=full-test-1&index=';assert.equal(call(url+'1').body.snapshot.data.dungeon.dir,t.observation.position.dir);assert.equal(call(url+'0').body.index,0);assert.equal(call('/api/ai/frame?run=../&episode=x').status,404);assert.equal(call('/api/ai/runs','POST').status,405);
});

test('viewer tolerates partial status writes and a batch being created without hiding existing runs',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-watch-race-')),dir=path.join(root,'evaluation','full-test');fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({suite,kind:'scripted'}));const state=path.join(dir,'status.json');fs.writeFileSync(state,'{');
 const handler=createWatchHandler(root);function call(){let status,body;handler({url:'/api/ai/runs',method:'GET',headers:{}},{writeHead:s=>status=s,end:s=>body=JSON.parse(s)});assert.equal(status,200);return body.runs;}
 assert.equal(call()[0].status.state,'preparing');assert.deepEqual(call()[0].episodes,[]);
 fs.writeFileSync(state,JSON.stringify({state:'running',episode:'full-test-1'}));assert.equal(call()[0].status.state,'running');
 fs.writeFileSync(state,'');assert.equal(call()[0].status.episode,'full-test-1');
 const other=path.join(root,'evaluation','full-new');fs.mkdirSync(other);fs.writeFileSync(path.join(other,'manifest.json'),'{');assert.equal(call().length,1);
 fs.writeFileSync(state,JSON.stringify({state:'finished'}));assert.equal(call()[0].status.state,'finished');
});

test('viewer keeps partial UTF-8 trace records until complete and tolerates partial status during playback',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dusk-watch-chunk-')),dir=path.join(root,'evaluation','full-test');fs.mkdirSync(path.join(dir,'traces'),{recursive:true});
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({suite,kind:'scripted'}));const file=path.join(dir,'traces','full-test-1.jsonl');
 const start=Buffer.from(JSON.stringify({type:'start',testCase:{seed:'花园种子',character:'antonio'},kind:'scripted'})+'\n');const cut=start.indexOf(Buffer.from('花'))+1;fs.writeFileSync(file,start.subarray(0,cut));
 const handler=createWatchHandler(root);function call(){let status,body;handler({url:'/api/ai/frame?run=full-test&episode=full-test-1&index=latest',method:'GET',headers:{}},{writeHead:s=>status=s,end:s=>body=JSON.parse(s)});assert.equal(status,200);return body;}
 assert.equal(call().waiting,true);fs.appendFileSync(file,start.subarray(cut));fs.writeFileSync(path.join(dir,'status.json'),'{');const result=call();assert.equal(result.seed,'花园种子');assert.equal(result.index,0);assert.equal(result.runStatus,null);
});
