'use strict';
// Script-only development regression. This command never instantiates a model player.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {runEpisode}=require('./full-evaluate.cjs'),{versionHashes}=require('./evaluate.cjs'),{replay}=require('./replay.cjs');
function report(manifest,results,dir){
 const coverage=results.map(r=>{
  const observations=fs.readFileSync(path.join(dir,r.trace),'utf8').trim().split('\n').map(JSON.parse).filter(x=>x.type==='decision').map(x=>x.input.observation.battle?.bossMechanics).filter(Boolean);
  const bosses=observations.flatMap(s=>s.bosses);
  return {case:r.case,kinds:[...new Set(bosses.map(b=>b.kind))].sort(),rootBroken:bosses.some(b=>b.kind===1&&b.wither),bookBroken:bosses.some(b=>b.kind===2&&b.broken),plagueMax:Math.max(0,...observations.map(s=>s.plague)),prisonInterrupted:bosses.some(b=>b.kind===4&&b.skipStrike),ritual:observations.some(s=>s.ritualUsed),echoesMax:Math.max(0,...observations.map(s=>s.bosses.filter(b=>b.echo).length))};
 });
 fs.writeFileSync(path.join(dir,'mechanics-coverage.json'),JSON.stringify(coverage,null,2));
 return `# Boss v29：五层脚本回归\n\n${manifest.id}\n\n3 个角色 × 2 个开发种子（AGENT-DEV-A/B），共 ${results.length} 局。全部使用公开玩家接口的脚本策略；无模型 API 调用，费用 $0。游戏 ${manifest.gameVersion||'v29 初稿'}，版本哈希见 manifest.json。\n\n`+
 `完成 ${results.length}/6，通关 ${results.filter(r=>r.success).length}/6；非法动作 ${results.reduce((s,r)=>s+r.invalidActions,0)}。\n\n`+
 '| 角色 | 开发种子 | 结果 | 层数 | 决策 | 剩余生命 |\n|---|---|---|---:|---:|---:|\n'+results.map(r=>`| ${r.character} | ${r.seed} | ${r.reason} | ${r.floor} | ${r.decisions} | ${r.health} |`).join('\n')+
 '\n\n公开观察中实际出现的机制（同一机制连续出现不计为多次触发）：\n\n| 局次 | Boss 种类 | 根系破防 | 三色解咒 | 最高鼠疫 | 巨囚破招 | 召唤仪式 | 同屏血影最多 |\n|---|---|---|---|---:|---|---|---:|\n'+coverage.map(r=>`| ${r.case} | ${r.kinds.join(',')} | ${r.rootBroken} | ${r.bookBroken} | ${r.plagueMax} | ${r.prisonInterrupted} | ${r.ritual} | ${r.echoesMax} |`).join('\n')+
 '\n\n范围：五层地图、奖励、商店、所有 Boss 和最终胜利；15000 引擎步、6000 决策上限，非战斗重复状态上限保持不变。逐动作重放验证见 replay-validation.json，原始公开输入和动作见 traces/。request/request_start 是共享运行器的决策记录标签，本组并未发出网络模型请求。\n\n限制：这是开发回归，不是 held-out 实验，不是新版真实模型测评，也不能仅凭六局通关证明难度平衡。未在自然路线触发的机制由 tests/boss-v28.test.cjs 定向验证，不能算作这六局中的触发。之前 v3 的真实模型结果使用旧规则，不能直接与本组比较。\n';
}
async function main(){
 const root=path.resolve(__dirname,'..'),id='full-boss-v29-'+new Date().toISOString().replace(/[:.]/g,'-')+'-scripted',dir=path.join(root,'evaluation',id);
 const suite={...require('./full-suite.json'),id:'boss-v29-development',scope:'Script-only five-floor development regression. Not comparable to historic v3 live model trials.',trials:1,cases:['antonio','imelda','arca'].flatMap(character=>['A','B'].map(letter=>({id:`full-boss-${character}-${letter.toLowerCase()}`,character,seed:'AGENT-DEV-'+letter,split:'development'})))};
 fs.mkdirSync(path.join(dir,'traces'),{recursive:true});const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 const manifest={id,kind:'scripted',gameVersion:require('../package.json').version,startedAt:new Date().toISOString(),suite,config:{},hashes:versionHashes(),fullRunnerHash:hash(path.join(__dirname,'full-evaluate.cjs')),evaluationRunnerHash:hash(__filename),progressGuardHash:hash(path.join(__dirname,'progress-guard.cjs'))};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));const results=[];
 for(const testCase of suite.cases){const r=await runEpisode({testCase,trial:1,suite,config:{},ledger:{spentUSD:0},dir,kind:'scripted'});results.push(r);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(testCase.id+': '+r.reason+' F'+r.floor+' decisions='+r.decisions);}
 fs.writeFileSync(path.join(dir,'REPORT.md'),report(manifest,results,dir));fs.writeFileSync(path.join(dir,'replay-validation.json'),JSON.stringify(results.map(r=>({trace:r.trace,...replay(path.join(dir,r.trace))})),null,2));
 fs.writeFileSync(path.join(dir,'status.json'),JSON.stringify({state:'finished',episodes:results.length,successes:results.filter(r=>r.success).length,totalRunCostUSD:0}));console.log(dir);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={report};
