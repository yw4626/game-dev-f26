const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const data = require('../dist/evolution-v10.js');

test('nineteen recipes retain resolvable groups and exact source asset identities', () => {
  assert.equal(data.recipes.length, 19);
  assert.equal(new Set(data.recipes.map(r => r.id)).size, 19);
  assert.deepEqual(data.recipes.filter(r => r.materialCount === 3).map(r => r.id).sort(), ['infiniteCorridor', 'phieraggi']);
  for (const r of data.recipes) {
    assert.equal(data.cards[r.resultKey].assetId, r.resultAssetId);
    assert.equal(r.componentGroups.length, r.materialCount);
    r.componentGroups.forEach((group, i) => {
      assert.ok(r.componentKeys[i].length > 0, `${r.id}: missing ${group}`);
      assert.deepEqual(r.componentKeys[i].map(k => data.cards[k].assetId), r.requiredAssetGroups[i]);
      for (const k of r.componentKeys[i]) assert.equal(data.cards[k].group, group);
    });
  }
});

test('unused recipes stay disabled and King Bible uses shipped Spellbinder group', () => {
  assert.deepEqual(data.recipes.filter(r => r.sourceDisabled).map(r => r.id).sort(), ['fuwalafuwaloo', 'infiniteCorridor']);
  const bible = data.recipes.find(r => r.id === 'unholyVespers');
  assert.ok(bible.componentGroups.includes('CardGroup_Spellbinder'));
  assert.ok(bible.componentKeys.flat().includes('spellbinder'));
  assert.equal(data.cards.spellbinder.duration, 2);
  assert.equal(data.cards.spellbinder.cost, 0);
});

test('source identity, runtime cost and effective pierce cannot be guessed from asset names', () => {
  assert.equal(data.cards.wand.assetId, 'Card_A_1_MagicWand');
  assert.equal(data.cards.wand.cost, 0);
  assert.equal(data.cards.soulEater.assetId, 'Card_A_1_SoulEater');
  assert.equal(data.cards.soulEater.cost, 3);
  assert.equal(data.cards.wings.rawConfiguredMana, 4);
  assert.equal(data.cards.wings.cost, 0);
  assert.equal(data.cards.wings.costType, 'wild');
  assert.equal(data.attackPatterns.noFuture.levels[0].configuredPierce, 3);
  assert.equal(data.attackPatterns.noFuture.levels[0].effectivePierce, 1);
  assert.equal(data.attackPatterns.bloodyTear.levels[0].effectivePierce, 5);
});

test('non-damage hooks, disabled critical effects and support lifetimes are preserved', () => {
  assert.ok(data.cards.gorgeousMoon.originalEffects.onDiscardEffect.some(e => e.type === 'ModifyCardCostEffect'));
  assert.ok(data.cards.gorgeousMoon.originalEffects.onDrawEffect.some(e => e.type === 'ResetCardCostEffect'));
  assert.deepEqual(data.cards.soulEater.effectDescriptors.map(e => e.sourceType), ['DamageEffect', 'HealEffect', 'RemoveIntentEffect']);
  assert.equal(data.cards.noFuture.canCrit, false);
  assert.ok(data.cards.noFuture.criticalEffects.some(e => e.type === 'HealEffect'));
  assert.equal(data.statLifecycles.Area.resetAfterEncounter, true);
  assert.equal(data.statLifecycles.Recovery.resetAfterEncounter, true);
  assert.equal(data.statLifecycles.Luck.resetAfterEncounter, false);
  assert.equal(data.statLifecycles.Duration.resetAfterEncounter, false);
});

test('each card preserves slot restrictions and source provenance hashes', () => {
  for (const [key, card] of Object.entries(data.cards)) {
    const slots = data.cardSlots[key];
    assert.equal(slots.id, card.assetId);
    assert.deepEqual(slots, data.cardSlots[card.assetId]);
    assert.ok(Array.isArray(slots.allowedGemTags));
    assert.match(card.artifactSource.object_sha256, /^[a-f0-9]{64}$/);
  }
  for (const source of data.sources) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    assert.equal(typeof source.path, 'string');
  }

});
