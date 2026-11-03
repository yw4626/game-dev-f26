'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),D=require('../dist/dungeon.js');
function shop(seed='SHOP14'){
 const r=new Run({seed});const [key,n]=Object.entries(r.dungeon.rooms).find(([,n])=>n.type==='shop');
 [r.dungeon.x,r.dungeon.y]=key.split(',').map(Number);D.reveal(r.dungeon);assert.ok(r.interact().ok);assert.equal(r.phase,'shop');return r;
}
test('new shops are random seeded assortments, not fixed W slots; reload keeps the draw',()=>{
 const sets=new Set(),last=new Set();for(let i=0;i<30;i++){const a=shop('SHOP-'+i),b=shop('SHOP-'+i);assert.deepEqual(a.shop,b.shop);assert.equal(a.shop.offers.length,3);assert.equal(new Set(a.shop.offers.map(o=>o.key)).size,3);sets.add(a.shop.offers.map(o=>o.key).join(','));last.add(a.shop.offers.at(-1).key);assert.deepEqual(Run.restore(a.snapshot()).shop,a.shop);}
 assert.ok(sets.size>20);assert.ok(last.size>5);
});
test('refresh costs 25,50,100,150,200,250 and preserves service use',()=>{
 const r=shop();r.gold=10000;r.shop.healed=true;r.shop.removed=true;
 for(const price of [25,50,100,150,200,250]){assert.equal(r.shopRefreshCost(),price);const before=r.gold,keys=r.shop.offers.map(o=>o.key).sort();r.shop.offers.forEach(o=>o.sold=true);assert.ok(r.refreshShop().ok);assert.equal(r.gold,before-price);assert.notDeepEqual(r.shop.offers.map(o=>o.key).sort(),keys);assert.ok(r.shop.offers.every(o=>!o.sold));assert.equal(r.shop.healed,true);assert.equal(r.shop.removed,true);}
 assert.equal(r.shopRefreshCost(),300);
});
test('insufficient coins and wrong phase reject refresh atomically',()=>{
 const r=shop();r.gold=24;let before=r.snapshot();assert.equal(r.refreshShop().ok,false);assert.deepEqual(r.snapshot(),before);r.gold=500;r.phase='map';before=r.snapshot();assert.equal(r.refreshShop().ok,false);assert.deepEqual(r.snapshot(),before);
});
test('purchase, leave, revisit and restore retain merchant count, stock and service state',()=>{
 let r=shop();r.gold=1000;r.refreshShop();r.buy(r.shop.offers[0].id);r.shop.healed=true;const stock=structuredClone(r.shop),gold=r.gold;
 r.leave();r=Run.restore(r.snapshot());assert.ok(r.interact().ok);assert.deepEqual(r.shop,stock);assert.equal(r.gold,gold);assert.equal(r.shopRefreshCost(),50);assert.equal(r.buy(r.shop.offers[0].id).ok,false);
 const copy=Run.restore(r.snapshot());assert.ok(copy.refreshShop().ok);assert.ok(r.refreshShop().ok);assert.deepEqual(copy.shop,r.shop);
});
test('each merchant starts an independent refresh count',()=>{
 const r=shop();r.gold=1000;r.refreshShop();r.refreshShop();assert.equal(r.shopRefreshCost(),100);const other=r.makeShop(r.maps[1].find(n=>n.type==='shop'));assert.equal(other.refreshCount,0);assert.notDeepEqual(other.offers,r.shop.offers);
});
test('migration preserves bought stock and services, enables paid redraw without resetting it again',()=>{
 let r=new Run({shopRulesVersion:12});const [key,n]=Object.entries(r.dungeon.rooms).find(([,n])=>n.type==='shop');[r.dungeon.x,r.dungeon.y]=key.split(',').map(Number);D.reveal(r.dungeon);r.interact();r.gold=1000;r.buy(0);r.shop.healed=true;const offers=structuredClone(r.shop.offers),gold=r.gold;
 r=Run.restore(r.snapshot());assert.ok(r.enableShopV14());assert.deepEqual(r.shop.offers,offers);assert.equal(r.gold,gold);assert.equal(r.shop.healed,true);assert.equal(r.shopRefreshCost(),25);r.refreshShop();assert.equal(r.enableShopV14(),false);assert.equal(r.shopRefreshCost(),50);assert.deepEqual(Run.restore(r.snapshot()).shop,r.shop);
});
test('restore rejects invalid refresh counts and prices that could credit gold',()=>{
 const r=shop();for(const count of [-1,1.5,Number.MAX_SAFE_INTEGER]){const s=r.snapshot();s.data.shop.refreshCount=count;assert.throws(()=>Run.restore(s),/商店/);}const s=r.snapshot();s.data.shop.offers[0].price=-25;assert.throws(()=>Run.restore(s),/商店/);
});
