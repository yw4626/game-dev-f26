'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {report}=require('./evaluate.cjs');
function compare(directories,output) {
  if(directories.length<2)throw Error('Pass baseline and live evaluation directories');
  const runs=directories.map(dir=>({dir:path.resolve(dir),manifest:JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')),results:JSON.parse(fs.readFileSync(path.join(dir,'results.json'),'utf8'))}));
  const reference=runs[0].manifest;
  for(const run of runs){
    assert.equal(run.manifest.formal,true,'Use formal suite runs, not development episodes');
    assert.deepEqual(run.manifest.suite,reference.suite,'Suite/seed/budget mismatch');
    for(const key of ['game','interface','suite','baseline','prompt','runner','adapter'])assert.equal(run.manifest.hashes[key],reference.hashes[key],'Mismatched '+key+' version; rerun matching competitors');
  }
  assert.ok(runs.some(r=>r.manifest.kind==='scripted'),'Missing baseline');
  assert.ok(runs.some(r=>r.manifest.kind==='gemini'),'Missing live-model run');
  const results=runs.flatMap(r=>r.results.map(v=>({...v,trace:path.relative(path.dirname(output),path.join(r.dir,v.trace)).replaceAll('\\','/')})));
  const seen=new Set();for(const r of results){const id=[r.case,r.trial,r.player,r.memory].join('/');if(seen.has(id))throw Error('Duplicate trial: '+id);seen.add(id);}
  const modelRuns=runs.filter(r=>r.manifest.kind==='gemini');
  for(const r of modelRuns)assert.deepEqual(r.manifest.config,modelRuns[0].manifest.config,'Model configurations differ; do not pool them');
  const manifest={...reference,id:'paired-comparison',startedAt:new Date().toISOString(),config:modelRuns[0].manifest.config};
  const counts=[];
  for(const mode of ['none','bounded']){
    const rows=results.filter(r=>r.player==='gemini'&&r.memory===mode);
    counts.push(`- Gemini ${mode}: ${rows.filter(r=>r.success).length}/${rows.length} completed; planned ${reference.suite.cases.length*reference.suite.trials} trials.`);
  }
  fs.writeFileSync(output,report(manifest,results)+'\n## Memory comparison\n\n'+counts.join('\n')+'\n\nDo not infer a memory benefit when trials are missing or configurations differ. Baseline repetitions are deterministic controls.\n\n## Trace links\n\n'+results.map(r=>`- [${r.case}, trial ${r.trial}, ${r.player}/${r.memory}](${r.trace})`).join('\n')+'\n');
  return output;
}
if(require.main===module){try{const args=process.argv.slice(2);console.log(compare(args,path.resolve('EVALUATION.md')));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={compare};
