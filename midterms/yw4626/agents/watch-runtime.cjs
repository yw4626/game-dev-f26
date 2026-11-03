'use strict';
// Observer-only reconstruction. Frozen engines are never edited; hooks record existing transitions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fingerprint(root){const dir=path.join(root,'dist');return {game:hash(Buffer.concat(fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().flatMap(f=>[Buffer.from(f),fs.readFileSync(path.join(dir,f))]))),interface:hash(fs.readFileSync(path.join(root,'agents/environment.cjs')))};}
function slim(snapshot){const s=JSON.parse(JSON.stringify(snapshot));s.data.battles=[];s.data.history=(s.data.history||[]).slice(-40);s.data.events=(s.data.events||[]).slice(-40);if(s.battle)s.battle.data.events=s.battle.data.events.slice(-80);return s;}
const runtimeCache=new Map();
function runtime(root){
 const {Run}=require(path.join(root,'dist/run.js')),{Battle}=require(path.join(root,'dist/engine.js')),{PlayerEnvironment}=require(path.join(root,'agents/environment.cjs'));
 let active=null,lastRun=null;const snap=Run.prototype.snapshot;
 Run.prototype.snapshot=function(...args){lastRun=this;return snap.apply(this,args);};
 function wrap(proto,name,kind){const original=proto[name];if(!original)return;proto[name]=function(...args){
   const capture=active&&active.depth===0&&(this===active.run||this===active.run.battle),start=this===active?.run.battle?this.events.length:0;
   if(!capture)return original.apply(this,args);const preview=name==='play'?this.cardPreview(this.piles.hand.find(c=>c.id===args[0])):undefined;active.depth++;
   let result;try{result=original.apply(this,args);}finally{active.depth--;}
   if((name==='syncExperience'||name==='settleBattle')&&!result)return result;
   const events=this===active.run.battle?this.events.slice(start):[];
   active.frames.push({kind,method:name,args,preview,result:result??null,events:JSON.parse(JSON.stringify(events)),snapshot:slim(snap.call(active.run))});return result;
 };}
 for(const n of ['walk','turn','useObject','interact','chooseLevelCard','claimBossCard','claimReward','chooseBossReward','fuse','chooseGem','socketGem','buy','buyHeal','refreshShop','addGemSlot','leave','removeCard','cancelGem','cancelRemoval','skipEvolution','rest','openTreasure','digStep','nextFloor','syncExperience','settleBattle'])wrap(Run.prototype,n,'run');
 for(const n of ['play','beginEnemyTurn','resolveNextEnemy'])wrap(Battle.prototype,n,'battle');
 return {root,create(options,seed){const p={snapshot:null};p.env=new PlayerEnvironment(options,s=>p.snapshot=s);p.env.reset(seed);p.run=lastRun;return p;},step(p,action,capture=true){const collector={run:p.run,depth:0,frames:[]};if(capture)active=collector;try{return {result:p.env.step('player',action),timeline:collector.frames};}finally{active=null;}}};
}
function createRuntimeResolver(root){
 const candidates=[root],evidence=path.join(root,'evidence'),evaluation=path.join(root,'evaluation');
 if(fs.existsSync(evidence))for(const n of fs.readdirSync(evidence))if(/^player-[\w-]+-source$/.test(n))candidates.push(path.join(evidence,n));
 if(fs.existsSync(evaluation))for(const n of fs.readdirSync(evaluation))if(/^full-[\w-]+$/.test(n))candidates.push(path.join(evaluation,n,'source'));
 let indexed=false;const roots=new Map(),loaded=new Map();
 function index(){if(indexed)return;indexed=true;for(const p of candidates)try{const f=fingerprint(p);roots.set(f.game+'/'+f.interface,p);}catch{}}
 return manifest=>{index();const p=manifest.hashes?roots.get(manifest.hashes.game+'/'+manifest.hashes.interface):(fs.existsSync(path.join(root,'dist/engine.js'))?root:path.resolve(__dirname,'..'));if(!p)return null;if(!loaded.has(p)){if(!runtimeCache.has(p))runtimeCache.set(p,runtime(p));loaded.set(p,runtimeCache.get(p));}return loaded.get(p);};
}
module.exports={createRuntimeResolver,slim,fingerprint};
