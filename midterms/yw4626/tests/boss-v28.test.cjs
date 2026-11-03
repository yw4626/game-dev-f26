'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),{Battle,bossRules:R}=E;
function fixture(floor,helpers=0){
 const enemy=(i,boss)=>({key:'lion',name:boss?'Boss':'Guard',health:boss?5000:10,armor:0,slot:{row:boss?1:0,column:i},encounterRole:boss?'boss':'minion',finalBoss:boss,intents:[{id:0,weight:1,consecutive:true,actions:[{kind:'attack',value:1}]}]});
 return new Battle({seed:'BOSS-DEV-'+floor,deck:['whip','whip','whip','armor','lightTome','draw','littleHeart','coinCard','littleClover'].map((key,i)=>({id:i+1,key,free:true})),enemies:[...Array.from({length:helpers},(_,i)=>enemy(i,false)),enemy(2,true)],settings:{bossRulesVersion:28,bossFloor:floor,attackRulesVersion:13,dealCount:20,handLimit:20,startingMana:10,startingArmor:0},player:{health:200,maxHealth:200}});
}
test('root buds reduce actual damage, give mana once, and clearing both opens a timed vulnerability',()=>{
 const b=fixture(1,2),boss=b.enemies.at(-1),c=b.piles.hand[0];const before=boss.health;b.applyDamage(c,boss,100);assert.equal(before-boss.health,70);
 const mana=b.player.mana;for(const e of b.enemies.slice(0,2))b.applyDamage(c,e,100);assert.equal(b.player.mana,mana+2);const hp=boss.health;b.applyDamage(c,boss,100);assert.equal(hp-boss.health,125);b.endTurn();assert.equal(R.scaleDamage(b,boss,100),100);
});
test('book requires distinct colors; one wildcard slot; spell cancels and shield vanishes',()=>{
 const b=fixture(2),boss=b.enemies[0];boss.armor=60;
 b.play(7);b.play(8);assert.equal(R.publicState(b).bosses[0].sealProgress,1);b.play(1);assert.equal(R.publicState(b).bosses[0].sealProgress,2);b.play(4);assert.equal(boss.bossMechanic.broken,true);assert.equal(boss.armor,0);assert.equal(boss.intent.actions[0].kind,'wait');
 const hp=b.player.health;b.endTurn();assert.equal(b.player.health,hp);assert.equal(boss.bossMechanic.broken,false);
});
test('rat plague caps, decays ignoring armor, antidotes and healing cleanse, summons finite',()=>{
 const b=fixture(3,2);b.bossState.plague=4;b.player.armor=99;b.beginEnemyTurn();assert.equal(b.player.health,196);assert.equal(b.player.armor,99);assert.equal(b.bossState.plague,3);
 while(b.phase==='enemy')b.resolveNextEnemy();b.applyDamage(b.piles.hand[0],b.enemies[0],100);assert.equal(b.bossState.plague,1);b.play(7);assert.equal(b.bossState.plague,0);
 const rat=b.enemies.find(e=>e.bossKind===3);for(const e of b.enemies.filter(e=>e!==rat))e.health=0;b.compactFormation();for(let i=0;i<8;i++){b.player.health=200;b.endTurn();}assert.ok(rat.bossMechanic.spawned<=2);assert.ok(b.bossState.plague<=4);assert.ok(b.enemies.filter(e=>e.bossHelper==='antidote').length<=6);
});
test('plague can defeat or consume a revival and is cleared with a fresh battle',()=>{
 const b=fixture(3);b.player.health=1;b.bossState.plague=4;b.endTurn();assert.equal(b.phase,'defeat');
 const c=fixture(3);c.player.health=1;c.player.revivalStacks=1;c.bossState.plague=4;c.endTurn();assert.notEqual(c.phase,'defeat');assert.equal(c.player.revivalStacks,0);assert.equal(fixture(3).bossState.plague,0);
});
test('prisoner counts attack cards, not hits, and skips the heavy strike after a break',()=>{
 const b=fixture(4);b.endTurn();assert.equal(R.publicState(b).bosses[0].charging,true);b.play(1);assert.equal(b.enemies[0].bossMechanic.attacks,1);b.play(2);b.play(3);assert.equal(b.enemies[0].bossMechanic.skipStrike,true);const hp=b.player.health;b.endTurn();assert.equal(b.player.health,hp);assert.equal(b.enemies[0].intent.actions[0].kind,'wait');b.endTurn();assert.equal(b.player.health,hp);
});
test('vampire ritual survives lethal multi-hit, resolves after card, preserves chain, and never repeats after restore',()=>{
 const b=fixture(5,1),v=b.enemies.at(-1);b.player.amount=50;v.health=1;b.enemies[0].health=1;assert.equal(b.play(1).ok,true);assert.equal(b.phase,'player');assert.equal(b.bossState.ritualUsed,true);assert.equal(v.health,1);assert.equal(b.combo,1);
 const echoes=b.enemies.filter(e=>e.bloodEcho);assert.equal(echoes.length,4);assert.deepEqual(echoes.map(e=>e.bossKind),[1,2,3,4]);assert.ok(echoes.every(e=>e.xpOverride===0&&!e.finalBoss));assert.deepEqual(R.publicState(b).bosses.filter(e=>e.echo).map(e=>e.activeIn),[1,2,3,4]);
 const restored=Battle.restore(b.snapshot());assert.deepEqual(restored.bossState,b.bossState);for(const e of restored.enemies.filter(e=>e.bloodEcho))e.health=0;R.afterCard(restored,E.definition({key:'armor'}),restored.player.health);assert.equal(restored.enemies.filter(e=>e.bloodEcho).length,4);restored.applyDamage(restored.piles.hand[0],restored.enemies.find(e=>e.bossKind===5),100);R.afterCard(restored,E.definition({key:'armor'}),200);assert.equal(restored.enemies.find(e=>e.bossKind===5).health,0);
});
test('boss state is public and detached; old saves and ordinary fights do not gain mechanics',()=>{
 const b=fixture(2),o=R.publicState(b);o.bosses[0].colors.push('cheat');assert.equal(b.enemies[0].bossMechanic.colors.length,0);assert.equal(JSON.stringify(o).includes('Rng'),false);
 const plain=new Battle({seed:'old',settings:{bossFloor:5}});assert.equal(R.publicState(plain),null);assert.equal(Battle.restore(plain.snapshot()).bossState,undefined);
});

