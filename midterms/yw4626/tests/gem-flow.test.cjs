'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../dist/run.js'),{gems}=require('../dist/engine.js');
const {PlayerEnvironment}=require('../agents/environment.cjs'),{createScriptedPlayer}=require('../agents/scripted.cjs');
test('gem preview is detached and equals modifiers after actual insertion; chest consumed once',()=>{
  const r=new Run({seed:'GEM-FLOW-DEV'}),[key,obj]=Object.entries(r.dungeon.objects).find(([,o])=>o.type==='gemchest');
  [r.dungeon.x,r.dungeon.y]=key.split(',').map(Number);r.interact();
  const gem=obj.offers.find(g=>r.deck.some(c=>gems.canInsert(c,g).ok)),card=r.deck.find(c=>gems.canInsert(c,gem).ok);
  const before=JSON.stringify(card),preview=gems.insertionPreview(card,gem);assert.equal(JSON.stringify(card),before);
  r.chooseGem(gem);const selected=r.snapshot();assert.equal(r.chooseGem(gem).changed,false);assert.deepEqual(r.snapshot(),selected);
  const originalPreview=structuredClone(preview);preview.after.cost=999;assert.equal(JSON.stringify(card),before);
  assert.ok(r.socketGem(card.id).ok);assert.deepEqual(gems.modifiers(card),originalPreview.after);assert.equal(obj.active,false);assert.equal(r.socketGem(card.id).ok,false);assert.equal(gems.installed(card).length,originalPreview.usedAfter);
});
test('player API gem stage excludes selected no-op and exposes actual compatible targets',()=>{
  const e=new PlayerEnvironment({goalFloor:6,decisionLimit:6000,stepLimit:15000}),p=createScriptedPlayer();e.reset('AGENT-DEV-A');let found=false;
  while(!e.outcome().terminal){const o=e.observe('player'),actions=e.legal_actions('player');
    if(o.phase==='gem'){
      assert.equal(o.gems.stage,'choose_gem');const g=o.gems.offers.find(g=>g.compatibleCardCount>0);assert.ok(g);
      e.step('player',{id:'gem:'+g.key,revision:o.revision});const selected=e.observe('player'),legal=e.legal_actions('player');
      assert.equal(selected.gems.stage,'choose_card');assert.ok(!legal.some(a=>a.id==='gem:'+g.key));assert.ok(legal.some(a=>a.type==='gem'));assert.ok(selected.gems.compatibleCards.length);
      const a=legal.find(a=>a.type==='socket'),preview=selected.gems.compatibleCards.find(c=>c.cardId===a.arg);assert.deepEqual(a.preview,preview);
      const result=e.step('player',{id:a.id,revision:selected.revision});assert.ok(result.ok);assert.notEqual(result.observation.phase,'gem');assert.ok(result.observation.deck.find(c=>c.id===a.arg).gems.includes(g.key));found=true;break;
    }
    assert.ok(e.step('player',{id:p.choose({observation:o,legalActions:actions,history:[]}),revision:o.revision}).ok);
  }assert.ok(found,'development route must reach a gem chest');
});
