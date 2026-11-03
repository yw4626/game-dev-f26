'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'evaluation');
function generate(){
 const groups=['full-scripted','full-gemini','memory-scripted','memory-gemini'];let output='# Final evaluation v1 — 2026-11-02\n\n';
 output+='This report covers only the frozen final version. Old EVALUATION.md and FULL_EVALUATION.md are historical development evidence, not pooled results. Protocol: [FINAL-PROTOCOL.md](FINAL-PROTOCOL.md).\n\n';
 let all=[];
 for(const g of groups){const file=path.join(base,'full-final-v1-'+g,'results.json');const rows=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):[];all.push(...rows.map(r=>({...r,group:g})));const expected=g==='memory-gemini'?12:6;
 output+=`## ${g}\n\nCompleted ${rows.length}/${expected}; successful ${rows.filter(r=>r.success).length}/${rows.length||0}. Missing episodes are not successes.\n\n|Case|Trial|History|Outcome|Floor|Steps|Illegal|Requests / failures|Mean / p95 ms|Input / output / thinking|USD|\n|---|---:|---|---|---:|---:|---:|---|---|---|---:|\n`;
 for(const r of rows)output+=`|${r.case}|${r.trial}|${r.memory}|${r.reason}|${r.floor}|${r.steps}|${r.invalidActions}|${r.calls}/${r.failedCalls}|${r.meanDecisionLatencyMs.toFixed(1)}/${r.p95DecisionLatencyMs.toFixed(1)}|${r.inputTokens}/${r.outputTokens}/${r.thinkingTokens}|${r.costUSD.toFixed(6)}|\n`;
 }
 const ledger=path.join(base,'final-v1-2026-11-02','budget.jsonl');const spent=fs.existsSync(ledger)?JSON.parse(fs.readFileSync(ledger,'utf8').trim().split('\n').at(-1)).spentUSD:0;
 output+=`\nTotal reserved/settled final API estimate: $${spent.toFixed(6)} of $10. In-flight reservations may exceed summed completed-episode costs. Failed requests with missing usage retain conservative reservations. Not a cloud invoice. Prices: global standard Gemini 3.5 Flash-Lite $0.30/M input, $2.50/M output including reasoning, verified 2026-11-02: https://cloud.google.com/model-garden/pricing .\n\n`;
 output+='## Interpretation and limits\n\nRepeated deterministic script trials are reproducibility checks, not independent samples. Cases share initial seeds but different actions lead to different RNG trajectories. Scripts retain public visit memory; the model comparison changes only the last-six-public-step history. No claim of memory benefit is warranted until all twelve planned trials are available; with two trials per cell any difference is descriptive only. Structured agents do not assess visual clarity, fun or human tutorial usability. Network timeouts and illegal responses remain failures and are never replaced by script choices.\n\nUse agents/replay.cjs on each trace; its manifest must match the frozen engine. API-free replay is not a fresh model call. The AI Watch page supports the six full trials. Memory-condition traces can be validated with the CLI. Current freeze and budget are in evaluation/final-v1-2026-11-02; per-scope manifests and traces are in evaluation/full-final-v1-*.\n\nPeer feedback, student final reflection/limitations confirmation, recording link, remote course CI and CourseWorks URL submission remain separately tracked in HUMAN-EVIDENCE-PENDING.md.\n';
 fs.writeFileSync(path.join(root,'FINAL-EVALUATION.md'),output);fs.writeFileSync(path.join(base,'final-v1-2026-11-02','summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),spentUSD:spent,results:all},null,2));
 console.log('Updated FINAL-EVALUATION.md; '+all.length+' completed episodes; $'+spent.toFixed(6));
}
if(require.main===module)generate();module.exports={generate};
