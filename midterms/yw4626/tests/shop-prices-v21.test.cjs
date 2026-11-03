'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{Run}=require('../dist/run'),{catalog}=require('../dist/engine');
test('all W prices follow destruction behavior; ordinary card prices and refresh fees stay intact',()=>{
 const r=new Run();for(const d of Object.values(catalog.cards).filter(d=>d.costType==='wild'))assert.equal(r.shopCardPrice(d.key),d.destroyOnPlay?10:100,d.key);
 assert.equal(r.shopCardPrice('whip'),35);assert.equal(r.shopCardPrice('whip',1),55);const seen=new Set();for(let n=0;n<100;n++)for(const offer of r.rollShopOffers('price-check',n)){assert.equal(offer.price,r.shopCardPrice(offer.key));seen.add(offer.key);}
 assert.ok(seen.has('combo')&&seen.has('rawMana'));r.shop={refreshCount:0};assert.equal(r.shopRefreshCost(),25);r.shop.refreshCount=2;assert.equal(r.shopRefreshCost(),100);
});
test('buy charges displayed 10/100 exactly once and insufficient funds do not change state',()=>{
 for(const key of ['combo','wildDefence','bracelet','wings','cloverPetal','rawMana']){const r=new Run(),price=r.shopCardPrice(key);r.phase='shop';r.shop={offers:[{id:0,key,level:0,price,sold:false}],refreshCount:0};r.gold=price-1;const before=r.snapshot();assert.equal(r.buy(0).ok,false);assert.deepEqual(r.snapshot(),before);r.gold=price;const n=r.deck.length;assert.equal(r.buy(0).ok,true);assert.equal(r.gold,0);assert.equal(r.deck.length,n+1);assert.equal(r.buy(0).ok,false);}
});
test('old active and cached stocks reprice only unsold W cards, without rerolling or refunding',()=>{
 const r=new Run({shopPriceVersion:0}),make=()=>({refreshCount:3,healed:true,offers:[{id:1,key:'combo',price:15,sold:false},{id:2,key:'rawMana',price:15,sold:false},{id:3,key:'bracelet',price:15,sold:true},{id:4,key:'whip',price:35,sold:false}]});r.shop=make();r.dungeon.shops={cached:make()};const gold=r.gold,deck=JSON.stringify(r.deck);
 assert.equal(r.enableShopPricesV21(),true);for(const shop of [r.shop,r.dungeon.shops.cached]){assert.deepEqual(shop.offers.map(o=>o.price),[100,10,15,35]);assert.equal(shop.refreshCount,3);assert.equal(shop.healed,true);assert.equal(shop.offers[2].sold,true);}assert.equal(r.gold,gold);assert.equal(JSON.stringify(r.deck),deck);assert.equal(r.enableShopPricesV21(),false);
});
