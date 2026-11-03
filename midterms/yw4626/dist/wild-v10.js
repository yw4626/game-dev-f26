/* Data-only generated catalog; see WILD_ACQUISITION_V10_NATIVE.md. */
(function(root){const data={
  "version": 10,
  "cards": {
    "bagOfCoins": {
      "key": "bagOfCoins",
      "assetId": "Card_E_BagOfCoins",
      "name": "大钱袋",
      "english": "Bag of Coins",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_coinAmount": 25,
          "type": "CoinEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "globalgamemanagers.assets:7772",
      "artifactSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7772",
        "object_sha256": "0dea310c78f6944f17b7fe530a245d5decf0419a3d6e9779611bc04e27fa349a",
        "name": "Card_E_BagOfCoins",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "coins",
          "amount": 25
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.DefaultUnlockType, Pancake",
        "$id": 0,
        "_unlocked": true
      },
      "defaultUnlocked": true,
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "coins": 25,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "largeBagOfCoins": {
      "key": "largeBagOfCoins",
      "assetId": "Card_E_LargeBagOfCoins",
      "name": "富豪钱袋",
      "english": "Large Bag of Coins",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_coinAmount": 50,
          "type": "CoinEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "globalgamemanagers.assets:7773",
      "artifactSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7773",
        "object_sha256": "0fd1a36a300b81c586f454aa81e351430753385eddb774106dd0697de421653c",
        "name": "Card_E_LargeBagOfCoins",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "coins",
          "amount": 50
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "7768"
          }
        }
      },
      "unlockMetric": {
        "metric": "CardGroup_BagOfCoins_Played",
        "value": 30.0,
        "source": {
          "file": "globalgamemanagers.assets",
          "path_id": "7768",
          "object_sha256": "cbcf5ac3c6bef2af0936416869ce83531f99bf272cfd8a0c7798ee644db0be8b"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "coins": 50,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "cloverPetal": {
      "key": "cloverPetal",
      "assetId": "Card_E_CloverPetal",
      "name": "四叶草花瓣",
      "english": "Clover Petal",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_luckAmount": 5,
          "type": "LuckEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "drawCount": 1,
          "type": "DrawEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31718",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31718",
        "object_sha256": "a4d201e893fc93ef79fe009a43f2d7ca80a69194115dee99abff67ea4e41ee0f",
        "name": "Card_E_CloverPetal",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "luck",
          "amount": 5
        },
        {
          "type": "drawCount",
          "amount": 1
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31574"
          }
        }
      },
      "unlockMetric": {
        "metric": "CardGroup_LittleClover_Played",
        "value": 5.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31574",
          "object_sha256": "bc8cb8302955f086bacb1a676ce1b5b4435a7e44ddad518c786e3fe25097e7d9"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "luck": 5,
      "drawCount": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "coinPurse": {
      "key": "coinPurse",
      "assetId": "Card_E_CoinPurse",
      "name": "钱包",
      "english": "Coin Purse",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_coinAmount": 10,
          "type": "CoinEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "drawCount": 1,
          "type": "DrawEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31719",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31719",
        "object_sha256": "e6680e9a208b225263ced59e4b4356b17c293707d2316fa05adff4dba834ff11",
        "name": "Card_E_CoinPurse",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "coins",
          "amount": 10
        },
        {
          "type": "drawCount",
          "amount": 1
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31575"
          }
        }
      },
      "unlockMetric": {
        "metric": "CardGroup_BagOfCoins_Played",
        "value": 5.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31575",
          "object_sha256": "f55c2af5f32c43f1a3e8dbf3bce2c53284bac480e93654ab0cb5a90d1bf9a605"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "coins": 10,
      "drawCount": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "littleClover": {
      "key": "littleClover",
      "assetId": "Card_E_LittleClover",
      "name": "三叶草",
      "english": "Little Clover",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_luckAmount": 10,
          "type": "LuckEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31720",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31720",
        "object_sha256": "262feb18e4aa034595bc2fa686e3e828b6fc5c15ffbb021063f2872eac5f2a3c",
        "name": "Card_E_LittleClover",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "luck",
          "amount": 10
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.DefaultUnlockType, Pancake",
        "$id": 0,
        "_unlocked": true
      },
      "defaultUnlocked": true,
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "luck": 10,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "littleHeart": {
      "key": "littleHeart",
      "assetId": "Card_E_LittleHeart",
      "name": "小红心",
      "english": "Little Heart",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 0,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_healAmount": 1,
          "type": "HealEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31721",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31721",
        "object_sha256": "27e4e338454531290d8b388c11e26c60ec72d94885053e719c8adc275cbde989",
        "name": "Card_E_LittleHeart",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "heal",
          "amount": 1
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.DefaultUnlockType, Pancake",
        "$id": 0,
        "_unlocked": true
      },
      "defaultUnlocked": true,
      "acquisition": {
        "kind": "generated_by_effect",
        "effect": "CelestialDustingDamageBehaviour.OnEnemyDied",
        "baseChancePercent": 5,
        "luckChanceScaling": 0.10000000149011612,
        "addAsTemporaryCard": true
      },
      "heal": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "orologion": {
      "key": "orologion",
      "assetId": "Card_E_Orologion",
      "name": "时祷怀表",
      "english": "Orologion",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_upgradeConfig": [
            {
              "name": "Level 0",
              "baseAmount": 1,
              "baseArea": 0.0,
              "damagePerHit": 0,
              "knockback": 0,
              "pierce": 1,
              "freezeStacks": 1,
              "type": "DamageEffect+DamageLevelConfig"
            }
          ],
          "_hideDamageIndicators": false,
          "_ignoreAmount": true,
          "_damageScalesWithAmount": false,
          "_ignoreArea": true,
          "_ignoreMight": false,
          "_canKnockback": false,
          "_freezeStacksScaleWithCombo": false,
          "_ignoreCombo": false,
          "_amountScalesWithCombo": true,
          "_damageScalesWithCombo": false,
          "_areaSizeCoefficient": 0.5,
          "_amountSpeedCoefficient": 0.10000000149011612,
          "_canCrit": false,
          "_critMultiplier": 0.0,
          "_critChance": 0.0,
          "_critEffectType": 0,
          "_criticalEffects": [],
          "_prefabHandlesWeaponSpawning": false,
          "_weaponPrefab": {
            "pointer": {
              "m_FileID": 0,
              "m_PathID": "40811"
            }
          },
          "_minMaxFireDelay": {
            "type": "Vector2"
          },
          "_alignWithTarget": false,
          "_randomSpawnOffsetMax": {
            "type": "Vector3"
          },
          "_directionAccountsForOffset": false,
          "_weaponDirection": {
            "type": "DefaultDirection"
          },
          "_weaponTargeting": {
            "_pierceType": 0,
            "_weaponTargetingBehaviour": null,
            "_weaponDamageBehaviour": null,
            "Priority": 0,
            "_oneProjectilePerTarget": false,
            "type": "FrontRowTargeting"
          },
          "_damageExecutedBehaviours": [],
          "_upgradesPerLimitBreak": {
            "amountToAdd": 0,
            "areaToAdd": 0.0,
            "damageToAdd": 0,
            "knockbackToAdd": 0,
            "pierceToAdd": 0,
            "freezeStacksToAdd": 0,
            "type": "DamageEffect+LimitBreakConfig"
          },
          "_spawnLimitType": 0,
          "_modifyAudioPitch": false,
          "_randomPitch": false,
          "_randomRange": {
            "type": "Vector2"
          },
          "_pitchOffset": 0.10000000149011612,
          "_maxNumberBeforePitchReset": 3,
          "type": "DamageEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": "FREEZE",
          "type": "NullEffect"
        }
      ],
      "source": "sharedassets0.assets:31722",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31722",
        "object_sha256": "0be904b7b1b8f89a4c1fc3ad35ce15cb91da34fa5ef109df9b8aeebc0d81cfcc",
        "name": "Card_E_Orologion",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "damage",
          "damagePerHit": 0,
          "baseAmount": 1,
          "freezeStacks": 1,
          "targetingClass": "FrontRowTargeting"
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31584"
          }
        }
      },
      "unlockMetric": {
        "metric": "PickupCards_Played",
        "value": 30.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31584",
          "object_sha256": "f5eadaf72795f1ea06f2c580de0762458ba097d809ec99c003db3df141ddf4ea"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "baseDamage": 0,
      "baseAmount": 1,
      "originalPierce": 1,
      "freezeStacks": 1,
      "baseArea": 0.0,
      "targetingClass": "FrontRowTargeting",
      "amountScalesWithCombo": true,
      "damageScalesWithCombo": false,
      "freezeStacksScaleWithCombo": false,
      "ignoreAmount": true,
      "ignoreMight": false,
      "ignoreCombo": false,
      "damageScalesWithAmount": false,
      "freezeExecution": {
        "target": "current front row, all columns",
        "passes": "baseAmount * effectiveComboMultiplier; ignores player Amount",
        "stacksPerHit": 1,
        "independentResistanceRollPerStack": true,
        "allowStacking": true,
        "clearedAtEnemyTurnEnd": true,
        "frozenDamageMultiplier": 2,
        "notMultiTurnSkip": true
      },
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "rosary": {
      "key": "rosary",
      "assetId": "Card_E_Rosary",
      "name": "玫瑰念珠",
      "english": "Rosary",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": "KILL",
          "_levelConfig": [
            {
              "name": "Level 0",
              "baseAmount": 1,
              "eraseItemThreshold": 1.0,
              "type": "KillEffect+KillEffectLevelConfig"
            }
          ],
          "_ignoreAmount": true,
          "_effectPrefab": {
            "pointer": {
              "m_FileID": 0,
              "m_PathID": "40816"
            }
          },
          "_minMaxFireDelay": {
            "type": "Vector2"
          },
          "_randomSpawnOffsetMax": {
            "type": "Vector3"
          },
          "_targetingType": 0,
          "_areaSizeCoefficient": 0.0,
          "_amountSpeedCoefficient": 0.0,
          "_modifyAudioPitch": false,
          "_randomPitch": false,
          "_randomRange": {
            "type": "Vector2"
          },
          "_pitchOffset": 0.10000000149011612,
          "_maxNumberBeforePitchReset": 3,
          "type": "KillEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31723",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31723",
        "object_sha256": "9ebaa997871710a8413c79529326ed9d1de2f25898e548d1ed81b158ec3d4988",
        "name": "Card_E_Rosary",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "kill",
          "count": 1,
          "targetingType": 0,
          "eraseItemThreshold": 1.0,
          "selection": "first N existing row-depths at cast time",
          "damage": "armor + min(currentHealth,(1-InstakillResist)*maxHealth)",
          "ignoreAmount": true
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31586"
          }
        }
      },
      "unlockMetric": {
        "metric": "PickupCards_Played",
        "value": 20.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31586",
          "object_sha256": "6408e2ab87ff1d2514bc1daeec25fb56fc3d423d1fc10785da738bee568d6e1a"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "killCount": 1,
      "killTargetingType": 0,
      "eraseItemThreshold": 1.0,
      "killIgnoreAmount": true,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "vacuum": {
      "key": "vacuum",
      "assetId": "Card_E_Vacuum",
      "name": "聚星宝珠",
      "english": "Vacuum",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "drawCount": 1,
          "type": "DrawEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31724",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31724",
        "object_sha256": "7d7e54a4ffc34375702c2022db73b7a4b2d2961f771f9e7d5c154316ae9214a7",
        "name": "Card_E_Vacuum",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "drawCount",
          "amount": 1
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31589"
          }
        }
      },
      "unlockMetric": {
        "metric": "LightSource_Destroyed",
        "value": 30.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31589",
          "object_sha256": "bd2db312aadc6c3ca3d5d14225d6fc1c64fa4292a188a05d50c5549386b9da5a"
        }
      },
      "acquisition": {
        "kind": "shared_map_pickup_pool"
      },
      "drawCount": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "rawMana": {
      "key": "rawMana",
      "assetId": "Card_B_0_RawMana",
      "name": "原始法力",
      "english": "Raw Mana",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": false,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 0,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_gainAmount": 3,
          "_isKaromasMana": false,
          "_karomasScalar": 0,
          "type": "GainManaEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:31750",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31750",
        "object_sha256": "e2dcde427e1f4e185c4a4d1189ef246f85c5ce67859eb464182d0925f5a24934",
        "name": "Card_M_0_RawMana",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "manaGain",
          "amount": 3
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Mana",
      "color": {
        "r": 0.4431372880935669,
        "g": 0.04313725605607033,
        "b": 0.40000003576278687,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.929411768913269,
        "g": 0.125490203499794,
        "b": 0.5647059082984924,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7788",
        "object_sha256": "37ad925bd943cacfb4c4bb04a2b8a7bfaeeaa5947548bf7f38a5c00b032e986e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31613"
          }
        }
      },
      "unlockMetric": {
        "metric": "PickupMana",
        "value": 2.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31613",
          "object_sha256": "67f0f7aa9d5924c9e3e21824c8be74810f140aff637dcf13e368c96768caabdc"
        }
      },
      "acquisition": {
        "kind": "generated_by_effect",
        "effects": [
          {
            "card": "Card_M_4_SongOfMana",
            "numberToAdd": 1
          },
          {
            "card": "Card_M_5_Mannajja",
            "numberToAdd": 2
          }
        ],
        "addAsTemporaryCard": true
      },
      "manaGain": 3,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "bracelet": {
      "key": "bracelet",
      "assetId": "Card_W_Bracelet",
      "name": "魔环",
      "english": "Bracelet",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": true,
      "isPickup": false,
      "addToRewardPool": true,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 3,
      "destroyOnPlay": false,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_upgradeConfig": [
            {
              "name": "Level 0",
              "baseAmount": 5,
              "baseArea": 0.0,
              "damagePerHit": 20,
              "knockback": 0,
              "pierce": 1,
              "freezeStacks": 0,
              "type": "DamageEffect+DamageLevelConfig"
            }
          ],
          "_hideDamageIndicators": false,
          "_ignoreAmount": false,
          "_damageScalesWithAmount": false,
          "_ignoreArea": false,
          "_ignoreMight": false,
          "_canKnockback": false,
          "_freezeStacksScaleWithCombo": false,
          "_ignoreCombo": false,
          "_amountScalesWithCombo": true,
          "_damageScalesWithCombo": false,
          "_areaSizeCoefficient": 0.5,
          "_amountSpeedCoefficient": 0.10000000149011612,
          "_canCrit": false,
          "_critMultiplier": 0.0,
          "_critChance": 0.0,
          "_critEffectType": 0,
          "_criticalEffects": null,
          "_prefabHandlesWeaponSpawning": false,
          "_weaponPrefab": {
            "pointer": {
              "m_FileID": 0,
              "m_PathID": "34591"
            }
          },
          "_minMaxFireDelay": {
            "type": "Vector2"
          },
          "_alignWithTarget": false,
          "_randomSpawnOffsetMax": {
            "type": "Vector3"
          },
          "_directionAccountsForOffset": true,
          "_weaponDirection": {
            "type": "AlternateLeftRightDirection"
          },
          "_weaponTargeting": {
            "_pierceType": 0,
            "_weaponTargetingBehaviour": null,
            "_weaponDamageBehaviour": null,
            "Priority": 0,
            "type": "RandomTargeting"
          },
          "_damageExecutedBehaviours": [],
          "_upgradesPerLimitBreak": {
            "amountToAdd": 0,
            "areaToAdd": 0.0,
            "damageToAdd": 0,
            "knockbackToAdd": 0,
            "pierceToAdd": 0,
            "freezeStacksToAdd": 0,
            "type": "DamageEffect+LimitBreakConfig"
          },
          "_spawnLimitType": 1,
          "_modifyAudioPitch": false,
          "_randomPitch": false,
          "_randomRange": {
            "type": "Vector2"
          },
          "_pitchOffset": 0.0,
          "_maxNumberBeforePitchReset": 0,
          "type": "DamageEffect"
        }
      ],
      "source": "sharedassets0.assets:31785",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31785",
        "object_sha256": "86a46cd1b131d9db51155038bfb045ad0dfd631f9899e56e88c56573a40c56d6",
        "name": "Card_W_Bracelet",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "damage",
          "damagePerHit": 20,
          "baseAmount": 5,
          "freezeStacks": 0,
          "targetingClass": "RandomTargeting"
        }
      ],
      "cardType": "Attack",
      "color": {
        "r": 0.5137255191802979,
        "g": 0.04313725605607033,
        "b": 0.027450982481241226,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.5137255191802979,
        "g": 0.04313725605607033,
        "b": 0.027450982481241226,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7785",
        "object_sha256": "26c764048311eee1304a4d056a35e6b1caeff2ff4bc45c02b05255e8783afae2"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31623"
          }
        }
      },
      "unlockMetric": {
        "metric": "MaxCombo",
        "value": 15.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31623",
          "object_sha256": "781d3013b81a99db1bc4a9557eebf5ed93c53ed94f67f354ae45418a8cd9739e"
        }
      },
      "acquisition": {
        "kind": "normal_reward_pool"
      },
      "baseDamage": 20,
      "baseAmount": 5,
      "originalPierce": 1,
      "freezeStacks": 0,
      "baseArea": 0.0,
      "targetingClass": "RandomTargeting",
      "amountScalesWithCombo": true,
      "damageScalesWithCombo": false,
      "freezeStacksScaleWithCombo": false,
      "ignoreAmount": false,
      "ignoreMight": false,
      "ignoreCombo": false,
      "damageScalesWithAmount": false,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "combo": {
      "key": "combo",
      "assetId": "Card_W_Combo",
      "name": "友情护符",
      "english": "Friendship Amulet",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": true,
      "isPickup": false,
      "addToRewardPool": true,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 3,
      "destroyOnPlay": false,
      "originalEffects": [
        {
          "_hideCardDescription": true,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": "NotSet",
          "type": "ComboEffect"
        }
      ],
      "source": "sharedassets0.assets:31786",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31786",
        "object_sha256": "97e5fae5ff202ad4d13644d2ab674fbc0ad4b9f666ab01763f4307559a6ea71d",
        "name": "Card_W_Combo",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "combo",
          "additionalCombo": 1,
          "condition": "CardGemsModel.CanReturnToHand",
          "otherwise": "only normal Wild chain progression"
        }
      ],
      "cardType": "Special",
      "color": {
        "r": 0.9882352948188782,
        "g": 0.7781473994255066,
        "b": 0.1607842892408371,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.988235354423523,
        "g": 0.7764706611633301,
        "b": 0.16078431904315948,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7789",
        "object_sha256": "c940402a640530fb149dd22c82b318971534a22818f95a8726b19798dc72c0eb"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31624"
          }
        }
      },
      "unlockMetric": {
        "metric": "MaxCombo",
        "value": 7.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31624",
          "object_sha256": "51744f93e3975245e0a263a22701e749e85bfc251bbf9ce84ff1fbd05bd9e031"
        }
      },
      "acquisition": {
        "kind": "normal_reward_pool"
      },
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "wildDefence": {
      "key": "wildDefence",
      "assetId": "Card_W_WildDefence",
      "name": "帕尔姆神盾",
      "english": "Parma Aegis",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": true,
      "isPickup": false,
      "addToRewardPool": true,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 3,
      "destroyOnPlay": false,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_armorAmount": 1,
          "type": "ArmorEffect"
        }
      ],
      "source": "sharedassets0.assets:31787",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31787",
        "object_sha256": "7315c3aff8f0c4db6ba6a889cc921517d6f14a1dda9a4a7b71eb718979e33692",
        "name": "Card_W_WildDefence",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "armor",
          "amount": 1
        }
      ],
      "cardType": "Defense",
      "color": {
        "r": 0.2688679099082947,
        "g": 0.7150733470916748,
        "b": 1.0,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.44811320304870605,
        "g": 0.7833993434906006,
        "b": 1.0,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7787",
        "object_sha256": "9b90ef2eea3acb0cb9978c969ba457436b99f3205b9cbf240163d753835d05a4"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31625"
          }
        }
      },
      "unlockMetric": {
        "metric": "MaxCombo",
        "value": 12.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31625",
          "object_sha256": "09ab3a11f6aca3e6f9e1809925547b7ba7b3fe0dcd40672dd9e6e1253ca6310d"
        }
      },
      "acquisition": {
        "kind": "normal_reward_pool"
      },
      "armor": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "wings": {
      "key": "wings",
      "assetId": "Card_M_0_Wings",
      "name": "翅膀",
      "english": "Wings",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": true,
      "isPickup": false,
      "addToRewardPool": true,
      "allowInTreasureChest": true,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 3,
      "destroyOnPlay": false,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_reduceAmount": 1,
          "_ignoreSelf": false,
          "_capCosts": false,
          "_capAmount": 0,
          "type": "WingsEffect"
        }
      ],
      "source": "sharedassets0.assets:31788",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "31788",
        "object_sha256": "95499ff70abaeb96308a5974f2b96153959e3950c235ad1fe27e285131f51166",
        "name": "Card_W_Wings",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "wings",
          "reduceAmount": 1,
          "scalesWithCombo": false,
          "appliesTo": "current hand",
          "stacking": "once per card while hasWingsEffect",
          "duration": "next play or end turn",
          "floorAtZero": false
        }
      ],
      "cardType": "Mana",
      "color": {
        "r": 0.4431372880935669,
        "g": 0.04313725605607033,
        "b": 0.40000003576278687,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.929411768913269,
        "g": 0.125490203499794,
        "b": 0.5647059082984924,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7788",
        "object_sha256": "37ad925bd943cacfb4c4bb04a2b8a7bfaeeaa5947548bf7f38a5c00b032e986e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.AchievementUnlockType, Pancake",
        "$id": 0,
        "_achievementForUnlock": {
          "$unity_ref_index": 0,
          "pointer": {
            "m_FileID": 0,
            "m_PathID": "31626"
          }
        }
      },
      "unlockMetric": {
        "metric": "PlayerLevel",
        "value": 40.0,
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31626",
          "object_sha256": "c052de3189728ed1cda18ab407d478e9c13043edf98fd84ecd13fadd66bb9e3b"
        }
      },
      "acquisition": {
        "kind": "normal_reward_pool",
        "additionalSource": "DestructibleCardCM single-entry Wings pool in CappellaMagna bundle"
      },
      "reduceCost": 1,
      "ignoreSelf": false,
      "capCosts": false,
      "capAmount": 0,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    },
    "coinCard": {
      "key": "coinCard",
      "assetId": "Card_E_CoinCard",
      "name": "金币",
      "english": "Coin",
      "kind": "wild",
      "cost": 0,
      "costType": "wild",
      "retain": false,
      "maxLevel": 0,
      "receivesComboMultiplier": false,
      "isPickup": true,
      "addToRewardPool": false,
      "allowInTreasureChest": false,
      "rewardWeight": 1.0,
      "gemSlots": 0,
      "maxGemSlots": 1,
      "destroyOnPlay": true,
      "originalEffects": [
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "_coinAmount": 1,
          "type": "CoinEffect"
        },
        {
          "_hideCardDescription": false,
          "_keywordDisplaySetting": 0,
          "_overrideKeywordID": null,
          "type": "DestroyEffect"
        }
      ],
      "source": "sharedassets0.assets:32904",
      "artifactSource": {
        "file": "sharedassets0.assets",
        "path_id": "32904",
        "object_sha256": "86ef18540547bdbdc472f5bc1bf3e8adeb773a2b31d8d4a22bfb0261fa7dd259",
        "name": "Card_E_CoinCard",
        "class": "CardConfig"
      },
      "effects": [
        {
          "type": "coins",
          "amount": 1
        },
        {
          "type": "destroy"
        }
      ],
      "cardType": "Void",
      "color": {
        "r": 0.0,
        "g": 0.22745099663734436,
        "b": 0.5764706134796143,
        "a": 1.0
      },
      "cardBackgroundColor": {
        "r": 0.8867924213409424,
        "g": 0.8867924213409424,
        "b": 0.8867924213409424,
        "a": 1.0
      },
      "cardTypeSource": {
        "file": "globalgamemanagers.assets",
        "path_id": "7790",
        "object_sha256": "a42a14a24ab31a5764ce851291b044447851cb4b3cd91b46e9bc57add18dec3e"
      },
      "unlock": {
        "$type": "Nosebleed.Pancake.GameConfig.DefaultUnlockType, Pancake",
        "$id": 0,
        "_unlocked": true
      },
      "defaultUnlocked": true,
      "acquisition": {
        "kind": "generated_by_effect",
        "character": "FCC_BigTroubler",
        "effects": [
          "DiscardAndAddCardEffect",
          "OnDiscardTypeTrigger -> CreateCardEffect"
        ],
        "addAsTemporaryCard": false
      },
      "coins": 1,
      "evidenceStatus": "effects/configuration confirmed; implementation support must be selected by engine",
      "pendingNativeDetails": [],
      "nativeSimpleEffectsReady": true
    }
  },
  "cardSlots": {
    "bagOfCoins": {
      "id": "Card_E_BagOfCoins",
      "source": {
        "file": "globalgamemanagers.assets",
        "path_id": "7772",
        "object_sha256": "0dea310c78f6944f17b7fe530a245d5decf0419a3d6e9779611bc04e27fa349a"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_BagOfCoins": {
      "id": "Card_E_BagOfCoins",
      "source": {
        "file": "globalgamemanagers.assets",
        "path_id": "7772",
        "object_sha256": "0dea310c78f6944f17b7fe530a245d5decf0419a3d6e9779611bc04e27fa349a"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "largeBagOfCoins": {
      "id": "Card_E_LargeBagOfCoins",
      "source": {
        "file": "globalgamemanagers.assets",
        "path_id": "7773",
        "object_sha256": "0fd1a36a300b81c586f454aa81e351430753385eddb774106dd0697de421653c"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_LargeBagOfCoins": {
      "id": "Card_E_LargeBagOfCoins",
      "source": {
        "file": "globalgamemanagers.assets",
        "path_id": "7773",
        "object_sha256": "0fd1a36a300b81c586f454aa81e351430753385eddb774106dd0697de421653c"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "cloverPetal": {
      "id": "Card_E_CloverPetal",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31718",
        "object_sha256": "a4d201e893fc93ef79fe009a43f2d7ca80a69194115dee99abff67ea4e41ee0f"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_CloverPetal": {
      "id": "Card_E_CloverPetal",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31718",
        "object_sha256": "a4d201e893fc93ef79fe009a43f2d7ca80a69194115dee99abff67ea4e41ee0f"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "coinPurse": {
      "id": "Card_E_CoinPurse",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31719",
        "object_sha256": "e6680e9a208b225263ced59e4b4356b17c293707d2316fa05adff4dba834ff11"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_CoinPurse": {
      "id": "Card_E_CoinPurse",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31719",
        "object_sha256": "e6680e9a208b225263ced59e4b4356b17c293707d2316fa05adff4dba834ff11"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "littleClover": {
      "id": "Card_E_LittleClover",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31720",
        "object_sha256": "262feb18e4aa034595bc2fa686e3e828b6fc5c15ffbb021063f2872eac5f2a3c"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_LittleClover": {
      "id": "Card_E_LittleClover",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31720",
        "object_sha256": "262feb18e4aa034595bc2fa686e3e828b6fc5c15ffbb021063f2872eac5f2a3c"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "littleHeart": {
      "id": "Card_E_LittleHeart",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31721",
        "object_sha256": "27e4e338454531290d8b388c11e26c60ec72d94885053e719c8adc275cbde989"
      },
      "slots": 0,
      "maxSlots": 0,
      "baseSlotCost": 0,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_OnKill",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_DamageMult",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_LittleHeart": {
      "id": "Card_E_LittleHeart",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31721",
        "object_sha256": "27e4e338454531290d8b388c11e26c60ec72d94885053e719c8adc275cbde989"
      },
      "slots": 0,
      "maxSlots": 0,
      "baseSlotCost": 0,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_OnKill",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_DamageMult",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "orologion": {
      "id": "Card_E_Orologion",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31722",
        "object_sha256": "0be904b7b1b8f89a4c1fc3ad35ce15cb91da34fa5ef109df9b8aeebc0d81cfcc"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 5000,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_Orologion": {
      "id": "Card_E_Orologion",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31722",
        "object_sha256": "0be904b7b1b8f89a4c1fc3ad35ce15cb91da34fa5ef109df9b8aeebc0d81cfcc"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 5000,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "rosary": {
      "id": "Card_E_Rosary",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31723",
        "object_sha256": "9ebaa997871710a8413c79529326ed9d1de2f25898e548d1ed81b158ec3d4988"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 5000,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_OnKill",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_Rosary": {
      "id": "Card_E_Rosary",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31723",
        "object_sha256": "9ebaa997871710a8413c79529326ed9d1de2f25898e548d1ed81b158ec3d4988"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 5000,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_OnKill",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "vacuum": {
      "id": "Card_E_Vacuum",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31724",
        "object_sha256": "7d7e54a4ffc34375702c2022db73b7a4b2d2961f771f9e7d5c154316ae9214a7"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_Vacuum": {
      "id": "Card_E_Vacuum",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31724",
        "object_sha256": "7d7e54a4ffc34375702c2022db73b7a4b2d2961f771f9e7d5c154316ae9214a7"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "rawMana": {
      "id": "Card_B_0_RawMana",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31750",
        "object_sha256": "e2dcde427e1f4e185c4a4d1189ef246f85c5ce67859eb464182d0925f5a24934"
      },
      "slots": 0,
      "maxSlots": 0,
      "baseSlotCost": 0,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Damage",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Adaptability",
        "GemTag_Afterlife",
        "GemTag_Arcane",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_ComboBreak",
        "GemTag_CountDown",
        "GemTag_Destroy",
        "GemTag_Discharge",
        "GemTag_Drain",
        "GemTag_Draw",
        "GemTag_FreeCost",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_ManaDecrease",
        "GemTag_ManaIncrease",
        "GemTag_Mild",
        "GemTag_Mug",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Refresh",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Reverse",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility",
        "GemTag_WildCost",
        "GemTag_XCost"
      ]
    },
    "Card_B_0_RawMana": {
      "id": "Card_B_0_RawMana",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31750",
        "object_sha256": "e2dcde427e1f4e185c4a4d1189ef246f85c5ce67859eb464182d0925f5a24934"
      },
      "slots": 0,
      "maxSlots": 0,
      "baseSlotCost": 0,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Damage",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Adaptability",
        "GemTag_Afterlife",
        "GemTag_Arcane",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_ComboBreak",
        "GemTag_CountDown",
        "GemTag_Destroy",
        "GemTag_Discharge",
        "GemTag_Drain",
        "GemTag_Draw",
        "GemTag_FreeCost",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_ManaDecrease",
        "GemTag_ManaIncrease",
        "GemTag_Mild",
        "GemTag_Mug",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Refresh",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Reverse",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility",
        "GemTag_WildCost",
        "GemTag_XCost"
      ]
    },
    "bracelet": {
      "id": "Card_W_Bracelet",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31785",
        "object_sha256": "86a46cd1b131d9db51155038bfb045ad0dfd631f9899e56e88c56573a40c56d6"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_ComboBreak"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_DamageMult",
        "GemTag_Destroy",
        "GemTag_Discharge",
        "GemTag_Drain",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Mug",
        "GemTag_OnKill",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Scavenge",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_W_Bracelet": {
      "id": "Card_W_Bracelet",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31785",
        "object_sha256": "86a46cd1b131d9db51155038bfb045ad0dfd631f9899e56e88c56573a40c56d6"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_ComboBreak"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_DamageMult",
        "GemTag_Destroy",
        "GemTag_Discharge",
        "GemTag_Drain",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Mug",
        "GemTag_OnKill",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Scavenge",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "combo": {
      "id": "Card_W_Combo",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31786",
        "object_sha256": "97e5fae5ff202ad4d13644d2ab674fbc0ad4b9f666ab01763f4307559a6ea71d"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 6500,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_W_Combo": {
      "id": "Card_W_Combo",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31786",
        "object_sha256": "97e5fae5ff202ad4d13644d2ab674fbc0ad4b9f666ab01763f4307559a6ea71d"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 6500,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "wildDefence": {
      "id": "Card_W_WildDefence",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31787",
        "object_sha256": "7315c3aff8f0c4db6ba6a889cc921517d6f14a1dda9a4a7b71eb718979e33692"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_CostChange",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_W_WildDefence": {
      "id": "Card_W_WildDefence",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31787",
        "object_sha256": "7315c3aff8f0c4db6ba6a889cc921517d6f14a1dda9a4a7b71eb718979e33692"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_CostChange",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "wings": {
      "id": "Card_M_0_Wings",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31788",
        "object_sha256": "95499ff70abaeb96308a5974f2b96153959e3950c235ad1fe27e285131f51166"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_M_0_Wings": {
      "id": "Card_M_0_Wings",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "31788",
        "object_sha256": "95499ff70abaeb96308a5974f2b96153959e3950c235ad1fe27e285131f51166"
      },
      "slots": 0,
      "maxSlots": 3,
      "baseSlotCost": 8000,
      "receivesComboMultiplier": true,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_Preserve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_OnKill",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_CostChange",
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Destroy",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "coinCard": {
      "id": "Card_E_CoinCard",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "32904",
        "object_sha256": "86ef18540547bdbdc472f5bc1bf3e8adeb773a2b31d8d4a22bfb0261fa7dd259"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    },
    "Card_E_CoinCard": {
      "id": "Card_E_CoinCard",
      "source": {
        "file": "sharedassets0.assets",
        "path_id": "32904",
        "object_sha256": "86ef18540547bdbdc472f5bc1bf3e8adeb773a2b31d8d4a22bfb0261fa7dd259"
      },
      "slots": 0,
      "maxSlots": 1,
      "baseSlotCost": 2500,
      "receivesComboMultiplier": false,
      "excludedGemTags": [
        "GemTag_Evolve",
        "GemTag_DamageMult",
        "GemTag_ComboBreak",
        "GemTag_Destroy",
        "GemTag_Discharge"
      ],
      "excludedGemTagGroups": [
        "GemTagGroup_Mana",
        "GemTagGroup_Onkill",
        "GemTagGroup_CostChange",
        "GemTagGroup_NonDamageEffect"
      ],
      "allowedGemTags": [
        "GemTag_Afterlife",
        "GemTag_Armor",
        "GemTag_Coin",
        "GemTag_Combo",
        "GemTag_Damage",
        "GemTag_Draw",
        "GemTag_Heal",
        "GemTag_Mana",
        "GemTag_OnKill",
        "GemTag_Preserve",
        "GemTag_Reroll",
        "GemTag_Retain",
        "GemTag_Return",
        "GemTag_Sprightly",
        "GemTag_Stat",
        "GemTag_Swift",
        "GemTag_Switch",
        "GemTag_TypeArmor",
        "GemTag_TypeAttack",
        "GemTag_TypeMana",
        "GemTag_TypeSpecial",
        "GemTag_Utility"
      ]
    }
  },
  "gems": {
    "cardSlots": {
      "bagOfCoins": {
        "id": "Card_E_BagOfCoins",
        "source": {
          "file": "globalgamemanagers.assets",
          "path_id": "7772",
          "object_sha256": "0dea310c78f6944f17b7fe530a245d5decf0419a3d6e9779611bc04e27fa349a"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_BagOfCoins": {
        "id": "Card_E_BagOfCoins",
        "source": {
          "file": "globalgamemanagers.assets",
          "path_id": "7772",
          "object_sha256": "0dea310c78f6944f17b7fe530a245d5decf0419a3d6e9779611bc04e27fa349a"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "largeBagOfCoins": {
        "id": "Card_E_LargeBagOfCoins",
        "source": {
          "file": "globalgamemanagers.assets",
          "path_id": "7773",
          "object_sha256": "0fd1a36a300b81c586f454aa81e351430753385eddb774106dd0697de421653c"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_LargeBagOfCoins": {
        "id": "Card_E_LargeBagOfCoins",
        "source": {
          "file": "globalgamemanagers.assets",
          "path_id": "7773",
          "object_sha256": "0fd1a36a300b81c586f454aa81e351430753385eddb774106dd0697de421653c"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "cloverPetal": {
        "id": "Card_E_CloverPetal",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31718",
          "object_sha256": "a4d201e893fc93ef79fe009a43f2d7ca80a69194115dee99abff67ea4e41ee0f"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_CloverPetal": {
        "id": "Card_E_CloverPetal",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31718",
          "object_sha256": "a4d201e893fc93ef79fe009a43f2d7ca80a69194115dee99abff67ea4e41ee0f"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "coinPurse": {
        "id": "Card_E_CoinPurse",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31719",
          "object_sha256": "e6680e9a208b225263ced59e4b4356b17c293707d2316fa05adff4dba834ff11"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_CoinPurse": {
        "id": "Card_E_CoinPurse",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31719",
          "object_sha256": "e6680e9a208b225263ced59e4b4356b17c293707d2316fa05adff4dba834ff11"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "littleClover": {
        "id": "Card_E_LittleClover",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31720",
          "object_sha256": "262feb18e4aa034595bc2fa686e3e828b6fc5c15ffbb021063f2872eac5f2a3c"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_LittleClover": {
        "id": "Card_E_LittleClover",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31720",
          "object_sha256": "262feb18e4aa034595bc2fa686e3e828b6fc5c15ffbb021063f2872eac5f2a3c"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "littleHeart": {
        "id": "Card_E_LittleHeart",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31721",
          "object_sha256": "27e4e338454531290d8b388c11e26c60ec72d94885053e719c8adc275cbde989"
        },
        "slots": 0,
        "maxSlots": 0,
        "baseSlotCost": 0,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_OnKill",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_DamageMult",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_LittleHeart": {
        "id": "Card_E_LittleHeart",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31721",
          "object_sha256": "27e4e338454531290d8b388c11e26c60ec72d94885053e719c8adc275cbde989"
        },
        "slots": 0,
        "maxSlots": 0,
        "baseSlotCost": 0,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_OnKill",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_DamageMult",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "orologion": {
        "id": "Card_E_Orologion",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31722",
          "object_sha256": "0be904b7b1b8f89a4c1fc3ad35ce15cb91da34fa5ef109df9b8aeebc0d81cfcc"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 5000,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_Orologion": {
        "id": "Card_E_Orologion",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31722",
          "object_sha256": "0be904b7b1b8f89a4c1fc3ad35ce15cb91da34fa5ef109df9b8aeebc0d81cfcc"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 5000,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "rosary": {
        "id": "Card_E_Rosary",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31723",
          "object_sha256": "9ebaa997871710a8413c79529326ed9d1de2f25898e548d1ed81b158ec3d4988"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 5000,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_OnKill",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_Rosary": {
        "id": "Card_E_Rosary",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31723",
          "object_sha256": "9ebaa997871710a8413c79529326ed9d1de2f25898e548d1ed81b158ec3d4988"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 5000,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_OnKill",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "vacuum": {
        "id": "Card_E_Vacuum",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31724",
          "object_sha256": "7d7e54a4ffc34375702c2022db73b7a4b2d2961f771f9e7d5c154316ae9214a7"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_Vacuum": {
        "id": "Card_E_Vacuum",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31724",
          "object_sha256": "7d7e54a4ffc34375702c2022db73b7a4b2d2961f771f9e7d5c154316ae9214a7"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "rawMana": {
        "id": "Card_B_0_RawMana",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31750",
          "object_sha256": "e2dcde427e1f4e185c4a4d1189ef246f85c5ce67859eb464182d0925f5a24934"
        },
        "slots": 0,
        "maxSlots": 0,
        "baseSlotCost": 0,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Damage",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Adaptability",
          "GemTag_Afterlife",
          "GemTag_Arcane",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_ComboBreak",
          "GemTag_CountDown",
          "GemTag_Destroy",
          "GemTag_Discharge",
          "GemTag_Drain",
          "GemTag_Draw",
          "GemTag_FreeCost",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_ManaDecrease",
          "GemTag_ManaIncrease",
          "GemTag_Mild",
          "GemTag_Mug",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Refresh",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Reverse",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility",
          "GemTag_WildCost",
          "GemTag_XCost"
        ]
      },
      "Card_B_0_RawMana": {
        "id": "Card_B_0_RawMana",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31750",
          "object_sha256": "e2dcde427e1f4e185c4a4d1189ef246f85c5ce67859eb464182d0925f5a24934"
        },
        "slots": 0,
        "maxSlots": 0,
        "baseSlotCost": 0,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Damage",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Adaptability",
          "GemTag_Afterlife",
          "GemTag_Arcane",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_ComboBreak",
          "GemTag_CountDown",
          "GemTag_Destroy",
          "GemTag_Discharge",
          "GemTag_Drain",
          "GemTag_Draw",
          "GemTag_FreeCost",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_ManaDecrease",
          "GemTag_ManaIncrease",
          "GemTag_Mild",
          "GemTag_Mug",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Refresh",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Reverse",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility",
          "GemTag_WildCost",
          "GemTag_XCost"
        ]
      },
      "bracelet": {
        "id": "Card_W_Bracelet",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31785",
          "object_sha256": "86a46cd1b131d9db51155038bfb045ad0dfd631f9899e56e88c56573a40c56d6"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_ComboBreak"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_DamageMult",
          "GemTag_Destroy",
          "GemTag_Discharge",
          "GemTag_Drain",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Mug",
          "GemTag_OnKill",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Scavenge",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_W_Bracelet": {
        "id": "Card_W_Bracelet",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31785",
          "object_sha256": "86a46cd1b131d9db51155038bfb045ad0dfd631f9899e56e88c56573a40c56d6"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_ComboBreak"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_DamageMult",
          "GemTag_Destroy",
          "GemTag_Discharge",
          "GemTag_Drain",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Mug",
          "GemTag_OnKill",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Scavenge",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "combo": {
        "id": "Card_W_Combo",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31786",
          "object_sha256": "97e5fae5ff202ad4d13644d2ab674fbc0ad4b9f666ab01763f4307559a6ea71d"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 6500,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_W_Combo": {
        "id": "Card_W_Combo",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31786",
          "object_sha256": "97e5fae5ff202ad4d13644d2ab674fbc0ad4b9f666ab01763f4307559a6ea71d"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 6500,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "wildDefence": {
        "id": "Card_W_WildDefence",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31787",
          "object_sha256": "7315c3aff8f0c4db6ba6a889cc921517d6f14a1dda9a4a7b71eb718979e33692"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_CostChange",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_W_WildDefence": {
        "id": "Card_W_WildDefence",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31787",
          "object_sha256": "7315c3aff8f0c4db6ba6a889cc921517d6f14a1dda9a4a7b71eb718979e33692"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_CostChange",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "wings": {
        "id": "Card_M_0_Wings",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31788",
          "object_sha256": "95499ff70abaeb96308a5974f2b96153959e3950c235ad1fe27e285131f51166"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_M_0_Wings": {
        "id": "Card_M_0_Wings",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "31788",
          "object_sha256": "95499ff70abaeb96308a5974f2b96153959e3950c235ad1fe27e285131f51166"
        },
        "slots": 0,
        "maxSlots": 3,
        "baseSlotCost": 8000,
        "receivesComboMultiplier": true,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_Preserve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_OnKill",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_CostChange",
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Destroy",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "coinCard": {
        "id": "Card_E_CoinCard",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "32904",
          "object_sha256": "86ef18540547bdbdc472f5bc1bf3e8adeb773a2b31d8d4a22bfb0261fa7dd259"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      },
      "Card_E_CoinCard": {
        "id": "Card_E_CoinCard",
        "source": {
          "file": "sharedassets0.assets",
          "path_id": "32904",
          "object_sha256": "86ef18540547bdbdc472f5bc1bf3e8adeb773a2b31d8d4a22bfb0261fa7dd259"
        },
        "slots": 0,
        "maxSlots": 1,
        "baseSlotCost": 2500,
        "receivesComboMultiplier": false,
        "excludedGemTags": [
          "GemTag_Evolve",
          "GemTag_DamageMult",
          "GemTag_ComboBreak",
          "GemTag_Destroy",
          "GemTag_Discharge"
        ],
        "excludedGemTagGroups": [
          "GemTagGroup_Mana",
          "GemTagGroup_Onkill",
          "GemTagGroup_CostChange",
          "GemTagGroup_NonDamageEffect"
        ],
        "allowedGemTags": [
          "GemTag_Afterlife",
          "GemTag_Armor",
          "GemTag_Coin",
          "GemTag_Combo",
          "GemTag_Damage",
          "GemTag_Draw",
          "GemTag_Heal",
          "GemTag_Mana",
          "GemTag_OnKill",
          "GemTag_Preserve",
          "GemTag_Reroll",
          "GemTag_Retain",
          "GemTag_Return",
          "GemTag_Sprightly",
          "GemTag_Stat",
          "GemTag_Swift",
          "GemTag_Switch",
          "GemTag_TypeArmor",
          "GemTag_TypeAttack",
          "GemTag_TypeMana",
          "GemTag_TypeSpecial",
          "GemTag_Utility"
        ]
      }
    }
  },
  "pickupPools": [
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "8132846202666271012",
        "object_sha256": "2cae1c8b95a882b306bc519084961427d7a82d2e4c4b1dc5297dacdba4a537d1",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardCM",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_M_0_Wings",
          "key": "wings",
          "weight": 3.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "8075282369987787112",
        "object_sha256": "f59ab64ee2c210956e6cea40894b23f8dddc2a4dd2c73da26cb179799c4c5259",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardDP",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_S_1_Attractorb",
          "key": null,
          "weight": 3.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-332c4a73dc8f618aba8e9b80d98036e0",
        "path_id": "-2899258205450872762",
        "object_sha256": "8fe4930a3fac1bcbdd1ad36b2b4618dcefc5e584e13899d4ab043e56652c4fec",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardGB",
      "fallbackAssetId": "Card_S_0_SkullOManic",
      "entries": [
        {
          "assetId": "Card_S_0_SkullOManic",
          "key": null,
          "weight": 1.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": true
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "-5285255603819188418",
        "object_sha256": "474ef592d6fdd8deb8f37d60b42cf80c7da394e9de46f9320d0812aa50af9f8d",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardGT",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_S_0_SkullOManic",
          "key": null,
          "weight": 2.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-0aa011d674db5337958e96c786bcc613",
        "path_id": "-6123313507552156276",
        "object_sha256": "7164d0811fa07594551b07eaf219ad06fc489625128104c35771c7d6c82e68d9",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardIL",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_S_1_StoneMask",
          "key": null,
          "weight": 2.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": true
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-33802e299ebbe4753d06066d444f3dcf",
        "path_id": "-4037841580694311530",
        "object_sha256": "17b311e2dda34a1d269e45f23dc570e8dc849efd11bce02e7833585ed68ae5ed",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardMF",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_D_1_Armor",
          "key": null,
          "weight": 1.0,
          "editorChance": 100.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "-5288815257257124740",
        "object_sha256": "995cfc92fc66d225203788c4294a5b0784db579ce2477210f95d5377ce421c70",
        "name": "",
        "class": "DestructibleCardRT"
      },
      "gameObject": "DestructibleCardRT",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_E_BagOfCoins",
          "key": "bagOfCoins",
          "weight": 10.0,
          "editorChance": 29.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CoinPurse",
          "key": "coinPurse",
          "weight": 5.0,
          "editorChance": 14.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LargeBagOfCoins",
          "key": "largeBagOfCoins",
          "weight": 5.0,
          "editorChance": 14.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CloverPetal",
          "key": "cloverPetal",
          "weight": 5.0,
          "editorChance": 14.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LittleClover",
          "key": "littleClover",
          "weight": 5.0,
          "editorChance": 14.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Orologion",
          "key": "orologion",
          "weight": 1.0,
          "editorChance": 3.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Rosary",
          "key": "rosary",
          "weight": 1.0,
          "editorChance": 3.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Vacuum",
          "key": "vacuum",
          "weight": 3.0,
          "editorChance": 9.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "5333057170035836396",
        "object_sha256": "31af329c187573487bec731caf62b77baef29411850398ac78a2ce236594326c",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCardCanvas",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_E_BagOfCoins",
          "key": "bagOfCoins",
          "weight": 10.0,
          "editorChance": 13.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CoinPurse",
          "key": "coinPurse",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LargeBagOfCoins",
          "key": "largeBagOfCoins",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CloverPetal",
          "key": "cloverPetal",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LittleClover",
          "key": "littleClover",
          "weight": 30.0,
          "editorChance": 40.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Orologion",
          "key": "orologion",
          "weight": 10.0,
          "editorChance": 13.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Rosary",
          "key": "rosary",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Vacuum",
          "key": "vacuum",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "8915561030030067441",
        "object_sha256": "11d7d76218b67b7b2ec6015a1eb3aad7e7dcd740ccb51287faa036b6c1c4ad3a",
        "name": "",
        "class": "DestructibleCardCanvas"
      },
      "gameObject": "DestructibleCard",
      "fallbackAssetId": "Card_E_BagOfCoins",
      "entries": [
        {
          "assetId": "Card_E_BagOfCoins",
          "key": "bagOfCoins",
          "weight": 10.0,
          "editorChance": 13.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CoinPurse",
          "key": "coinPurse",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LargeBagOfCoins",
          "key": "largeBagOfCoins",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_CloverPetal",
          "key": "cloverPetal",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_LittleClover",
          "key": "littleClover",
          "weight": 30.0,
          "editorChance": 40.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Orologion",
          "key": "orologion",
          "weight": 10.0,
          "editorChance": 13.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Rosary",
          "key": "rosary",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        },
        {
          "assetId": "Card_E_Vacuum",
          "key": "vacuum",
          "weight": 5.0,
          "editorChance": 7.0,
          "ignoreUnlockCriteria": false
        }
      ],
      "nativeSelection": "filter IgnoreUnlockCriteria OR HasMetUnlockCriteria; weighted roll using Weighting, not serialized rounded Chance"
    }
  ],
  "breakableDropTables": [
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "-3933355851962160536",
        "object_sha256": "14a9b03779e971cb07d71fd4b79356c3d97f3ec127f52b86c4074d91c569985f",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "-2981521129629752863",
        "object_sha256": "d75616ca20f1dfc4a75efdb40f54049885f080111afbd4c08333d488b54de3f2",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "-2179256688368899442",
        "object_sha256": "0509d04c4ce70f13fc7b4834cdb4ba6cf4f9d566de334bf22cb6381af7e800f0",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "CappellaMagna_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "320970351171636749"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "-2055365466031973386",
        "object_sha256": "0bdacd4be209901f0ff97287e63bf50e8b676f075a10813dccd315cda92b0bf1",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "CappellaMagna_WingBalcony_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "320970351171636749"
          },
          "Weight": 1
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "2014088501407759695",
        "object_sha256": "15a11cd2d37cf171214b36b823d46debda2267277856ba184b3821fb659dec11",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "CappellaMagna_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "320970351171636749"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "2828699429612099543",
        "object_sha256": "2b93544d5a439a1f6d4d2e1dc6f46c978fcda0b3b84a23296575cb6f8e33fbe0",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "CappellaMagna_WingBalcony_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "320970351171636749"
          },
          "Weight": 1
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "6594399537334772193",
        "object_sha256": "a31cd1b3972f22c7fb13a962f52f2bd25304e928059795239ea6fbe659d9f949",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle (1)",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7791492ad40e0d871b7c491170f218b8",
        "path_id": "6632052097219522753",
        "object_sha256": "f68d3d800ef302556deb6611a9e47f40920f21b96016d6a89adfd636294cde72",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-8904025572100185187",
        "object_sha256": "e5781b82b1ad77278b6aba0d3a7b46f51fc4ec9a317355b573f073957d26c81a",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-8498162570281896615",
        "object_sha256": "68f210880f60c74a5b334bb4a1b0572bed25603b5abc1ade860d17dadfa6e777",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-8487151323730198059",
        "object_sha256": "31400fed3ca413ad1e4a8ef9839dad40b6defa6cea9d6c170ac709d1ed87303d",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-8147275479983903931",
        "object_sha256": "7fbeaaa2dfddb64ef6e607037be6c662477cae13f59ca4e57c2cd5cbdc650c74",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DairyPlant_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6800435518693148583"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-6303371837238062773",
        "object_sha256": "595b7de3465f88bb8343c6293826e030fdef0b1a49ac62be51c187d9e4966ad6",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-1672559847566715625",
        "object_sha256": "3738eef3d1a9a0c3cd3c6de70e0d7dbb4a25ffcab7275689cd1a5dababc76c19",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "-913970500666121192",
        "object_sha256": "2be63ce97490d0dae35749f229fba570a35fb58abd4f8dcd864e9bf9ccce97b8",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "461244587459211730",
        "object_sha256": "32479d929ef032b49c812c932a4bf73c8850b34f1edb9a332f7aa7efc09fb3df",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "571467833449365433",
        "object_sha256": "c8c51705b3ead943a68b6adf3eb8d8451b919a9143cb010ff9937103a16a4b21",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "1503766548358941152",
        "object_sha256": "102ecb388dfbbc329ad936107cc14593ce67e661c140f2a22b53ee3f8c3fee6c",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "2289550612775551473",
        "object_sha256": "0f5d3eecf3724a049e088c71b75fbe81cac80cf179c5982a16b2daf55e39869e",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "7280949516357161795",
        "object_sha256": "af5d87af5a032ccb4712787e54fa83ffc4376fb5fac7762bf894055f1ab1c3c6",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "7727290186140678417",
        "object_sha256": "0514296e81dff94630fe00de1bec0987d0278d589f06f71c455bf0267e74087d",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-a647f123a343bd7c73cf2b799973e72e",
        "path_id": "9070531957348431420",
        "object_sha256": "eaf50eccc9b4a016725c622da3d7a71371c1ee8a49b6ad7f87dd2173dc8836d2",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-332c4a73dc8f618aba8e9b80d98036e0",
        "path_id": "-8576927361618785055",
        "object_sha256": "0a39fe4b6ee7e842e31f45ff6453ff515e27e9d98ddf75abd5688b01d9bbe590",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "GalloBelow_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-6713675562897480886"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "-4163901353778673837",
        "object_sha256": "32af82ad57799280a4d859ae61e903e821f1ed8f9834279a989b91b9fd365c67",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "GalloTower_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "521875290917021438"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "-2686140850657740018",
        "object_sha256": "a3e4c267b615379429720a35795cdc35ec519f55190626b1e1c543b1715f88ed",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle (1)",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "3875220400525710125",
        "object_sha256": "1df6d9a7976c32cf7138fb042c0de753fa4417c4b64d6d051c1c98faa11e3b96",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "5049317416236846932",
        "object_sha256": "f55bbec124c67893cf2acd82bd6dbb0c8427fecf66075bac75fbb7bf113dcd45",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle (1)",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "7682029339829238444",
        "object_sha256": "4cd712dedd6f7c1cf45183777836df23b409635b67b18ef0889ee635b55593c7",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle (1)",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "8173874274613261893",
        "object_sha256": "dd71d9ecce9eadf50a192d7fcf114749109227707c7dd553f1054466aff8de74",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "GalloTower_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "521875290917021438"
          },
          "Weight": 20
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 35
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        }
      ]
    },
    {
      "source": {
        "file": "CAB-7a1f55d5ec0ddaa1bc71bb64290f39f4",
        "path_id": "9190958742196578625",
        "object_sha256": "a01d16149f055e12acc1447350584c1cf2b07a507c70c7487de195f0f8df2caa",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-0aa011d674db5337958e96c786bcc613",
        "path_id": "1506651977810980842",
        "object_sha256": "21854b449a0ce34e0e081e32ecfc6b1e56a20ea6729c3554119db614c88379c4",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "InlaidLibrary_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-613896153659444966"
          },
          "Weight": 25
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 5
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 40
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 30
        }
      ]
    },
    {
      "source": {
        "file": "CAB-33802e299ebbe4753d06066d444f3dcf",
        "path_id": "-8834976617141857113",
        "object_sha256": "7674067b236735fa8790a82c35ddfe1930832b3e1fce7c7f1d11ebb7de441f2c",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "MadForest_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "9026866951900483856"
          },
          "Weight": 2
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-7249096933662050997"
          },
          "Weight": 3
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-704454880763210655"
          },
          "Weight": 4
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "6146177746634773648"
          },
          "Weight": 1
        }
      ]
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "4708247377192846721",
        "object_sha256": "871361f647f597d2bcff411f4ccc3efad798a886a9f568167e574d952885dda9",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "5617279368407838442",
        "object_sha256": "bd105ac9a4806da21c8edef9618529eee19e4a9fda45030d9fe59ee03457a57e",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "Cart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-50381310253321398"
          },
          "Weight": 1
        }
      ]
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "7877511508468777794",
        "object_sha256": "d746d1a02b3c2f2bcadfde3aec6ea172bbd7f34b1e48050b87c570a3e2053719",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "Cart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "1745506321199709344"
          },
          "Weight": 1
        }
      ]
    },
    {
      "source": {
        "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
        "path_id": "9049435317214508973",
        "object_sha256": "a206bff66125e68d5f5e206fd24f6a514a37fcec90975248e6a3b85b96f46225",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleRailCart",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-da80d2b5fea2f3c3f452b42760695d37",
        "path_id": "-3324106747493124891",
        "object_sha256": "8ec1cbc2c0235b3ab43479782621e84d75e4f0d49ffaa0a35c4e58cb1a2a1391",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "Soda_GemDispenser_Bumpable",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-650954749343012497"
          },
          "Weight": 100
        }
      ]
    },
    {
      "source": {
        "file": "CAB-5e7bf79c17f801e64284b27a99c8794e",
        "path_id": "3395154881092736854",
        "object_sha256": "298d681517f92d2460c4bf4b4c7aa48ef423e86681e00b89ad585a99ab844a9e",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle (3)",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-3100734877701191758"
          },
          "Weight": 100
        }
      ]
    },
    {
      "source": {
        "file": "CAB-5e7bf79c17f801e64284b27a99c8794e",
        "path_id": "6927900114749904726",
        "object_sha256": "72b369b87f4597fd551b1dcdaa16f0048810ab357cf15b3ef4414a23399789bf",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "8433757290419265382"
          },
          "Weight": 60
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 30
        },
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-4831866392748610388"
          },
          "Weight": 10
        }
      ]
    },
    {
      "source": {
        "file": "CAB-5e7bf79c17f801e64284b27a99c8794e",
        "path_id": "8843177448667240278",
        "object_sha256": "1063af73f987bdde5db8cc364d3f74fac1fa43eb8e2df2ff161bdcefc8bfae32",
        "name": "",
        "class": "SpawnDestructibleOnDestroy"
      },
      "gameObject": "DestructibleGargoyle",
      "choices": [
        {
          "Destructible": {
            "m_FileID": 0,
            "m_PathID": "-313020340016462665"
          },
          "Weight": 100
        }
      ]
    }
  ],
  "wildStrength": {
    "appliesIf": "Player.IsArcanaEquipped(WildStrength) && cardConfig.isPickup",
    "forcesReceivesComboMultiplier": true,
    "originalDefault": false,
    "source": {
      "file": "sharedassets0.assets",
      "path_id": "31642",
      "object_sha256": "e1c72c3e56073405f08a2149adfb816f054bf74953a3fe3753246a9c8a9061ee",
      "name": "ArcanaConfig_WildStrength",
      "class": "ArcanaConfig"
    },
    "defaultPrototypeSetting": null,
    "effect": "For pickup cards, forces card-level combo gate true; Luck and Draw then use combo multiplication."
  },
  "statResetAfterEncounter": {
    "Health": false,
    "Armor": true,
    "Might": true,
    "Amount": true,
    "Area": true,
    "Growth": false,
    "Greed": false,
    "Luck": false,
    "Recovery": true,
    "Mana": true,
    "DealCount": true,
    "Magnet": true,
    "Duration": false,
    "RevivalCharge": false,
    "RevivalStacks": false,
    "CardSkips": false,
    "Rerolls": false,
    "Banishes": false,
    "Curse": false,
    "Charm": false,
    "Risk": false,
    "Scavenge": true
  },
  "rules": {
    "payment": 0,
    "bridgesNextCard": true,
    "drawFormula": "baseDrawCount * effectiveComboMultiplier + floor(Magnet), then hand/pile limits",
    "destroyScope": "remove instance from current run deck, not only current battle",
    "coinFormula": "ceil(baseCoins * effectiveComboMultiplier * (1 + Greed / 100))"
  },
  "sources": [
    {
      "path": "evidence/wild-acquisition-v10-native/configs.json",
      "sha256": "b0d503bbb6ef7380540d7221727621e943541dcf360bb8238fcf25c0f64dc664"
    }
  ],
  "verifiedSpecialContainer": {
    "file": "CAB-ae4847204a3df06b8f66d553f79948c5",
    "path_id": "4708247377192846721",
    "name": "DestructibleGargoyle",
    "choices": [
      {
        "drop": "DropConfig_Coin",
        "path_id": "8433757290419265382",
        "weight": 60
      },
      {
        "drop": "DropConfig_Card",
        "path_id": "-313020340016462665",
        "weight": 30
      },
      {
        "drop": "DropConfig_Reroll",
        "path_id": "-4831866392748610388",
        "weight": 10
      }
    ],
    "nativeSampler": "unlock filter, RandomInt(0,total+1), choose roll<=cumulative (zero endpoint gives first item extra outcome)",
    "warning": "Reroll is not Chicken; normal barrel/light-source tables differ."
  },
  "enemyResistances": {
    "EnemyConfig_Drowner": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "globalgamemanagers.assets:7821"
    },
    "EnemyConfig_RedDeath": {
      "instakill": 1.0,
      "freeze": 0,
      "source": "globalgamemanagers.assets:7822"
    },
    "EnemyConfig_Trickster": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "globalgamemanagers.assets:7823"
    },
    "EnemyConfig_TestDamageAction": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:31401"
    },
    "EnemyConfig_ArchDemon": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32036"
    },
    "EnemyConfig_ArchDemonElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32037"
    },
    "EnemyConfig_ArchonOro": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32038"
    },
    "EnemyConfig_BeastDemon": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32039"
    },
    "EnemyConfig_BeastDemonElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32040"
    },
    "EnemyConfig_BeastDemonElite_Ambush": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32041"
    },
    "EnemyConfig_Durga": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32042"
    },
    "EnemyConfig_EnderEliteP1": {
      "instakill": 0.9900000095367432,
      "freeze": 0,
      "source": "sharedassets0.assets:32043"
    },
    "EnemyConfig_EnderEliteP2": {
      "instakill": 0.9900000095367432,
      "freeze": 0,
      "source": "sharedassets0.assets:32044"
    },
    "EnemyConfig_EyeBallElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32045"
    },
    "EnemyConfig_EyeBallElite_Ambush": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32046"
    },
    "EnemyConfig_FallenAngel": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32047"
    },
    "EnemyConfig_FallenAngelElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32048"
    },
    "EnemyConfig_FallenArchangel": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32049"
    },
    "EnemyConfig_FallenThrone": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32050"
    },
    "EnemyConfig_GreenKnight": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32051"
    },
    "EnemyConfig_GreenKnightElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32052"
    },
    "EnemyConfig_Guardian_5": {
      "instakill": 0.8999999761581421,
      "freeze": 50,
      "source": "sharedassets0.assets:32053"
    },
    "EnemyConfig_Kali": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32054"
    },
    "EnemyConfig_Succubus": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32055"
    },
    "EnemyConfig_SuccubusElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32056"
    },
    "EnemyConfig_TraineeRedReaper": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32057"
    },
    "EnemyConfig_TrinacriaElite": {
      "instakill": 0.949999988079071,
      "freeze": 0,
      "source": "sharedassets0.assets:32058"
    },
    "EnemyConfig_Bat_COWARD": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32059"
    },
    "EnemyConfig_Bat_Glowing-T1": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32200"
    },
    "EnemyConfig_Bat_Glowing-T2": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32201"
    },
    "EnemyConfig_Bat_Glowing-T3": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32202"
    },
    "EnemyConfig_Bat_Glowing-T4": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32203"
    },
    "EnemyConfig_Brazier_Weak": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32204"
    },
    "EnemyConfig_GlowingBat_Elite-T1": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32205"
    },
    "EnemyConfig_GlowingBat_Elite-T2": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32206"
    },
    "EnemyConfig_GlowingBat_Elite-T3": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32207"
    },
    "EnemyConfig_GlowingBat_Elite-T4": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32208"
    },
    "EnemyConfig_MoonAtlantean": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32209"
    },
    "EnemyConfig_SunAtlantean": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32210"
    },
    "EnemyConfig_TestDebuffEnemy": {
      "instakill": 0.5,
      "freeze": 0,
      "source": "sharedassets0.assets:32211"
    },
    "EnemyConfig_Bat_Weak": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32212"
    },
    "EnemyConfig_MudMan_Weak": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32213"
    },
    "EnemyConfig_Werewolf_Weak": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32214"
    },
    "EnemyConfig_Zombie_Weak": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32215"
    },
    "EnemyConfig_ArconAscia": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32316"
    },
    "EnemyConfig_Gallotrice": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32317"
    },
    "EnemyConfig_GallotriceElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32318"
    },
    "EnemyConfig_GiantArmouredKnightElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32319"
    },
    "EnemyConfig_GiantArmouredKnightElite_Ambush": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32320"
    },
    "EnemyConfig_Golem": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32321"
    },
    "EnemyConfig_GolemElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32322"
    },
    "EnemyConfig_Guardian_3": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32323"
    },
    "EnemyConfig_LizardElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32324"
    },
    "EnemyConfig_LizardPawn": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32325"
    },
    "EnemyConfig_LostTwinElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32326"
    },
    "EnemyConfig_Merman": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32327"
    },
    "EnemyConfig_MermanElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32328"
    },
    "EnemyConfig_MermanElite_Ambush": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32329"
    },
    "EnemyConfig_MilkElemental": {
      "instakill": 0.5,
      "freeze": 0,
      "source": "sharedassets0.assets:32330"
    },
    "EnemyConfig_MilkElementalElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32331"
    },
    "EnemyConfig_Minotaur": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32332"
    },
    "EnemyConfig_MinotaurElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32333"
    },
    "EnemyConfig_MinotaurElite_Ambush": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32334"
    },
    "EnemyConfig_TritontElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32335"
    },
    "EnemyConfig_TwinDemon": {
      "instakill": 0.6000000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32336"
    },
    "EnemyConfig_ArchonSpada": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32442"
    },
    "EnemyConfig_CollosalFlameElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32443"
    },
    "EnemyConfig_DevilElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32444"
    },
    "EnemyConfig_Dragonshrimp": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32445"
    },
    "EnemyConfig_GalloElite": {
      "instakill": 0.9900000095367432,
      "freeze": 0,
      "source": "sharedassets0.assets:32446"
    },
    "EnemyConfig_Ghiavolo": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32447"
    },
    "EnemyConfig_GiantCrabElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32448"
    },
    "EnemyConfig_GiantCrabElite_Ambush": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32449"
    },
    "EnemyConfig_GiantSkulloneElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32450"
    },
    "EnemyConfig_GiantSkulloneElite_Ambush": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32451"
    },
    "EnemyConfig_Guardian_4": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32452"
    },
    "EnemyConfig_Harpy": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32453"
    },
    "EnemyConfig_HarpyElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32454"
    },
    "EnemyConfig_ManticoreElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32455"
    },
    "EnemyConfig_Scarleton": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32456"
    },
    "EnemyConfig_Skeleton2": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32457"
    },
    "EnemyConfig_Skullino": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32458"
    },
    "EnemyConfig_ApprenticeWitch": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32556"
    },
    "EnemyConfig_Ecto": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32557"
    },
    "EnemyConfig_EctoElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32558"
    },
    "EnemyConfig_Ghost": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32559"
    },
    "EnemyConfig_GhostElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32560"
    },
    "EnemyConfig_GhostElite_Ambush": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32561"
    },
    "EnemyConfig_Guardian_2": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32562"
    },
    "EnemyConfig_HagElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32563"
    },
    "EnemyConfig_LionHead": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32564"
    },
    "EnemyConfig_LionHeadElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32565"
    },
    "EnemyConfig_MasterWitchElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32566"
    },
    "EnemyConfig_Mudman": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32567"
    },
    "EnemyConfig_MudmanElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32568"
    },
    "EnemyConfig_NesuferitElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32569"
    },
    "EnemyConfig_QueenMedusaElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32570"
    },
    "EnemyConfig_QueenMedusaElite_Ambush": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32571"
    },
    "EnemyConfig_ShadeBomb": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32572"
    },
    "EnemyConfig_SneakyHead": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32573"
    },
    "EnemyConfig_Bat": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32660"
    },
    "EnemyConfig_Bat_Elite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32661"
    },
    "EnemyConfig_FlowerWall": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32662"
    },
    "EnemyConfig_FlowerWall2": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32663"
    },
    "EnemyConfig_Ghoul": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32664"
    },
    "EnemyConfig_GiantMummy": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32665"
    },
    "EnemyConfig_GiantMummy_Elite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32666"
    },
    "EnemyConfig_Guardian_1": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32667"
    },
    "EnemyConfig_MantisElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32668"
    },
    "EnemyConfig_MantisElite_Ambush": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32669"
    },
    "EnemyConfig_Skeleton3": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32670"
    },
    "EnemyConfig_Skeleton3_Elite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32671"
    },
    "EnemyConfig_TreasureBat_Elite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32672"
    },
    "EnemyConfig_VenusElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32673"
    },
    "EnemyConfig_Werewolf": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32674"
    },
    "EnemyConfig_WerewolfElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32675"
    },
    "EnemyConfig_Zombie": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32676"
    },
    "EnemyConfig_Zombie_Elite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32677"
    },
    "EnemyConfig_BridgeGuardian": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32801"
    },
    "EnemyConfig_GiantBat": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:32802"
    },
    "EnemyConfig_Impefinger": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32803"
    },
    "EnemyConfig_Raiju": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:32804"
    },
    "EnemyConfig_SwordFlint": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32805"
    },
    "EnemyConfig_SwordiLee": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32806"
    },
    "EnemyConfig_Swordian": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32807"
    },
    "EnemyConfig_Bat_Tutorial00": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32824"
    },
    "EnemyConfig_Bat_Tutorial01": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32825"
    },
    "EnemyConfig_Bat_Tutorial01_DoubleXP": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32826"
    },
    "EnemyConfig_Bat_Tutorial02": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32827"
    },
    "EnemyConfig_Bat_Tutorial03-5": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32828"
    },
    "EnemyConfig_Bat_Tutorial03": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32829"
    },
    "EnemyConfig_Bat_Tutorial04-5": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32830"
    },
    "EnemyConfig_Bat_Tutorial04": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32831"
    },
    "EnemyConfig_Bat_Tutorial05": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32832"
    },
    "EnemyConfig_Drowner_Parade": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:32980"
    },
    "EnemyConfig_EnderEliteP1_DeathParade": {
      "instakill": 0.9900000095367432,
      "freeze": 0,
      "source": "sharedassets0.assets:32981"
    },
    "EnemyConfig_RedDeath_DeathParade": {
      "instakill": 1.0,
      "freeze": 50,
      "source": "sharedassets0.assets:32982"
    },
    "EnemyConfig_TraineeRedReaper_Alt_Parade": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32983"
    },
    "EnemyConfig_TraineeRedReaper_Parade": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:32984"
    },
    "EnemyConfig_Trickster_Parade": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:32985"
    },
    "EnemyConfig_ArchonSpadaBelow": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33022"
    },
    "EnemyConfig_CollosalFlameBelowElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:33023"
    },
    "EnemyConfig_DragonshrimpBelow": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33024"
    },
    "EnemyConfig_DrownerBelowElite": {
      "instakill": 0.8999999761581421,
      "freeze": 35,
      "source": "sharedassets0.assets:33025"
    },
    "EnemyConfig_GalloBelowElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33026"
    },
    "EnemyConfig_GhiavoloBelow": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33027"
    },
    "EnemyConfig_GhiavoloBelowElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:33028"
    },
    "EnemyConfig_GiantSkulloneBelowElite": {
      "instakill": 0.75,
      "freeze": 0,
      "source": "sharedassets0.assets:33029"
    },
    "EnemyConfig_LedaBoss": {
      "instakill": 0.9900000095367432,
      "freeze": 60,
      "source": "sharedassets0.assets:33030"
    },
    "EnemyConfig_ManticoreBelowElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:33031"
    },
    "EnemyConfig_Skeleton2Below": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33032"
    },
    "EnemyConfig_SkullinoBelow": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33033"
    },
    "EnemyConfig_Awizotl": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33195"
    },
    "EnemyConfig_AwizotlElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33196"
    },
    "EnemyConfig_Buklavaca": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33197"
    },
    "EnemyConfig_BuklavacaElite": {
      "instakill": 0.949999988079071,
      "freeze": 0,
      "source": "sharedassets0.assets:33198"
    },
    "EnemyConfig_DeepAngellette": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33199"
    },
    "EnemyConfig_DeepCrab": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33200"
    },
    "EnemyConfig_DeepCrabElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33201"
    },
    "EnemyConfig_DeepMerman": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33202"
    },
    "EnemyConfig_DeepMermanElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:33203"
    },
    "EnemyConfig_DeepSluge": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33204"
    },
    "EnemyConfig_DeepSlugeElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33205"
    },
    "EnemyConfig_DeepSphinxElite": {
      "instakill": 0.949999988079071,
      "freeze": 0,
      "source": "sharedassets0.assets:33206"
    },
    "EnemyConfig_DeepTritont": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33207"
    },
    "EnemyConfig_DeepTritontElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:33208"
    },
    "EnemyConfig_EnypnastysElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33209"
    },
    "EnemyConfig_Itchiocentaur": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33210"
    },
    "EnemyConfig_ItchiocentaurElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33211"
    },
    "EnemyConfig_Jellyfish": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33212"
    },
    "EnemyConfig_JellyfishElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33213"
    },
    "EnemyConfig_MoonEnypnastysElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33214"
    },
    "EnemyConfig_MoonGarlic": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33215"
    },
    "EnemyConfig_MoonNightshadeElite": {
      "instakill": 0.949999988079071,
      "freeze": 0,
      "source": "sharedassets0.assets:33216"
    },
    "EnemyConfig_MoonSeaHam": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33217"
    },
    "EnemyConfig_MoonSeaHamElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:33218"
    },
    "EnemyConfig_Olmo": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33219"
    },
    "EnemyConfig_RedSerpentVine": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33220"
    },
    "EnemyConfig_SeaHam": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33221"
    },
    "EnemyConfig_SeaHamElite": {
      "instakill": 0.8500000238418579,
      "freeze": 0,
      "source": "sharedassets0.assets:33222"
    },
    "EnemyConfig_SeaSpinach": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33223"
    },
    "EnemyConfig_SeaSpinachElite": {
      "instakill": 0.8999999761581421,
      "freeze": 0,
      "source": "sharedassets0.assets:33224"
    },
    "EnemyConfig_SerpentVine": {
      "instakill": 0.0,
      "freeze": 0,
      "source": "sharedassets0.assets:33225"
    },
    "EnemyConfig_SerpentVineElite": {
      "instakill": 0.800000011920929,
      "freeze": 0,
      "source": "sharedassets0.assets:33226"
    }
  }
};
if(typeof module!=="undefined"&&module.exports)module.exports=data;root.WildV10=data;
})(typeof globalThis!=="undefined"?globalThis:this);
