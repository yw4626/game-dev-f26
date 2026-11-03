'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {episode,versionHashes}=require('./evaluate.cjs');
const {runEpisode}=require('./full-evaluate.cjs');
const {GeminiPlayer}=require('./gemini.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'evaluation','final-v1-2026-11-02');
function atomic(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2));}
function persistentLedger(file){
 let value=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8').trim().split('\n').at(-1)).spentUSD:0;
 assert.ok(Number.isFinite(value)&&value>=0,'Invalid ledger');
 return {get spentUSD(){return value;},set spentUSD(v){assert.ok(Number.isFinite(v)&&v>=-1e-9);value=Math.max(0,v);const fd=fs.openSync(file,'a');try{fs.writeSync(fd,JSON.stringify({budgetUSD:10,spentUSD:value,updatedAt:new Date().toISOString(),includesMissingUsageReservations:true})+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}};
}
async function main(){
 const live=process.argv.includes('--live'),kind=live?'gemini':'scripted';
 fs.mkdirSync(OUT,{recursive:true});
 const lock=path.join(OUT,'runner.lock');const fd=fs.openSync(lock,'wx');
 try{
  let config=null;
  if(live){
   const index=process.argv.indexOf('--config');assert.ok(index>=0&&process.argv[index+1],'--live requires --config');
   config=JSON.parse(fs.readFileSync(path.resolve(process.argv[index+1])));
   const allowed=['provider','model','temperature','maxOutputTokens','budgetUSD','pricing','project','location'];
   assert.ok(Object.keys(config).every(k=>allowed.includes(k)),'Unknown config fields; never include secrets');
   config.budgetUSD=10;config.pricing={date:'2026-11-02',source:'https://cloud.google.com/model-garden/pricing',inputPerMillionUSD:.30,outputPerMillionUSD:2.50,note:'Global standard rates verified 2026-11-02; failed/missing usage reservations retained.'};
   assert.equal(config.provider,'vertex');assert.equal(config.location,'global');assert.equal(config.model,'gemini-3.5-flash-lite');
  }
  const suites={full:require('./final-full-suite.json'),memory:require('./final-memory-suite.json')};
  const runnerHashes=Object.fromEntries(['final-evaluate.cjs','full-evaluate.cjs','progress-guard.cjs'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,f))).digest('hex')]));
  const frozen={hashes:versionHashes(),runnerHashes,suites,gameVersion:require('../package.json').version};
  const freeze=path.join(OUT,'freeze.json');
  if(fs.existsSync(freeze))assert.deepEqual(JSON.parse(fs.readFileSync(freeze)),frozen,'Version changed: stop, preserve this batch and declare new version');else atomic(freeze,frozen);
  const ledger=persistentLedger(path.join(OUT,'budget.jsonl'));
  if(live){const file=path.join(OUT,'model-config.json');if(fs.existsSync(file))assert.deepEqual(JSON.parse(fs.readFileSync(file)),config);else atomic(file,config);await new GeminiPlayer(config,{ledger}).prepare();}
  for(const [scope,suite] of Object.entries(suites)){
   const dir=path.join(ROOT,'evaluation','full-final-v1-'+scope+'-'+kind);fs.mkdirSync(path.join(dir,'traces'),{recursive:true});
   const manifest={id:'final-v1-'+scope+'-'+kind,startedAt:new Date().toISOString(),kind,suite,config,hashes:frozen.hashes,runnerHashes,gameVersion:frozen.gameVersion};
   if(!fs.existsSync(path.join(dir,'manifest.json')))atomic(path.join(dir,'manifest.json'),manifest);
   const resultFile=path.join(dir,'results.json'),rows=fs.existsSync(resultFile)?JSON.parse(fs.readFileSync(resultFile)):[];
   for(const testCase of suite.cases)for(let trial=1;trial<=suite.trials;trial++)for(const memory of scope==='full'?['bounded']:live?['none','bounded']:['stateful-public-history']){
    if(rows.some(r=>r.case===testCase.id&&r.trial===trial&&r.memory===memory))continue;
    const filename=testCase.id+'-'+trial+(scope==='full'?'':'-'+memory)+'.jsonl',file=path.join(dir,'traces',filename);
    assert.ok(!fs.existsSync(file),'Interrupted trace retained. Audit before restarting; never replace an attempted episode.');
    console.log('Starting '+scope+' '+kind+' '+filename);
    const r=scope==='full'?await runEpisode({testCase,trial,suite,config,ledger,dir,kind}):await episode({testCase,trial,suite,config,ledger,kind,memory,write:r=>fs.appendFileSync(file,JSON.stringify(r)+'\n')});
    r.trace='traces/'+filename;rows.push(r);atomic(resultFile,rows);console.log(`${r.case}/${trial}/${memory}: ${r.reason}; total USD ${ledger.spentUSD.toFixed(5)}`);
    if(live&&['cost_limit','authentication_error','credential_timeout','http_401','http_403'].includes(r.reason))return;
   }
  }
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={persistentLedger,atomic};
