'use strict';
const fs=require('node:fs'),path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {createRuntimeResolver,slim}=require('./watch-runtime.cjs');
function createWatchHandler(root){
  const base=path.join(root,'evaluation'),lines=new Map(),players=new Map(),jsonCache=new Map(),resolveRuntime=createRuntimeResolver(root);
  const compatible=m=>!!resolveRuntime(m);
  // The evaluator updates status while this read-only process is polling it.
  // Keep the last complete value when a read lands between truncate and write.
  function json(file,fallback){try{const value=JSON.parse(fs.readFileSync(file,'utf8'));jsonCache.set(file,value);return value;}catch{return jsonCache.get(file)||fallback;}}
  function read(file){
    let c=lines.get(file)||{offset:0,tail:Buffer.alloc(0),rows:[]};const size=fs.statSync(file).size;
    if(size<c.offset)c={offset:0,tail:Buffer.alloc(0),rows:[]};
    if(size>c.offset){const b=Buffer.alloc(size-c.offset),fd=fs.openSync(file,'r');let count;try{count=fs.readSync(fd,b,0,b.length,c.offset);}finally{fs.closeSync(fd);}const joined=Buffer.concat([c.tail,b.subarray(0,count)]),end=joined.lastIndexOf(10);c.tail=Buffer.from(joined.subarray(end+1));c.offset+=count;if(end>=0)for(const line of joined.subarray(0,end).toString('utf8').split('\n'))if(line.trim())c.rows.push(JSON.parse(line));lines.set(file,c);}
    return c.rows;
  }
  return function handle(req,res){
    const url=new URL(req.url,'http://127.0.0.1');if(!url.pathname.startsWith('/api/ai/'))return false;
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Cross-Origin-Resource-Policy':'same-origin'});res.end(JSON.stringify(data));};
    if(req.method!=='GET'){send(405,{error:'Read-only viewer'});return true;}
    if(req.headers.origin&&!['http://127.0.0.1:8765','http://localhost:8765'].includes(req.headers.origin)){send(403,{error:'Local viewer only'});return true;}
    try{
      const dirs=fs.existsSync(base)?fs.readdirSync(base).filter(n=>/^full-[\w-]+$/.test(n)&&fs.existsSync(path.join(base,n,'manifest.json'))):[];
      if(url.pathname==='/api/ai/runs'){
        send(200,{runs:dirs.sort().reverse().flatMap(id=>{const dir=path.join(base,id),m=json(path.join(dir,'manifest.json'),null),status=json(path.join(dir,'status.json'),{state:'preparing'}),traceDir=path.join(dir,'traces');if(!m)return [];
          return [{id,kind:m.kind,model:m.config?.model,compatible:compatible(m),status,episodes:(fs.existsSync(traceDir)?fs.readdirSync(traceDir):[]).filter(f=>/^[\w-]+\.jsonl$/.test(f)).map(f=>({id:f.slice(0,-6)}))}];})});return true;
      }
      const id=url.searchParams.get('run'),episode=url.searchParams.get('episode');
      if(url.pathname!=='/api/ai/frame'||!dirs.includes(id)||!episode||!/^full-[\w-]+-[12]$/.test(episode)){send(404,{error:'Unknown recording'});return true;}
      const dir=path.join(base,id),file=path.join(dir,'traces',episode+'.jsonl');if(!fs.existsSync(file)){send(404,{error:'Recording not started'});return true;}
      const manifest=json(path.join(dir,'manifest.json'),null),runtime=manifest&&resolveRuntime(manifest);if(!runtime){send(409,{error:'Recording uses an archived engine version'});return true;}
      const rows=read(file),start=rows.find(r=>r.type==='start'),decisions=rows.filter(r=>r.type==='decision'),finish=rows.find(r=>r.type==='finish');
      if(!start){send(200,{waiting:true});return true;}
      const value=url.searchParams.get('index')||'latest',requested=value==='latest'?decisions.length:Number(value);
      if(!Number.isInteger(requested)||requested<0||requested>10000){send(400,{error:'Invalid frame'});return true;}const index=Math.min(requested,decisions.length),key=id+'/'+episode;
      let player=players.get(key);if(!player||index<player.index){player=runtime.create({...manifest.suite,character:start.testCase.character},start.testCase.seed);player.index=0;player.timeline=[];players.set(key,player);if(players.size>4)players.delete(players.keys().next().value);}
      while(player.index<index){const r=decisions[player.index];player.timeline=[];if(!r.response.error||r.response.error==='invalid_response'){const played=runtime.step(player,{id:r.response.action||'INVALID_RESPONSE',revision:r.input.observation.revision},player.index===index-1);player.timeline=played.timeline;const result=played.result;if(result.ok!==r.result.accepted||r.outcome&&!isDeepStrictEqual(result.outcome,r.outcome))throw Error('Recording no longer matches the engine');}player.index++;}
      const stateFile=path.join(dir,'status.json'),runStatus=json(stateFile,null);
      const prior=decisions[index-1];send(200,{index,total:decisions.length,finished:!!finish,result:finish?.result,runStatus,kind:start.kind,character:start.testCase.character,seed:start.testCase.seed,snapshot:slim(player.snapshot),timeline:player.timeline,recordedVersion:manifest.gameVersion||manifest.suite?.id,archived:runtime.root!==root,action:prior?.response.action||'start',error:prior?.response.error||null,outcome:player.env.outcome()});return true;
    }catch(e){send(409,{error:e.message==='Recording no longer matches the engine'?e.message:'Recording temporarily unavailable'});return true;}
  };
}
module.exports={createWatchHandler};
