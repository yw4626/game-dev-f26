'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const G=require('../dist/gem-shapes.js'),catalog=require('../dist/gem-catalog.js');
test('every catalog gem has an identifiable, accessible pixel silhouette',()=>{
 const keys=Object.keys(catalog.gems).filter(k=>k!=='evolve');
 assert.equal(new Set(keys.map(k=>G.entries[k]?.rows.join(''))).size,keys.length);
 for(const key of keys){const svg=G.icon(key);assert.match(svg,/role="img"/);assert.ok(svg.includes(catalog.gems[key].name));assert.match(svg,/shape-rendering="crispEdges"/);assert.ok(G.entries[key].rows.every(row=>row.length===16));}
 assert.match(G.icon('draw',{label:'<img onerror="boom">'}),/&lt;img onerror=&quot;boom&quot;&gt;/);
});
test('legacy evolution markers render separately without consuming visual slots',()=>{
 const html=G.strip({gems:['armor','evolve'],gemSlots:2});
 assert.match(html,/宝石 1\/2/);assert.equal((html.match(/gem-chip empty/g)||[]).length,1);
 assert.match(html,/evolution-badge/);assert.doesNotMatch(html,/data-gem="evolve"/);
 const en=G.strip({gems:['draw'],gemSlots:1,evolutionRecipe:'hellfire'},{en:true});assert.match(en,/EVOLVED/);assert.match(en,/Gems 1\/1/);assert.doesNotMatch(en,/gem-chip empty/);
});
