/* Gesture-unlocked, bounded SFX mixer. Kenney CC0 wood + original synthesized retro cues. */
(function(root){
 'use strict';
 const KEY='duskvault-audio-v1',voices=new Set(),buffers=new Map(),last=new Map();
 let context,master,compressor,noise,peak=0,played=0,settings={muted:false,volume:.35};
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved){settings.muted=!!saved.muted;if(Number.isFinite(saved.volume))settings.volume=Math.max(0,Math.min(1,saved.volume));}}catch{}
 const tr=(zh,en)=>root.CrawlerLocale?.language==='en'?en:zh;
 function update(){
  if(master)master.gain.setTargetAtTime(settings.muted?0:settings.volume,context.currentTime,.015);
  const button=document.getElementById('sound-toggle'),slider=document.getElementById('sound-volume');
  if(button){button.textContent=settings.muted?tr('音效 关','SFX OFF'):tr('音效 开','SFX ON');button.setAttribute('aria-pressed',String(settings.muted));button.title=tr('切换音效','Toggle sound effects');}
  if(slider){slider.value=Math.round(settings.volume*100);slider.setAttribute('aria-label',tr('音效音量','Sound effect volume'));}
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}update();}
 function unlock(){
  if(!context){
   const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;
   try{context=new Audio();master=context.createGain();compressor=context.createDynamicsCompressor();compressor.threshold.value=-16;compressor.ratio.value=5;compressor.connect(master);master.connect(context.destination);
    noise=context.createBuffer(1,context.sampleRate,context.sampleRate);const a=noise.getChannelData(0);let seed=8927;for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;a[i]=(seed>>>0)/2147483648-1;}
    for(const [name,b64]of Object.entries(root.DuskAudioSamples||{})){const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));context.decodeAudioData(bytes.buffer).then(buffer=>buffers.set(name,buffer)).catch(()=>{});}update();
   }catch{context=null;return;}
  }
  if(context.state==='suspended'&&!document.hidden)context.resume().catch(()=>{});
 }
 function tone({frequency=220,end=frequency,duration=.12,type='triangle',gain=.18,delay=0,noiseBand=0,sample}={}){
  if(!context||voices.size>=20)return;
  const start=context.currentTime+delay,node=sample||noiseBand?context.createBufferSource():context.createOscillator(),envelope=context.createGain();let filter;
  if(sample)node.buffer=sample;
  else if(noiseBand){node.buffer=noise;filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(noiseBand,start);filter.frequency.exponentialRampToValueAtTime(Math.max(60,end),start+duration);filter.Q.value=.65;}
  else{node.type=type;node.frequency.setValueAtTime(frequency,start);node.frequency.exponentialRampToValueAtTime(Math.max(30,end),start+duration);}
  envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(gain,start+.006);envelope.gain.exponentialRampToValueAtTime(.001,start+duration);
  node.connect(filter||envelope);if(filter)filter.connect(envelope);envelope.connect(compressor);
  voices.add(node);peak=Math.max(peak,voices.size);node.onended=()=>{voices.delete(node);node.disconnect();filter?.disconnect();envelope.disconnect();};node.start(start);node.stop(start+duration+.015);
 }
 function play(kind){
  if(!context||context.state!=='running'||settings.muted||settings.volume===0||document.hidden)return false;
  const now=performance.now();if(now-(last.get(kind)??-Infinity)<75)return false;last.set(kind,now);played++;
  switch(kind){
   case 'fire':tone({noiseBand:1600,end:110,duration:.33,gain:.3});tone({frequency:140,end:48,duration:.24,gain:.18});break;
   case 'whip':tone({noiseBand:5500,end:1400,duration:.075,gain:.38});tone({frequency:130,end:44,duration:.1,gain:.18});break;
   case 'axe':case 'claw':case 'knife':case 'cross':case 'birds':tone({noiseBand:3300,end:550,duration:.15,gain:.28});tone({frequency:280,end:80,duration:.09,gain:.13});break;
   case 'lightning':case 'guns':tone({noiseBand:4200,end:700,duration:.19,gain:.26});tone({type:'sawtooth',frequency:700,end:80,duration:.12,gain:.07});break;
   case 'bible':case 'aura':case 'song':case 'flowers':[330,495,660].forEach((frequency,i)=>tone({frequency,end:frequency*1.05,duration:.22,delay:i*.028,gain:.07}));break;
   case 'water':case 'ice':[1000,1400,1850].forEach((frequency,i)=>tone({frequency,end:frequency*.4,duration:.13,delay:i*.025,gain:.1}));tone({noiseBand:2700,end:850,duration:.15,gain:.12});break;
   case 'wand':case 'rune':tone({type:'square',frequency:700,end:180,duration:.13,gain:.07});tone({frequency:1050,end:350,duration:.16,gain:.09});break;
   case 'block':tone({frequency:940,end:580,duration:.12,gain:.12});tone({noiseBand:3600,end:1600,duration:.08,gain:.18});break;
   case 'hurt':tone({frequency:150,end:45,duration:.2,type:'sawtooth',gain:.09});tone({noiseBand:550,end:160,duration:.16,gain:.27});break;
   case 'death':tone({noiseBand:900,end:80,duration:.2,gain:.2});break;
   case 'break':case 'chest':case 'bump':{
    const sample=buffers.get(kind==='bump'?'wood2':'wood3');tone(sample?{sample,duration:kind==='bump'?.15:.28,gain:kind==='bump'?.5:.7}:{noiseBand:700,end:100,duration:.16,gain:.22});
    if(kind==='break')tone({noiseBand:2200,end:140,duration:.3,gain:.2,delay:.04});break;
   }
   case 'coin':case 'xp':case 'pickup':[kind==='xp'?784:1047,kind==='xp'?1175:1568].forEach((frequency,i)=>tone({frequency,end:frequency,duration:.12,delay:i*.065,type:'square',gain:.045}));break;
   default:tone({noiseBand:1300,end:200,duration:.14,gain:.2});
  }
  return true;
 }
 function cancel(){for(const node of [...voices]){try{node.stop();}catch{}}last.clear();}
 function init(){
  const nav=document.querySelector('.topbar nav');if(!nav)return;
  const controls=document.createElement('div');controls.className='audio-controls';controls.innerHTML='<button id="sound-toggle" class="quiet-button" type="button"></button><input id="sound-volume" type="range" min="0" max="100" step="5">';nav.prepend(controls);
  controls.querySelector('button').addEventListener('click',()=>{unlock();settings.muted=!settings.muted;save();if(!settings.muted)play('pickup');});
  controls.querySelector('input').addEventListener('input',e=>{unlock();settings.volume=Number(e.target.value)/100;save();});
  document.getElementById('language-select')?.addEventListener('change',()=>setTimeout(update,0));update();
 }
 document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();context?.suspend().catch(()=>{});}else if(context)unlock();});addEventListener('pagehide',cancel);
 root.GameAudio={play,cancel,unlock,refresh:update,setMuted:value=>{settings.muted=!!value;save();},setVolume:value=>{settings.volume=Math.max(0,Math.min(1,Number(value)||0));save();},stats:()=>({state:context?.state||'locked',voices:voices.size,peak,played,samples:buffers.size,...settings})};
 init();
})(globalThis);
