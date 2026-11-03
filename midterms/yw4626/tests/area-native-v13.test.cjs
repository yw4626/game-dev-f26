'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine.js'),{Run}=require('../dist/run.js');
function fixture(key='knife'){
 const enemies=Array.from({length:15},(_,i)=>({key:'ghost',name:'Enemy '+i,health:100,slot:{row:Math.floor(i/5),column:i%5},intents:[{id:1,weight:1,consecutive:true,actions:[{kind:'attack',value:1}]}]}));
 return new E.Battle({seed:'AREA13',deck:[{id:1,key,gems:[]}],enemies,settings:{attackRulesVersion:13,dealCount:1,handLimit:20,startingMana:100}});
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('native Area zero gives zero splash; 5 gives 1%, 100 gives 20%, no free base ratio',()=>{
 const d=E.definition({key:'knife'});for(const [area,expected]of [[0,0],[5,.2],[100,4],[200,8]])near(E.specials.areaInfo(d,{area},20).damage,expected);
 assert.equal(E.specials.areaInfo(d,{area:5},20).damage,Math.fround(.05)*20*Math.fround(.2));
});
test('base and player Area add before normalization; ignoreArea suppresses damage and size growth',()=>{
 const d=E.definition({key:'knife'});near(E.specials.areaInfo({...d,area:5},{area:5},20).damage,.4);
 const ignored={...d,effectDescriptors:[{kind:'damage',raw:{_ignoreArea:true}}]};assert.equal(E.specials.areaInfo(ignored,{area:100},20).damage,0);assert.equal(E.specials.areaInfo(ignored,{area:100},20).size,1);
 near(E.specials.areaInfo(d,{area:100},20).size,1.5);assert.equal(E.specials.areaInfo(d,{area:100000},20).size,10);
});
test('ordinary splash hits surviving front including main target, never waiting reserves; fractional armor works',()=>{
 const b=fixture(),c=b.piles.hand[0];b.player.area=5;b.enemies[1].armor=.1;
 E.effectsV10.hit(b,c,E.definition(c),b.enemies[0],20,{wave:1,hit:1});
 near(b.enemies[0].health,79.8);near(b.enemies[1].health,99.9);near(b.enemies[2].health,99.8);
 assert.ok(b.enemies.slice(5).every(e=>e.health===100));assert.equal(b.events.filter(e=>e.splash).length,5);
});
test('main target death does not splash its newly advanced replacement on that same hit',()=>{
 const b=fixture(),c=b.piles.hand[0];b.enemies[0].health=1;b.player.area=5;
 E.effectsV10.hit(b,c,E.definition(c),b.enemies[0],20,{wave:1,hit:1});assert.equal(b.enemies[5].health,100);
 E.effectsV10.hit(b,c,E.definition(c),b.enemies[1],20,{wave:2,hit:2});near(b.enemies[5].health,99.8);
});
test('ordinary splash does not inherit critical/frozen main multipliers or consume adjacent freeze',()=>{
 const b=fixture(),c=b.piles.hand[0],d={...E.definition(c),canCrit:true,critChance:1,critMultiplier:3};b.player.area=5;b.enemies[0].freezeStacks=2;b.enemies[1].freezeStacks=2;
 E.effectsV10.hit(b,c,d,b.enemies[0],10,{wave:1,hit:1});near(b.enemies[0].health,39.9);near(b.enemies[1].health,99.9);assert.equal(b.enemies[1].freezeStacks,2);
});
test('Bible reuses extracted targeting rather than unconditional front and rear damage',()=>{
 const b=fixture('bible'),p=b.cardPreview(b.piles.hand[0]);assert.equal(p.areaAttack,false);assert.equal(p.pierce,1);assert.equal(p.areaSplashDamage,0);
 b.play(1);assert.equal(b.events.filter(e=>e.splash).length,0);assert.ok(b.enemies.slice(5).every(e=>e.health===100));
});

test('FrontRowTargeting retains its original row for every wave of one damage effect',()=>{
 const b=fixture('garlic'),c=b.piles.hand[0];b.player.area=100;
 for(const e of b.enemies.slice(0,5))e.health=1;
 b.resolvePatternAttack(c,E.definition(c),{damage:20,hits:3});
 assert.ok(b.enemies.slice(0,5).every(e=>e.health===0));
 assert.ok(b.enemies.slice(5).every(e=>e.health===100));
 b.resolvePatternAttack(c,E.definition(c),{damage:20,hits:1});
 assert.ok(b.enemies.slice(5,10).some(e=>e.health<100));
});
test('live Runetracer contact uses frozen damage for Area, boundary explosions remain independent',()=>{
 const b=fixture('noFuture'),old=E.specials.projectileTimeline;b.player.area=100;b.enemies[0].freezeStacks=1;
 try{E.specials.projectileTimeline=()=>[{type:'contact',wave:1,time:0,column:0,position:{x:1,y:3}},{type:'explosion',wave:1,time:.1,boundary:'left',position:{x:0,y:3}}];b.play(1);}finally{E.specials.projectileTimeline=old;}
 near(b.enemies[1].health,94);assert.equal(b.events.filter(e=>e.splash).length,5);assert.equal(b.events.filter(e=>e.type==='boundary_explosion').length,1);assert.ok(b.enemies.slice(5).every(e=>e.health===100));
});
test('v12 save migration removes temporary ratio without rebuilding battle or losing hand',()=>{
 const r=new Run({combatVersion:12,exploration:false});r.enter(r.available()[0].id);const before=r.battle.enemies.map(e=>e.health),hand=r.battle.piles.hand.map(e=>e.id);
 assert.ok(r.enableCombatV13());assert.equal(r.enableCombatV13(),false);assert.equal(r.combatVersion,13);assert.equal(r.battle.settings.rearSplashRatio,undefined);assert.deepEqual(r.battle.enemies.map(e=>e.health),before);assert.deepEqual(r.battle.piles.hand.map(e=>e.id),hand);
 assert.equal(Run.restore(r.snapshot()).battle.settings.attackRulesVersion,13);
});
test('native card descriptions show actual Area formula in both languages, no temporary rear promise',()=>{
 for(const en of [false,true]){const text=E.specials.describe(E.definition({key:'bible'}),{player:{area:5},damage:20,en}).lines.join(' ');assert.ok(text.includes('0.2'));assert.ok(text.includes(en?'current front':'当前前排'));assert.ok(!text.includes(en?'base 20%':'基础20%'));}
});
