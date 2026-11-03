(function(root){
  'use strict';
  const tr=(zh,en)=>CrawlerLocale.language==='en'?en:zh;
  let api,active=false,playing=false,timer=null,token=0,frame=0,selectedRun='',selectedEpisode='',lastData=null,lastRender='',inflight=false,prefetched=null,playbackLoop=0;
  const panel=document.createElement('section');panel.id='ai-watch-panel';panel.hidden=true;panel.setAttribute('aria-label','AI spectator');
  panel.innerHTML='<div class="ai-watch-top"><strong>AI · 五层实验</strong><button id="ai-watch-close">退出观看</button></div><p id="ai-watch-notice"></p><div class="ai-watch-controls"><select id="ai-watch-runs" aria-label="实验记录"></select><select id="ai-watch-episodes" aria-label="局次"></select><button id="ai-watch-play">播放</button><button id="ai-watch-step">单步</button><button id="ai-watch-reset">从头</button><button id="ai-watch-live">追踪最新</button><select id="ai-watch-speed" aria-label="播放速度"><option value="1000">1×</option><option value="500">2×</option><option value="200">5×</option></select><button id="ai-watch-refresh">刷新列表</button></div><label class="ai-watch-seek-row">进度 <input id="ai-watch-position" type="number" min="0" value="0" aria-label="回放步数"><button id="ai-watch-seek">跳转</button></label><p id="ai-watch-status" role="status"></p>';
  document.body.prepend(panel);const $=id=>document.getElementById(id);let runs=[];
  const say=text=>{$('ai-watch-status').textContent=text;};
  function stop(){playbackLoop++;playing=false;clearTimeout(timer);$('ai-watch-play').textContent=tr('播放','Play');}
  async function get(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(tr('记录暂不可用，请刷新','Recording unavailable; refresh'));return r.json();}
  async function refresh(){
    try{const data=await get('/api/ai/runs');runs=data.runs.filter(r=>r.compatible!==false);const old=selectedRun;$('ai-watch-runs').replaceChildren(...runs.map(r=>new Option(`${r.kind==='gemini'?'Gemini':tr('脚本','Script')} · ${r.id} · ${r.status.state}`,r.id)));selectedRun=runs.some(r=>r.id===old)?old:runs.find(r=>r.kind==='gemini')?.id||runs[0]?.id||'';$('ai-watch-runs').value=selectedRun;episodes();if(!runs.length)say(tr('暂无当前版本的实验记录。旧版记录已归档；新实验开始后点击刷新，观看不产生 API 费用。','No recording for this version yet. Older runs are archived. Refresh once a new run starts; watching makes no model calls.'));}
    catch(e){say(location.protocol==='file:'?tr('请通过 http://127.0.0.1:8765 打开游戏观看','Open http://127.0.0.1:8765 to watch'):e.message);}
  }
  function episodes(){const r=runs.find(r=>r.id===selectedRun),old=selectedEpisode,all=r?.episodes||[];$('ai-watch-episodes').replaceChildren(...all.map(e=>new Option(e.id,e.id)));selectedEpisode=all.some(e=>e.id===old)?old:r?.status.episode||all[0]?.id||'';$('ai-watch-episodes').value=selectedEpisode;$('ai-watch-notice').textContent=tr('只读观战 · 按记录动作播放游戏动画，不调用模型、不改动存档。暂停会在当前动作结束后生效。','Recorded actions with game animations. No model calls or save changes. Pause takes effect after the current action.');}
  function invalidate(){token++;prefetched=null;api.cancel();inflight=false;}
  function requestFrame(index){return get('/api/ai/frame?run='+encodeURIComponent(selectedRun)+'&episode='+encodeURIComponent(selectedEpisode)+'&index='+index);}
  async function show(index,animate=false){
    if(!selectedRun||!selectedEpisode||inflight)return false;const own=token;inflight=true;
    try{
      const data=await (prefetched?.index===index?prefetched.promise:requestFrame(index));prefetched=null;
      if(own!==token||!active)return false;
      if(data.waiting){say(tr('等待第一个模型动作…','Waiting for first model action…'));return true;}
      const next=data.index===frame+1,changed=token+'/'+selectedRun+'/'+selectedEpisode+'/'+data.index!==lastRender;
      if(changed&&animate&&next){
        say(tr('正在播放 · ','Playing · ')+data.action);
        // Fetch the next decision during its animation, not after a fixed pause.
        if(data.index<data.total){const promise=requestFrame(data.index+1);promise.catch(()=>{});prefetched={index:data.index+1,promise};}
        if(!await api.animate(data,1000/Number($('ai-watch-speed').value)))return false;
      }else if(changed)api.show(data.snapshot);
      if(own!==token||!active)return false;
      frame=data.index;lastData=data;lastRender=token+'/'+selectedRun+'/'+selectedEpisode+'/'+frame;
      $('ai-watch-position').value=String(frame);$('ai-watch-position').max=String(data.total);
      const mode=data.finished?tr('真实日志 · 动画回放','Recorded actions · Animated replay'):tr('实时实验 · 日志跟随','Live experiment · Log follow');
      say(mode+' · '+data.character+' · F'+data.outcome.floor+'/5 · '+frame+'/'+data.total+' · '+data.action+(data.archived?' · '+tr('归档规则','Archived rules'):'')+(data.error?' · '+data.error:'')+(data.finished&&frame===data.total?' · '+data.result.reason:''));return true;
    }catch(e){if(own===token){say(e.message);stop();}return false;}finally{if(own===token)inflight=false;}
  }
  async function tick(loop=playbackLoop){if(!playing||loop!==playbackLoop)return;if(inflight){timer=setTimeout(()=>tick(loop),80);return;}const own=token,ok=await show(frame+1,true);if(own!==token||!playing||loop!==playbackLoop)return;if(!ok||lastData?.finished&&frame>=lastData.total){stop();return;}timer=setTimeout(()=>tick(loop),lastData&&frame>=lastData.total?500:Math.max(60,Number($('ai-watch-speed').value)*.15));}
  async function open(){if(active)return;active=true;token++;panel.hidden=false;document.body.classList.add('ai-watching');api.begin();await refresh();if(selectedEpisode)await show(0);}
  function close(){stop();invalidate();active=false;panel.hidden=true;document.body.classList.remove('ai-watching');api.end();}
  async function jump(index){stop();invalidate();lastRender='';await show(index);}
  $('ai-watch-seek').onclick=()=>{const n=Number($('ai-watch-position').value);if(Number.isInteger(n)&&n>=0)jump(n);};
  $('ai-watch-close').onclick=close;$('ai-watch-refresh').onclick=refresh;
  $('ai-watch-runs').onchange=()=>{stop();invalidate();selectedRun=$('ai-watch-runs').value;selectedEpisode='';episodes();frame=0;lastRender='';show(0);};
  $('ai-watch-episodes').onchange=()=>{stop();invalidate();selectedEpisode=$('ai-watch-episodes').value;frame=0;lastRender='';show(0);};
  $('ai-watch-play').onclick=()=>{if(playing){stop();return;}playing=true;$('ai-watch-play').textContent=tr('暂停','Pause');tick();};
  $('ai-watch-step').onclick=()=>{stop();show(frame+1,true);};$('ai-watch-reset').onclick=()=>jump(0);
  $('ai-watch-live').onclick=async()=>{await jump('latest');if(!active)return;playing=true;$('ai-watch-play').textContent=tr('暂停','Pause');tick();};
  function localize(){
    const button=$('ai-watch-button');if(button)button.textContent='观看 AI 游玩';
    $('ai-watch-play').textContent=playing?'暂停':'播放';
    if(active)episodes();
    CrawlerLocale.translate();
  }
  root.AIWatch={localize,attach(callbacks){api=callbacks;const b=document.createElement('button');b.id='ai-watch-button';b.textContent='观看 AI 游玩';b.onclick=open;document.querySelector('.topbar nav').append(b);},open,isActive:()=>active};
})(globalThis);
