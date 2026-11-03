'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle,catalog,definition,damageProfile}=require('../dist/engine.js');
const {Run}=require('../dist/run.js');
const Fx=require('../dist/effects-v10.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message||''}: ${actual} != ${expected}`);
function enemies(actions=[{kind:'attack',value:1}]){
 return [0,2,4].map((column,i)=>({key:'ghost',name:'target '+i,health:100000,slot:{row:0,column},intents:[{id:0,weight:1,consecutive:true,actions}]}));
}
function battle(keys=['knife'],targets=enemies()){
 const deck=[...keys,...Array(8).fill('armor')].map((key,i)=>({id:i+1,key,level:0,gems:[],free:false,modifiers:[0,0,0,0]}));
 const b=new Battle({seed:'CONSUMER-V10',deck,enemies:targets,settings:{attackRulesVersion:10,wildStrength:true,dealCount:0,handLimit:30,health:100,startingMana:100}});
 b.piles.hand=keys.map((_,i)=>b.piles.draw.find(c=>c.id===i+1));b.piles.draw=b.piles.draw.filter(c=>c.id>keys.length);return b;
}
function scripted(b,values,fallback=.999){let index=0;const fn=()=>index<values.length?values[index++]:fallback;fn.state=()=>12345;b.effectRandom=fn;return()=>index;}
function runBattle(){const r=new Run({seed:'CONSUMER-RUN',combatVersion:10,exploration:false,profile:'demo'});assert.ok(r.enter(r.available()[0].id).ok);return r;}
function win(r){r.battle.phase='victory';r.battle.enemies.forEach(e=>{e.health=0;e.intent=null;});assert.equal(r.settleBattle(),true);}

test('Area includes its main target, preserves fractional damage and consumes each target armor separately',()=>{
 const b=battle(),card=b.piles.hand[0],def={...definition(card),area:5};b.player.area=5;b.enemies[1].armor=.3;
 Fx.hit(b,card,def,b.enemies[0],20,{wave:1,hit:1});
 near(b.enemies[0].health,100000-20-.4,'main hit plus its own splash');
 near(b.enemies[1].health,100000-.1,'neighbor armor absorbs .3 of .4');
 near(b.enemies[1].armor,0);near(b.enemies[2].health,100000-.4);
 assert.equal(b.events.filter(e=>e.splash).length,3);
});

test('splash uses original damage, does not inherit main critical/frozen multipliers or consume neighboring freeze',()=>{
 const b=battle(),card=b.piles.hand[0],def={...definition(card),area:0,canCrit:true,critChance:1,critMultiplier:3};b.player.area=5;
 Fx.freezeFront(b,card,2);scripted(b,[0]);
 Fx.hit(b,card,def,b.enemies[0],20,{wave:1,hit:1});
 near(b.enemies[0].health,100000-120-.2);near(b.enemies[1].health,100000-.2);
 assert.equal(b.enemies[0].freezeStacks,1);assert.equal(b.enemies[1].freezeStacks,2);assert.equal(b.enemies[2].freezeStacks,2);
});

test('Bloody Tear OncePerAttack heals at most two per card even at combo three, then resets for another instance',()=>{
 const b=battle(['bloodyTear','bloodyTear']);b.player.health=10;b.combo=2;b.previousWild=true;scripted(b,[],0);
 assert.equal(b.cardPreview(b.piles.hand[0]).multiplier,3);assert.ok(b.play(1).ok);assert.equal(b.player.health,12);
 assert.ok(b.events.filter(e=>e.type==='critical').length>1);assert.equal(b.events.filter(e=>e.type==='heal').length,1);
 assert.ok(b.play(2).ok);assert.equal(b.player.health,14);assert.equal(b.events.filter(e=>e.type==='heal').length,2);
});

test('native EveryCrit mode applies its fixed trigger heal per critical hit without a combo multiplier',()=>{
 const b=battle(['bloodyTear']),card=b.piles.hand[0],def=clone(definition(card));
 def.critChance=1;def.effectDescriptors.find(e=>e.kind==='damage').raw._critEffectType=2;b.combo=8;b.player.health=10;scripted(b,[],0);
 for(let hit=1;hit<=3;hit++)Fx.hit(b,card,def,b.enemies[0],1,{wave:1,hit});
 assert.equal(b.player.health,16);assert.equal(b.events.filter(e=>e.type==='heal').length,3);
});

test('Recovery is applied once after victory, never on player turn start and never added to Heal',()=>{
 const r=runBattle(),b=r.battle;b.player.health=20;b.player.recovery=7;const max=b.player.maxHealth;
 b.beginPlayerTurn();assert.equal(b.player.health,20);Fx.heal(b,2,b.piles.hand[0]);assert.equal(b.player.health,22);
 win(r);assert.equal(r.health,Math.min(max,29));assert.equal(r.history.filter(e=>e.type==='recovery').length,1);
 assert.equal(r.settleBattle(),false);assert.equal(r.history.filter(e=>e.type==='recovery').length,1);
 const restored=Run.restore(r.snapshot());assert.equal(restored.health,r.health);assert.equal(restored.combatBonuses?.recovery,undefined);
});

test('Recovery does not revive a defeated player',()=>{
 const r=runBattle();r.battle.player.recovery=100;r.battle.player.health=0;r.battle.phase='defeat';assert.ok(r.settleBattle());assert.equal(r.phase,'lost');assert.equal(r.health,0);assert.equal(r.history.filter(e=>e.type==='recovery').length,0);
});

test('Revival charge crosses 100, caps at three, clears surplus at cap, persists and restores full health on fatal damage',()=>{
 const b=battle(),card=b.piles.hand[0];Fx.stat(b,card,'revival',99);assert.equal(b.player.revivalStacks,0);
 Fx.stat(b,card,'revival',2);assert.equal(b.player.revivalStacks,1);assert.equal(b.player.revival,1);
 Fx.stat(b,card,'revival',250);assert.equal(b.player.revivalStacks,3);assert.equal(b.player.revival,0);
 Fx.stat(b,card,'revival',50);assert.equal(b.player.revival,0);
 let restored=Battle.restore(b.snapshot());assert.equal(restored.player.revivalStacks,3);restored.player.health=0;assert.ok(Fx.revive(restored));assert.equal(restored.player.health,100);assert.equal(restored.player.revivalStacks,2);
 const r=runBattle();r.battle.player.revivalStacks=2;r.battle.player.revival=23;win(r);
 const saved=Run.restore(r.snapshot());assert.equal(saved.combatBonuses.revivalStacks,2);assert.equal(saved.combatBonuses.revival,23);assert.equal(saved.combatSettings().revivalStacks,2);
 const fatal=battle(['armor'],enemies([{kind:'attack',value:5}]).slice(0,1));fatal.player.health=1;fatal.player.revivalStacks=1;fatal.player.armor=0;assert.ok(fatal.beginEnemyTurn());assert.ok(fatal.resolveNextEnemy());assert.equal(fatal.player.health,100);assert.equal(fatal.player.revivalStacks,0);assert.notEqual(fatal.phase,'defeat');
});

test('Orologion at combo three freezes three times; damage consumes one stack and restores the interrupted intent on the last',()=>{
 const b=battle(['orologion','knife']);b.combo=2;b.previousWild=true;assert.ok(b.play(1).ok);
 assert.equal(b.events.filter(e=>e.type==='freeze').length,9);for(const e of b.enemies){assert.equal(e.freezeStacks,3);assert.equal(e.intent,null);assert.ok(e.frozenIntent);}
 const target=b.enemies[0],intent=clone(target.frozenIntent),card=b.piles.hand[0],def=definition(card);
 for(let n=0;n<3;n++)Fx.hit(b,card,def,target,1,{wave:n+1,hit:n+1});
 assert.equal(target.freezeStacks,0);assert.deepEqual(target.intent,intent);assert.equal(target.frozenIntent,undefined);near(target.health,100000-6);
 Fx.hit(b,card,def,target,1,{wave:4,hit:4});near(target.health,100000-7);
 const save=Battle.restore(b.snapshot());assert.equal(save.enemies[1].freezeStacks,3);assert.equal(save.enemies[1].intent,null);
});

test('unconsumed freeze suppresses enemy actions this turn and is fully cleared at enemy turn end',()=>{
 const b=battle(['orologion']);b.combo=2;b.previousWild=true;assert.ok(b.play(1).ok);const health=b.player.health;assert.ok(b.endTurn());
 assert.equal(b.player.health,health);assert.equal(b.events.filter(e=>e.type==='enemy_action').length,0);
 for(const e of b.enemies){assert.equal(e.freezeStacks,0);assert.equal(e.frozenIntent,undefined);assert.ok(e.intent);}
});

test('Heaven Sword bounce rolls decay per success, add pierce rather than waves and reset their exponent each wave',()=>{
 const b=battle(['heavenSword']),card=b.piles.hand[0],def={...definition(card),canCrit:false};
 // wave1: .19 < .20; .159 < .16; .129 >= .128 => 2 bounces.
 // wave2: .19 < .20; .17 >= .16 => 1 bounce, proving exponent resets.
 scripted(b,[.19,.159,.129,.19,.17]);b.resolvePatternAttack(card,def,{damage:1,hits:2});
 const hits=b.events.filter(e=>e.type==='enemy_damage'&&!e.splash);assert.equal(hits.length,13);assert.equal(hits.filter(e=>e.wave===1).length,7);assert.equal(hits.filter(e=>e.wave===2).length,6);
 const lucky=battle(['heavenSword']),c=lucky.piles.hand[0];lucky.player.luck=100;scripted(lucky,[.39,.33]);lucky.resolvePatternAttack(c,{...definition(c),canCrit:false},{damage:1,hits:1});assert.equal(lucky.events.filter(e=>e.type==='enemy_damage').length,6);
});

test('Phieraggi adds floored revival bonus after ordinary projectile computation and caps the bonus at ten',()=>{
 const def=definition({key:'phieraggi',level:0}),ordinary={...def,damageEffectType:'DamageEffect'};
 for(const [stacks,charge,expected]of [[0,99,0],[1,0,1],[2,75,2],[20,50,10]])for(const combo of [1,3]){
  const player={might:0,amount:2,revivalStacks:stacks,revival:charge};const plain=damageProfile(ordinary,player,combo),evolved=damageProfile(def,player,combo);
  assert.equal(evolved.hits-plain.hits,expected);assert.equal(evolved.damage,plain.damage);
 }
});

test('knockback uses knockback resistance, preserves non-attack actions and is distinct from disarm',()=>{
 const b=battle(['hellfire']),card=b.piles.hand[0],def={...definition(card),knockback:100},target=b.enemies[0];
 target.knockbackResistance=100;target.disarmResistance=0;scripted(b,[],0);Fx.hit(b,card,def,target,1,{wave:1,hit:1,allowKnockback:true});assert.ok(target.intent);
 target.knockbackResistance=0;target.disarmResistance=100;target.intent={actions:[{kind:'attack',value:5},{kind:'armor',value:4}]};
 Fx.hit(b,card,def,target,1,{wave:2,hit:2,allowKnockback:true});assert.deepEqual(target.intent.actions,[{kind:'armor',value:4}]);
});

