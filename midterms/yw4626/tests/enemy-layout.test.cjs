'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
const section=src.slice(src.indexOf('  function intentText('),src.indexOf('  function staticPreview('));
function render(count,boss=false){
 const enemies=Array.from({length:count},(_,i)=>({id:i+1,name:boss&&i===0?'死神首领':'图书馆骷髅',english:boss&&i===0?'Reaper':'Skeleton',key:'skeleton',health:24,maxHealth:36,armor:2,slot:{column:i%5,row:Math.floor(i/5)},encounterRole:boss&&i===0?'boss':'normal',intent:{actions:i===1?[{kind:'attack',value:7},{kind:'armor',value:4}]:[{kind:'attack',value:5}]}}));
 const elements=Object.fromEntries(['enemies','target-hint','enemies-left'].map(k=>[k,{innerHTML:'',textContent:'',dataset:{},querySelectorAll(){return [];},append(){},classList:{toggle(){}},style:{setProperty(){}}}]));
 const context={matchMedia:()=>({matches:false}),performance:{now:()=>1000},CombatMotion:require('../dist/combat-motion'),battle:{enemies,target:1},battleVisual:null,CrawlerLocale:{language:'zh'},$:id=>elements[id],fmt:String,escape:s=>String(s).replace(/[<>&"]/g,''),tr:(a,b)=>a,svg:()=>'<svg class="enemy-art"></svg>'};
 vm.createContext(context);vm.runInContext(section+'\ndrawEnemies();',context);
 return {get html(){return elements.enemies.innerHTML;},context,enemies,elements,presentation:()=>vm.runInContext('enemyPresentation(battle.enemies).map(x=>({id:x.enemy.id,depth:x.depth,row:x.enemy.slot.row,column:x.enemy.slot.column}))',context),redraw:()=>vm.runInContext('drawEnemies()',context)};
}
for(const [n,boss] of [[3,false],[10,false],[20,false],[15,true],[25,true]])test(`${n} enemies, boss=${boss}: depth uses combat columns with only front readouts`,()=>{
 const r=render(n,boss),before=JSON.stringify(r.enemies),rows=r.presentation(),front=Math.min(5,n);
 assert.equal((r.html.match(/class="enemy-readout"/g)||[]).length,front);
 assert.equal((r.html.match(/class="bar"/g)||[]).length,front);
 assert.equal((r.html.match(/data-enemy=/g)||[]).length,Math.min(15,n));
 assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
 assert.equal(rows.filter(x=>x.depth===0).length,front);
 assert.ok(rows.every(x=>x.depth<3));
 assert.equal(r.elements.enemies.dataset.count,String(n));
 assert.match(r.elements['enemies-left'].textContent,new RegExp(`后备 ${n-front}`));
 assert.match(r.html,/攻击 7/);assert.match(r.html,/护甲 \+4/);
 for(const x of rows){const e=r.enemies.find(e=>e.id===x.id);assert.equal(e.slot.row,x.row);assert.equal(e.slot.column,x.column);}
 assert.equal(JSON.stringify(r.enemies),before,'rendering never changes engine formation');
 if(boss)assert.match(r.html,/boss-enemy/);
});
test('render promotes the next living occupant, including an old save with row gaps',()=>{
 const r=render(20);r.enemies[0].health=0;r.enemies[5].slot.row=4;r.enemies[10].slot.row=7;r.enemies[15].slot.row=9;
 const before=JSON.stringify(r.enemies);r.redraw();const rows=r.presentation();
 assert.equal(rows.find(x=>x.column===0&&x.depth===0).id,6);
 assert.equal(rows.find(x=>x.id===6).row,4,'visual rank does not overwrite stored slot');
 assert.equal(rows.find(x=>x.id===11).depth,1);assert.equal(rows.find(x=>x.id===16).depth,2);
 assert.ok(!rows.some(x=>x.id===1));assert.equal(JSON.stringify(r.enemies),before);
 assert.match(r.elements['enemies-left'].textContent,/共 19\/20/);
});
