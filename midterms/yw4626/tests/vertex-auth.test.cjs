'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createVertexAuth}=require('../agents/vertex-auth.cjs'),{GeminiPlayer}=require('../agents/gemini.cjs');
const config={...require('../agents/vertex.example.json'),project:'unit-test-project'};
test('Vertex token preparation is shared across episodes and concurrent requests, then refreshed before expiry',async()=>{
 let loads=0,now=0;const auth=createVertexAuth({loader:async()=>{loads++;return 'unit-test-token-'+loads;},now:()=>now,refreshMs:100});
 const a=new GeminiPlayer(config,{vertexAuth:auth}),b=new GeminiPlayer(config,{vertexAuth:auth});
 assert.deepEqual(await Promise.all([a.prepare(),b.prepare()]),[{ready:true},{ready:true}]);assert.equal(loads,1);
 now=99;await b.prepare();assert.equal(loads,1);now=100;await a.prepare();assert.equal(loads,2);
 assert.ok(!JSON.stringify(a).includes('unit-test-token'));
});
test('failed credential preparation does not poison cache or send a model request',async()=>{
 let loads=0,sent=0;const auth=createVertexAuth({loader:async()=>{if(++loads===1)throw Object.assign(Error('temporary'),{code:'credential_timeout'});return 'unit-test-only';}});
 const p=new GeminiPlayer(config,{vertexAuth:auth,fetchImpl:async()=>{sent++;}});
 await assert.rejects(()=>p.prepare(),e=>e.code==='credential_timeout');assert.equal(sent,0);assert.deepEqual(await p.prepare(),{ready:true});assert.equal(loads,2);assert.equal(sent,0);
});
