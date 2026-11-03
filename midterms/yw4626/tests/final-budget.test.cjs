'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {persistentLedger}=require('../agents/final-evaluate.cjs');
const {GeminiPlayer}=require('../agents/gemini.cjs');
test('final budget persists reserved costs across runner restarts and rejects excess without sending',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'final-ledger-')),file=path.join(dir,'budget.json');
 try{let ledger=persistentLedger(file);ledger.spentUSD=9.999;ledger=persistentLedger(file);assert.equal(ledger.spentUSD,9.999);
 const config={provider:'gemini',model:'gemini-test',budgetUSD:10,maxOutputTokens:2048,temperature:0,pricing:{date:'2026-11-02',source:'https://cloud.google.com/model-garden/pricing',inputPerMillionUSD:.3,outputPerMillionUSD:2.5}};
 let sent=false;const p=new GeminiPlayer(config,{ledger,apiKey:'test-only',fetchImpl:async()=>{sent=true;}});
 await assert.rejects(p.choose({legalActions:[{id:'a'}]}),e=>e.code==='cost_limit'&&e.attempted===false);assert.equal(sent,false);assert.equal(persistentLedger(file).spentUSD,9.999);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('credential deadline prevents HTTP send and refunds unsent reservation',async()=>{
 const config={provider:'vertex',project:'test-project',location:'global',model:'gemini-test',budgetUSD:10,maxOutputTokens:2048,temperature:0,pricing:{date:'2026-11-02',source:'https://cloud.google.com/model-garden/pricing',inputPerMillionUSD:.3,outputPerMillionUSD:2.5}};
 const ledger={spentUSD:0};let sent=false;
 const p=new GeminiPlayer(config,{ledger,vertexAuth:{token:()=>new Promise(()=>{})},fetchImpl:async()=>{sent=true;}});
 await assert.rejects(p.choose({legalActions:[{id:'a'}]},{timeoutMs:20}),e=>e.code==='call_timeout'&&e.attempted===false);assert.equal(sent,false);assert.equal(ledger.spentUSD,0);
});