test('dormant garden echo has no aura, waking enables aura, ritual restores vampire erase resistance',()=>{
 const b=fixture(5),v=b.enemies[0];v.bossMechanic.originalInstakillResist=.9;
 R.afterCard(b,E.definition({key:'armor'}),200);assert.equal(v.instakillResist,.9);
 const garden=b.enemies.find(e=>e.bossKind===1),book=b.enemies.find(e=>e.bossKind===2);
 assert.equal(R.scaleDamage(b,book,100),100);b.endTurn();assert.equal(R.scaleDamage(b,book,100),90);
 garden.health=0;assert.equal(R.scaleDamage(b,book,100),100);
});

test('vampire lifesteal ignores armor and uses lost HP even when the player revives',()=>{
 const b=fixture(5),v=b.enemies[0];b.bossState.ritualUsed=true;v.health=100;b.player.armor=999;b.endTurn();assert.equal(v.health,100);
 b.player.armor=0;b.player.health=2;b.player.revivalStacks=1;b.endTurn();assert.equal(v.health,102);assert.equal(b.player.revivalStacks,0);assert.notEqual(b.phase,'defeat');
});

test('frozen plague boss cannot infect or summon during the skipped action',()=>{
 const b=fixture(3),e=b.enemies[0];e.freezeStacks=1;e.intent=null;b.endTurn();assert.equal(b.bossState.plague,0);assert.equal(e.bossMechanic.spawned,0);
});


test('vampire echoes protect its final HP; after echoes fall blades cause capped, decaying bleed and armor blocks it',()=>{
 const b=fixture(5),v=b.enemies[0];R.afterCard(b,E.definition({key:'armor'}),200);v.health=1;
 b.applyDamage(b.piles.hand[0],v,9999);assert.equal(v.health,1);
 for(const e of b.enemies.filter(e=>e.bloodEcho))e.health=0;
 // Later hits of the same card must not skip the final stage before afterCard.
 b.applyDamage(b.piles.hand[0],v,9999);assert.equal(v.health,1);
 R.afterCard(b,E.definition({key:'armor'}),200);b.compactFormation();b.decideIntent(v);
 assert.equal(R.publicState(b).bloodFury,true);b.player.armor=999;b.endTurn();assert.equal(b.bossState.bleed,0);
 b.player.armor=0;b.endTurn();assert.equal(b.bossState.bleed,2);
 const hp=b.player.health;b.player.armor=999;b.beginEnemyTurn();assert.equal(b.player.health,hp-2);assert.equal(b.bossState.bleed,1);
 const saved=Battle.restore(b.snapshot());assert.equal(R.publicState(saved).bleed,1);
 R.afterCard(saved,{heal:1},saved.player.health);assert.equal(saved.bossState.bleed,0);
 for(let i=0;i<8;i++)R.afterAction(b,v,b.player.health+1,1);assert.equal(b.bossState.bleed,6);
});
