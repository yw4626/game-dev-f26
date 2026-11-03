'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {Run}=require('../dist/run'),D=require('../dist/dungeon'),T=require('../dist/floor-themes'),M=require('../dist/combat-motion');
test('all current monster sprites share 64/96 grids and one 32-color palette, including legacy aliases',()=>{
 const context={PixelAssets:{palette:{},sprites:{}}};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/gothic-assets.js'),'utf8'),context);
 const {sprites,palette}=context.PixelAssets;assert.equal(Object.keys(palette).length,32);
 for(const floor of T.floors)for(const e of [...floor.enemies,floor.boss]){const size=e===floor.boss?96:64,rows=sprites[e.visualKey];assert.equal(rows.length,size);assert.ok(rows.every(row=>row.length===size));assert.ok(rows.join('').split('').every(k=>k==='.'||palette[k]));}
 for(const key of ['ghost','zombie','bat','slime','lion','skeleton'])assert.equal(sprites[key].length,64);
});
test('garden estate is fixed and present from spawn; locked entrance never blocks triggering guardian combat',()=>{
 const r=new Run({seed:'ESTATE-25'}),d=r.dungeon,estate=D.landmark(d);assert.ok(estate.locked);assert.equal(D.objectAt(d,estate.x,estate.y).type,'mansionDoor');
 const dir=D.dirs.findIndex(v=>D.canTraverse(d,estate.x-v.x,estate.y-v.y,estate.x,estate.y));assert.ok(dir>=0);
 const v=D.dirs[dir];d.x=estate.x-v.x;d.y=estate.y-v.y;d.dir=dir;delete d.objects[D.key(d.x,d.y)];
 assert.deepEqual(D.landmark(d),estate);assert.ok(r.walk('forward').ok);assert.equal(r.phase,'battle');
 assert.ok(M.formation(r.battle.enemies).some(e=>e.enemy.finalBoss&&e.depth===3));
 const restored=Run.restore(r.snapshot());assert.deepEqual(D.landmark(restored.dungeon),estate);
 r.completed.push(d.exit.roomId);D.refreshExit(d,r.completed);const opened=D.landmark(d);assert.equal(opened.locked,false);assert.equal(opened.worldX,estate.worldX);assert.equal(opened.worldY,estate.worldY);assert.equal(d.dir,estate.dir);
});
test('held damage layout retains rear boss throughout the last-minion death animation',()=>{
 const r=new Run({exploration:false}),bossNode=r.maps[0].find(n=>n.type==='boss');r.stage=bossNode.stage-1;r.enter(bossNode.id);const b=r.battle;
 const before=M.formation(b.enemies),positions=new Map(before.map(p=>[p.enemy.id,{column:p.column,depth:p.depth,reserves:p.reserves}])),boss=b.enemies.find(e=>e.finalBoss);
 const front=before.find(p=>p.depth===0).enemy;front.health=0;
 const held=M.hold(b.enemies,positions,new Set([front.id]));assert.ok(held.some(p=>p.enemy===boss&&p.depth===3));assert.ok(held.some(p=>p.enemy===front&&p.fallen));
});
