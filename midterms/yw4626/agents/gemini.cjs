'use strict';
const fs=require('node:fs'),path=require('node:path');
const {sharedVertexAuth}=require('./vertex-auth.cjs');
const prompt=fs.readFileSync(path.join(__dirname,'player-prompt.txt'),'utf8');
function validateConfig(c) {
  if(!['gemini','vertex'].includes(c.provider)||!/^gemini-[a-zA-Z0-9._-]+$/.test(c.model||''))throw Error('Set provider gemini/vertex and a supported Gemini model ID');
  if(c.budgetUSD!==null&&(!Number.isFinite(c.budgetUSD)||c.budgetUSD<=0))throw Error('Set positive budgetUSD, or explicit null for user-authorized uncapped evaluation');
  for(const k of ['inputPerMillionUSD','outputPerMillionUSD'])if(!Number.isFinite(c.pricing?.[k])||c.pricing[k]<=0)throw Error('Set positive published token prices for conservative cost accounting');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(c.pricing.date)||!/^https:\/\//.test(c.pricing.source||''))throw Error('Dated pricing source required');
  if(Object.keys(c.pricing).some(k=>!['date','source','inputPerMillionUSD','outputPerMillionUSD','note'].includes(k)))throw Error('Unknown pricing field');
  if(!Number.isInteger(c.maxOutputTokens)||c.maxOutputTokens<64||c.maxOutputTokens>8192)throw Error('maxOutputTokens must be 64..8192');
  if(!Number.isFinite(c.temperature)||c.temperature<0||c.temperature>2)throw Error('Invalid temperature');
  if(c.provider==='vertex'&&(!/^[a-z0-9-]+$/.test(c.project||'')||!/^[a-z0-9-]+$/.test(c.location||'')))throw Error('Vertex requires project and location in config');
  return c;
}
function price(c,input,output) {return (input*c.pricing.inputPerMillionUSD+output*c.pricing.outputPerMillionUSD)/1e6;}
class GeminiPlayer {
  #config;#key;#fetch;#auth;
  constructor(config,{fetchImpl=fetch,apiKey=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY,ledger={spentUSD:0},vertexAuth=sharedVertexAuth}={}) {
    this.#config=validateConfig(JSON.parse(JSON.stringify(config)));this.#fetch=fetchImpl;this.#key=apiKey;this.#auth=vertexAuth;this.ledger=ledger;this.id=config.provider+':'+config.model;
    if(config.provider==='gemini'&&!apiKey)throw Error('Set GEMINI_API_KEY locally; do not put it in config, logs, browser code or chat');
  }
  async #headers() {
    if(this.#config.provider==='gemini')return {'Content-Type':'application/json','x-goog-api-key':this.#key};
    const token=await this.#auth.token(this.#config.project);
    return {'Content-Type':'application/json','Authorization':'Bearer '+token};
  }
  async prepare(){await this.#headers();return {ready:true};}
  async choose(input,{timeoutMs=45000}={}) {
    const c=this.#config,start=performance.now();
    const body={systemInstruction:{parts:[{text:prompt}]},contents:[{role:'user',parts:[{text:JSON.stringify(input)}]}],generationConfig:{temperature:c.temperature,maxOutputTokens:c.maxOutputTokens,responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{action:{type:'STRING',enum:input.legalActions.map(a=>a.id)}},required:['action']}}};
    const serialized=JSON.stringify(body);
    // Reserve a conservative UTF-8 byte-based input bound and the full output cap.
    // On timeout/missing usage keep this reservation: absence of a bill is not zero cost.
    const reserve=price(c,Buffer.byteLength(serialized)*2+2048,c.maxOutputTokens);
    if(c.budgetUSD!==null&&this.ledger.spentUSD+reserve>c.budgetUSD)throw Object.assign(Error('Cost budget would be exceeded'),{code:'cost_limit',attempted:false});
    this.ledger.spentUSD+=reserve;
    let usage=null,cost=reserve,attempted=false,settled=false;
    try {
      let authTimer;
      let headers;
      try{headers=await Promise.race([this.#headers(),new Promise((_,reject)=>{authTimer=setTimeout(()=>reject(Object.assign(Error('Credential deadline'),{name:'TimeoutError'})),Math.max(1,timeoutMs-(performance.now()-start)));})]);}
      finally{clearTimeout(authTimer);}
      const remaining=timeoutMs-(performance.now()-start);if(remaining<=0)throw Object.assign(Error(),{name:'TimeoutError'});
      const base=c.provider==='gemini'?`https://generativelanguage.googleapis.com/v1beta/models/${c.model}:generateContent`:`https://${c.location==='global'?'':c.location+'-'}aiplatform.googleapis.com/v1/projects/${c.project}/locations/${c.location}/publishers/google/models/${c.model}:generateContent`;
      attempted=true;
      const response=await this.#fetch(base,{method:'POST',headers,body:serialized,signal:AbortSignal.timeout(Math.ceil(remaining))});
      if(!response.ok){
        let providerStatus=null,quota=[];
        try{const data=await response.json();providerStatus=/^[A-Z_]+$/.test(data.error?.status||'')?data.error.status:null;
          quota=(data.error?.details||[]).flatMap(d=>d.metadata?[Object.fromEntries(['quota_metric','quota_limit','quota_limit_value','quota_location','service'].filter(k=>d.metadata[k]!==undefined).map(k=>[k,String(d.metadata[k]).slice(0,200)]))]:[]);
        }catch{}
        throw Object.assign(Error('Provider HTTP '+response.status),{code:'http_'+response.status,providerStatus,quota});
      }
      const data=await response.json(),m=data.usageMetadata;
      if(Number.isSafeInteger(m?.promptTokenCount)&&m.promptTokenCount>=0&&Number.isSafeInteger(m?.candidatesTokenCount)&&m.candidatesTokenCount>=0) {
        usage={inputTokens:m.promptTokenCount,outputTokens:m.candidatesTokenCount,thinkingTokens:m.thoughtsTokenCount||0,cachedInputTokens:m.cachedContentTokenCount||0};
        cost=price(c,usage.inputTokens,usage.outputTokens+usage.thinkingTokens);
        this.ledger.spentUSD+=cost-reserve;settled=true;
      }
      const raw=(data.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');
      let parsed;try{parsed=JSON.parse(raw);}catch{throw Object.assign(Error('Model returned invalid JSON'),{code:'invalid_response'});}
      if(!parsed||Object.keys(parsed).join(',')!=='action'||typeof parsed.action!=='string')throw Object.assign(Error('Expected one action string'),{code:'invalid_response'});
      return {action:parsed.action,usage,costUSD:cost,costBasis:settled?'reported_tokens':'conservative_reservation',latencyMs:performance.now()-start,modelVersion:data.modelVersion||c.model,finishReason:data.candidates?.[0]?.finishReason,attempted:true};
    }catch(error) {
      if(!attempted){this.ledger.spentUSD-=reserve;cost=0;}
      // DOMException has numeric code 23/20; classify its name before generic codes.
      const code=['TimeoutError','AbortError'].includes(error.name)?'call_timeout':typeof error.code==='string'?error.code:'provider_error';
      // No raw response/error body or credentials reach logs.
      throw Object.assign(Error(code),{code,attempted,usage,costUSD:cost,costBasis:settled?'reported_tokens':attempted?'conservative_reservation':'no_request',latencyMs:performance.now()-start,providerStatus:error.providerStatus,quota:error.quota});
    }
  }
}
module.exports={GeminiPlayer,validateConfig,price};
