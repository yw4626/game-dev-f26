'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function harness(){
 const events=[],made=[];
 class El{
  constructor(tag){this.tag=tag;this.style={};this.dataset={};this.children=[];this.isConnected=true;this.classList={add:()=>{}};made.push(this);}
  setAttribute(){} after(){} append(...els){this.children.push(...els);} replaceChildren(){this.children=[];}
  getContext(){return {};}
  getBoundingClientRect(){return {left:100,top:100,width:100,height:180,bottom:280};}
  querySelector(){return this.art;}
  remove(){events.push('remove:'+this.tag);this.isConnected=false;}
  animate(frames,options){events.push({tag:this.tag,frames,duration:options.duration});return {finished:Promise.resolve(),cancel(){}};}
 }
 const arena=new El('arena'),heading=new El('heading'),enemies=Array.from({length:4},(_,i)=>{const e=new El('enemy'+i);e.art=new El('art'+i);return e;});
 const document={createElement:t=>new El(t),querySelector:s=>s==='.arena'?arena:s==='.battle-heading'?heading:s.startsWith('[data-enemy')?enemies[Number(s.match(/"(\d+)"/)[1])]:null};
 const context={document,BossRules:{publicState:b=>b},requestAnimationFrame:()=>1,matchMedia:()=>({matches:false}),PixelVFX:{emit:fx=>events.push('fx:'+fx)},GameAudio:{play:()=>{}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/boss-ui.js'),'utf8'),context);
 return {ui:context.BossUI,events,made,arena,enemies};
}
test('every boss cue renders, including vampire blood blades and bleed advice',()=>{
 const h=harness();h.ui.render({bosses:[1,2,3,4,5].map(kind=>({kind,id:kind,name:'Boss',colors:[],activeIn:0})),plague:0,bleed:2,bloodFury:true});
 assert.ok(h.made.some(e=>e.textContent==='格挡血刃，及时止血'));
 assert.ok(h.made.some(e=>String(e.textContent).includes('流血 2/6')));
});
test('four ground summons finish sequentially and restore visibility without changing the battle',async()=>{
 const h=harness(),b={enemies:Array.from({length:4},(_,id)=>({id,bloodEcho:true,health:10,name:'Echo'}))},before=JSON.stringify(b);
 await h.ui.summon(b);assert.equal(JSON.stringify(b),before);
 assert.deepEqual(h.events.filter(e=>e.tag?.startsWith('art')).map(e=>e.tag),['art0','art1','art2','art3']);
 assert.equal(h.made.filter(e=>e.className==='boss-ground-seal').length,4);
 assert.ok(h.enemies.every(e=>e.style.visibility===''));
 assert.ok(h.made.filter(e=>e.className==='boss-ground-seal').every(e=>!e.isConnected));
});
test('finale waits for three corpse bursts and a white flash before removing the boss',async()=>{
 const h=harness();await h.ui.finale(h.enemies[0]);
 assert.equal(h.events.filter(e=>e==='fx:explosions/plasma-explosion').length,3);
 const flash=h.made.find(e=>e.className==='boss-victory-flash');assert.ok(flash);assert.equal(flash.isConnected,false);
 assert.equal(h.events.at(-1),'remove:enemy0');
});
