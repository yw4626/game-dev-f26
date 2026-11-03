/* Authored balance rules. Extracted WildV10 data remains unchanged. */
(function(root){'use strict';
const cards={
 coinCard:{role:['应急周转','Quick mana'],effects:[{type:'coins',amount:5},{type:'manaGain',amount:1,fixed:true},{type:'destroy'}]},
 coinPurse:{role:['金币过牌','Cash + cycle']},
 bagOfCoins:{role:['财富积累','Investment'],effects:[{type:'coins',amount:25},{type:'greed',amount:5,fixed:true},{type:'destroy'}]},
 largeBagOfCoins:{role:['大额收益','Cash burst']},
 cloverPetal:{role:['幸运过牌','Luck + cycle']},
 littleClover:{role:['幸运积累','Pure luck'],effects:[{type:'luck',amount:15},{type:'destroy'}]},
 littleHeart:{role:['生命恢复','Healing'],effects:[{type:'heal',amount:5},{type:'destroy'}]},
 vacuum:{role:['集中补牌','Draw burst'],effects:[{type:'drawCount',amount:3},{type:'destroy'}]},
 wildDefence:{role:['连击护盾','Combo shield'],effects:[{type:'armor',amount:3}]},
 rawMana:{role:['法力爆发','Mana burst']},
 wings:{role:['整手减费','Hand discount']},
 bracelet:{role:['连发攻击','Multi-strike']},
 orologion:{role:['前排冻结','Front freeze']},
 rosary:{role:['多排清除','Row purge']},
 combo:{role:['连击加速','Combo boost']}
};
function active(settings={}){return settings.wildBalanceVersion===20;}
function effects(def,settings){return active(settings)&&cards[def.key]?.effects||def.effects||[];}
const api={version:20,source:'user-requested balance',cards,active,effects};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WildBalanceV20=api;
})(typeof globalThis!=='undefined'?globalThis:this);
