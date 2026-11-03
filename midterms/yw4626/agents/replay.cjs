'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PlayerEnvironment}=require('./environment.cjs'),{versionHashes}=require('./evaluate.cjs');
function replay(file,{verifyHashes=true}={}) {
  const rows=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse),start=rows[0];
  const manifest=JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),'..','manifest.json'),'utf8'));
  if(verifyHashes)for(const key of ['game','interface'])assert.equal(versionHashes()[key],manifest.hashes[key],'Cannot replay different '+key+' version');
  const env=new PlayerEnvironment({...manifest.suite,character:start.testCase.character});env.reset(start.testCase.seed);let count=0;
  for(const row of rows.filter(r=>r.type==='decision')) {
    assert.deepEqual(env.observe('player'),row.input.observation,'Observation mismatch at '+row.index);
    assert.deepEqual(env.legal_actions('player'),row.input.legalActions,'Legal actions mismatch at '+row.index);
    if(!row.response.error||row.response.error==='invalid_response') {
      const result=env.step('player',{id:row.response.action||'INVALID_RESPONSE',revision:row.input.observation.revision});
      assert.equal(result.ok,row.result.accepted);assert.deepEqual(result.outcome,row.outcome,'Outcome mismatch at '+row.index);
    }
    count++;
  }
  const finish=rows.at(-1);assert.equal(finish.type,'finish','Incomplete trace');
  const actual=env.outcome();for(const key of ['floor','health','gold','kills','steps','decisions','invalidActions'])if(key in actual)assert.deepEqual(finish.result[key],actual[key],'Final '+key+' mismatch');
  if(actual.terminal){assert.equal(finish.result.reason,actual.reason);assert.equal(finish.result.success,actual.success);}
  else {assert.equal(finish.result.success,false);assert.equal(finish.result.terminal,true);assert.ok(/^(episode_timeout|call_limit|repeated_state_limit|no_legal_actions|cost_limit|authentication_error|credential_timeout|call_timeout|provider_error|policy_error|http_\d+)$/.test(finish.result.reason),'Unrecognized external stop');if(!['episode_timeout','call_limit','repeated_state_limit','no_legal_actions'].includes(finish.result.reason))assert.ok(rows.some(r=>(r.type==='request'||r.type==='decision')&&r.response?.error===finish.result.reason),'External stop lacks error evidence');}
  return {decisions:count,engineOutcome:env.outcome(),recordedOutcome:rows.at(-1).result.reason,live:false};
}
if(require.main===module){try{console.log(JSON.stringify(replay(path.resolve(process.argv[2])),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={replay};
