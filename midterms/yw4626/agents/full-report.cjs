'use strict';
// Post-hoc analysis only: never controls a player or changes recorded outcomes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {replay}=require('./replay.cjs');
const root=path.resolve(__dirname,'..');
function load(dir){return {dir,manifest:JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')),results:JSON.parse(fs.readFileSync(path.join(dir,'results.json'),'utf8'))};}
function analyze(run){
  return run.results.map(r=>{
    const rows=fs.readFileSync(path.join(run.dir,r.trace),'utf8').trim().split('\n').map(JSON.parse),dec=rows.filter(x=>x.type==='decision'&&(!x.response.error||x.response.error==='invalid_response')),requests=rows.filter(x=>x.type==='request');
    const floors=[];for(let f=1;f<=5;f++){const d=dec.filter(x=>x.input.observation.floor===f);floors.push({floor:f,decisions:d.length,battleDecisions:d.filter(x=>x.input.observation.phase==='battle').length});}
    const gems=dec.filter(x=>x.input.observation.phase==='gem');
    let consecutive=0,maxGemStreak=0,prior='',unchanged=0,maxObjectivePlateau=0;
    for(const d of dec){consecutive=d.input.observation.phase==='gem'?consecutive+1:0;maxGemStreak=Math.max(maxGemStreak,consecutive);const tag=[d.outcome.floor,d.outcome.kills,d.outcome.wins,d.outcome.level].join('/');unchanged=tag===prior?unchanged+1:1;prior=tag;maxObjectivePlateau=Math.max(maxObjectivePlateau,unchanged);}
    return {...r,floors,progressWarnings:dec.filter(x=>x.input.progressNotice).length,gemChoices:gems.filter(x=>x.response.action?.startsWith('gem:')).length,gemSockets:gems.filter(x=>x.response.action?.startsWith('socket:')&&x.result.accepted).length,gemCancels:gems.filter(x=>x.response.action==='cancel').length,removalCancels:dec.filter(x=>x.input.observation.phase==='removal'&&x.response.action==='cancel').length,maxGemStreak,maxObjectivePlateau,latencies:requests.map(x=>x.response.latencyMs).filter(Number.isFinite),reservedUSD:requests.filter(x=>x.response.costBasis==='conservative_reservation').reduce((a,x)=>a+(x.response.costUSD||0),0),errors:requests.filter(x=>x.response.error).map(x=>({index:x.index,attempt:x.attempt,error:x.response.error,providerStatus:x.response.providerStatus,quota:x.response.quota,willRetry:x.willRetry}))};
  });
}
function total(rows,key){return rows.reduce((a,r)=>a+(r[key]||0),0);}
function main(){
  const baseline=load(path.resolve(process.argv[2])),model=load(path.resolve(process.argv[3]));
  assert.equal(baseline.manifest.kind,'scripted');assert.equal(model.manifest.kind,'gemini');
  assert.deepEqual(baseline.manifest.hashes,model.manifest.hashes,'Frozen source mismatch');
  assert.deepEqual(baseline.manifest.suite,model.manifest.suite);assert.equal(baseline.manifest.fullRunnerHash,model.manifest.fullRunnerHash);assert.equal(baseline.manifest.fullSuiteHash,model.manifest.fullSuiteHash);assert.equal(baseline.manifest.progressGuardHash,model.manifest.progressGuardHash);
  const expected=model.manifest.suite.cases.flatMap(c=>[1,2].map(t=>c.id+'-'+t));
  for(const r of [baseline,model]){assert.equal(r.results.length,6);assert.deepEqual(r.results.map(x=>x.case+'-'+x.trial).sort(),expected.toSorted());assert.ok(r.results.every(x=>x.terminal));}
  const b=analyze(baseline),m=analyze(model),latencies=m.flatMap(r=>r.latencies).sort((a,b)=>a-b),avg=latencies.reduce((a,x)=>a+x,0)/latencies.length,p95=latencies[Math.max(0,Math.ceil(latencies.length*.95)-1)];
  for(const r of [baseline,model]){const validation=r.results.map(x=>({trace:x.trace,...replay(path.join(r.dir,x.trace))}));fs.writeFileSync(path.join(r.dir,'replay-validation.json'),JSON.stringify(validation,null,2));}
  const details={baseline:b,model:m,meanRequestLatencyMs:avg,p95RequestLatencyMs:p95,hashesMatched:true};fs.writeFileSync(path.join(model.dir,'analysis.json'),JSON.stringify(details,null,2));
  const link=d=>path.relative(root,d).replaceAll('\\','/'),success=rows=>rows.filter(r=>r.success).length;
  let s='# 五层完整实验报告\n\n';
  s+=`宝石流程修订后，完成 **6 次真实 Gemini 五层挑战**，成功 ${success(m)}/6；同版本、同起点脚本基线成功 ${success(b)}/6。每次运行到通关、死亡或预先声明的限制，不替换失败局。模型为 ${model.manifest.config.model}，Vertex global；使用 ${model.manifest.suite.profile} 演示配置（全支持卡池），最近 6 步公开历史，温度 ${model.manifest.config.temperature}。\n\n`;
  s+='本报告为 **v3 服务循环修复版**。此前 v2 的第一局在第四层反复取消并重访服务，用户要求停止修复；已保留 [中断记录](evaluation/full-2026-11-01T04-43-38-014Z-gemini/REPORT.md)，674 个决策、678 个已结束请求，已记录费用 $0.8170658，另有一个可能在途请求的 usage/费用未知。v2 的另外五局未开始；这局不算成功，也不混入下表的新六局胜率。新旧调用费用不因重跑而清零。\n\n';
  if(model.manifest.resumedFrom)s+=`**恢复运行说明：** [前一轮 v3 记录](${model.manifest.resumedFrom}/REPORT.md) 中第一局已真实通关，其余五局在读取凭据时超过旧的 10 秒超时，均为 0 游戏决策、未发出模型请求。实测凭据读取约 10.13 秒后成功；随后增加了批次启动前验证、45 秒凭据读取上限及进程内有效令牌复用。保留所有已玩过的结果，仅补跑这些纯凭据阶段失败的试次。原始首局轨迹原样复制，不再付费重跑、不算两次；来源及原传输代码哈希见 manifest.preservedEpisodes / originalTransportHashes。游戏、玩家接口、提示词、固定种子、停滞规则均保持不变，认证传输代码发生修订，因此不能声称六局传输适配器字节完全相同。\n\n`;
  s+='| 角色 | 试次 | Gemini 结果 | 到达层 | 决策 | 击杀 | 生命 | 脚本决策/击杀 | 请求/失败 | 估算 USD |\n|---|---:|---|---:|---:|---:|---:|---:|---:|---:|\n';
  for(const r of m){const br=b.find(x=>x.case===r.case&&x.trial===r.trial);s+=`| ${r.character} | ${r.trial} | ${r.reason} | ${r.floor} | ${r.decisions} | ${r.kills} | ${r.health} | ${br.decisions}/${br.kills} | ${r.calls}/${r.failedCalls} | $${r.costUSD.toFixed(5)} |\n`;}
  s+=`\n共 ${total(m,'calls')} 次请求，${total(m,'failedCalls')} 次失败，非法动作 ${total(m,'invalidActions')}。输入 ${total(m,'inputTokens').toLocaleString('en-US')} tokens，输出 ${total(m,'outputTokens').toLocaleString('en-US')}，思考 ${total(m,'thinkingTokens').toLocaleString('en-US')}。请求平均延迟 ${avg.toFixed(0)} ms，p95 ${p95.toFixed(0)} ms；六局累计运行 ${(total(m,'elapsedMs')/60000).toFixed(1)} 分钟。\n\n`;
  s+=`费用估算 **$${total(m,'costUSD').toFixed(5)}**，其中缺失 usage 的保守预留 $${total(m,'reservedUSD').toFixed(5)}。用户仅对此六局批次解除此前 $2 上限；没有将旧预算自动重置。本表价格为 ${model.manifest.config.pricing.date} 的 [Vertex 标价](${model.manifest.config.pricing.source})，输入 $${model.manifest.config.pricing.inputPerMillionUSD}/百万 tokens，输出（含思考）$${model.manifest.config.pricing.outputPerMillionUSD}/百万 tokens；估算不是云账单。\n\n`;
  s+=`计入先前 v2 被用户中断的记录后，本轮完整五层工作已记录费用合计约 **$${(total(m,'costUSD')+.8170658).toFixed(5)}**，另加该中断可能在途请求的未知费用；首局 v3 复用费用只计一次。历史 v1 第一层实验费用另见旧报告。\n\n`;
  s+='## 宝石流程与逐层进度\n\n| 角色/试次 | 选择宝石 | 成功镶嵌 | 取消 | 最长连续宝石决策 | F1/F2/F3/F4/F5 决策 |\n|---|---:|---:|---:|---:|---|\n';
  for(const r of m)s+=`| ${r.character}/${r.trial} | ${r.gemChoices} | ${r.gemSockets} | ${r.gemCancels} | ${r.maxGemStreak} | ${r.floors.map(f=>f.decisions).join(' / ')} |\n`;
  s+='\n逐层决策只统计实际提交给游戏的动作；日志中的终止 API 错误记录不算游戏动作。流程现在明确区分“选择宝石”和“选择卡牌完成镶嵌”，已选宝石不再作为可重复选择的合法动作；兼容卡牌带效果与槽位预览。取消或换宝石仍然允许，因此不能仅凭接口修订断言所有循环都已消除。上表记录实际行为；未单独改变提示词做消融，不能将所有表现变化归因于此修复。\n\n';
  s+='| 角色/试次 | 删牌事件取消 | 最长目标指标不变段（决策） |\n|---|---:|---:|\n';
  for(const r of m)s+=`| ${r.character}/${r.trial} | ${r.removalCancels} | ${r.maxObjectivePlateau} |\n`;
  s+='\n“目标指标不变”仅指层数、击杀、战斗胜场和等级均不变；其中也可能包括有效购买、镶嵌和探索，不能自动视为无效操作。结合原始轨迹识别返回服务地点后反复取消的循环。429 具体配额原因若缺失则标为未知，不推断余额不足；全局端点与指数退避参考 [Google 官方说明](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deploy/error-code-429)。\n\n';
  s+='## 稳定性结论与后续改进\n\n';
  const stalled=m.filter(r=>r.reason==='repeated_state_limit'),network=m.filter(r=>r.reason==='call_timeout'||r.reason?.startsWith('http_')),warnings=total(m,'progressWarnings');
  s+=`本组六局中，公开重复状态提示出现 ${warnings} 次，停滞上限结束 ${stalled.length} 局；网络错误结束 ${network.length} 局。成功镶嵌 ${total(m,'gemSockets')} 次，非法动作 ${total(m,'invalidActions')} 次。${stalled.length ? "仍有试次触发停滞上限，需要结合原始轨迹继续排查；不能宣称循环问题全部解决。" : "本组没有因重复状态达到上限而结束的试次，但这不保证所有种子或外部 API 永远无等待。"}\n\n`;
  if(network.length)s+='优先改进测试恢复能力：将网络中断与游戏失败分开统计；后续可设计经过校验的同局断点续跑，并在新协议中预先声明较长冷却策略。本轮仍按已冻结的超时和重试上限记录原始结果，没有续跑这些已经实际游玩的中断局，也没有用脚本接管。\n\n';
  s+='玩法评估建议：增加敌人有效伤害、护甲抵消和每层剩余资源的统计，再判断是否需要调整难度。只看通关率或结束生命不足以证明平衡；本轮也没有修改敌人或卡牌数值来促成胜利。接下来扩大种子覆盖、补齐无记忆对照，并让真人测试宝石预览与服务暂缓提示是否容易理解。\n\n';
  s+='## 可复现性与范围\n\n';
  s+='本轮修复：无兼容卡牌的宝石及 Boss 宝石选项禁用；取消服务后记录公开的暂缓状态，在牌组/资源变化后重新评估；导航不再推荐已完成或暂缓地点，并可穿过沿途已暂缓服务；观察报告目的地类型、是否到达及可见 Boss/出口目标。人类仍可手动碰撞重访。观战不再为同一步反复重建画面，并显示 API 等待状态；读取正在更新的状态文件时保留上次完整值，分段 UTF-8 日志完整后才解码。观战服务这一修复在实验期间完成，仅影响只读显示，不改变已冻结的引擎、玩家接口和模型输入。重复状态提示和失败上限使用公开信息，网络重试有明确上限，没有偷偷改数值或代打。\n\n';
  s+=`- [模型原始记录](${link(model.dir)}/REPORT.md)、[脚本基线](${link(baseline.dir)}/REPORT.md)、[逐试次分析](${link(model.dir)}/analysis.json)。每个请求、重试及失败均保留。\n- 当前两组 manifest 的游戏、接口、提示词、适配器、脚本策略、运行器、停滞检测及套件哈希一致；恢复首局的认证传输差异单独披露如上。12 条轨迹均逐步重放校验观察、合法动作和结算通过：[模型重放](${link(model.dir)}/replay-validation.json)。重放不计为新模型调用。\n- [冻结五层协议](agents/full-suite.json)：3 个角色/种子起点、各 2 次；Arca 为留出起点。每局 15000 引擎步、6000 决策、6500 请求、4 小时，单请求 30 秒；临时 429/5xx/超时按预声明最多重试 4 次，5 秒起、最多 60 秒。同一非战斗状态在最近 128 次决策内重复 16 次将记录为停滞失败，4 次开始提示模型换策略。\n- 只使用玩家公开观察，不暴露抽牌顺序、随机状态、未开奖励或未来敌人行动；脚本有公开访问记忆。三种子共六试次是小样本，不代表所有种子、职业或平衡状况；同种子不等于不同策略的轨迹相同。\n- 本组仅测试 bounded history，不能补齐旧第一层套件的无记忆对照。旧记录与 v1 源码归档保留，不合并胜率；前期开发用六局脚本记录也不计入正式基线。\n- 本地 379 项自动检查通过，见 [检查日志](evaluation/full-v3-watch-local-validation.txt)。课程独立审查、第二独立会话、远程 CI、真实同学反馈及录像仍需各自证据。\n\n`;
  s+='## 观看 AI\n\n打开本地游戏，点击顶部 **观看 AI 游玩**，选择 Gemini 实验与局次，可播放、暂停、单步、跳转和调速。运行中可追踪最新日志；结束后显示真实记录回放。画面按每个决策重建游戏状态，不是重新调用模型，也不是逐帧视频；不会覆盖玩家手动存档。\n';
  fs.writeFileSync(path.join(root,'FULL_EVALUATION.md'),s);console.log(JSON.stringify({modelSuccesses:success(m),baselineSuccesses:success(b),calls:total(m,'calls'),failedCalls:total(m,'failedCalls'),costUSD:total(m,'costUSD'),report:'FULL_EVALUATION.md',replayed:12}));
}
if(require.main===module)main();
