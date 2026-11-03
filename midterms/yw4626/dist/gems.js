(function(root){
  'use strict';
  const catalog=typeof module!=='undefined'&&module.exports?require('./gem-catalog.js'):root.GemCatalog;
  const enabled=Object.freeze(['costDown','costUp','double','triple','free','reverse','draw','armor']);
  function metadata(card){const info=catalog.cardSlots[card?.baseKey||card?.key]||catalog.cardSlots[card?.assetId]||null;return card?.gemRulesVersion>=15&&info?.maxSlots>0?{...info,sourceMaxSlots:info.maxSlots,maxSlots:info.slots+2}:info;}
  function installed(card){return Array.isArray(card?.gems)?card.gems.filter(k=>card.gemRulesVersion>=14?k!=='evolve':true):[];}
  function slotCount(card){return card?.gemSlots??metadata(card)?.slots??0;}
  function expand(tags,groups){return [...tags,...groups.flatMap(g=>catalog.tagGroups[g]||[])];}
  function availableTags(card){
    const tags=new Set(metadata(card)?.allowedGemTags||[]), gems=installed(card).map(k=>catalog.gems[k]).filter(Boolean);
    // Native ordering is all exclusions, then all inclusions, not one gem at a time.
    for(const gem of gems)for(const tag of expand(gem.exclusions,gem.exclusionGroups))tags.delete(tag);
    for(const gem of gems)for(const tag of expand(gem.inclusions,gem.inclusionGroups))tags.add(tag);
    return [...tags];
  }
  function canInsert(card,key){
    const gem=catalog.gems[key], info=metadata(card), keys=installed(card), slots=slotCount(card);
    if(!gem||!enabled.includes(key))return {ok:false,reason:'这颗宝石尚未开放'};
    if(!info)return {ok:false,reason:'未知卡牌'};
    if(!Number.isInteger(slots)||slots<0||slots>info.maxSlots)return {ok:false,reason:'卡牌槽位数据无效'};
    if(card.gems!==undefined&&!Array.isArray(card.gems))return {ok:false,reason:'卡牌宝石数据无效'};
    if(keys.length>=slots)return {ok:false,reason:'没有空宝石槽'};
    if(!gem.allowDuplicate&&keys.includes(key))return {ok:false,reason:'同一张牌不能重复镶嵌这颗宝石'};
    const tags=new Set(availableTags(card));
    if(!gem.tags.some(tag=>tags.has(tag)))return {ok:false,reason:'宝石与这张牌或已有宝石不兼容'};
    return {ok:true,reason:''};
  }
  function validate(card){
    const info=metadata(card),slots=slotCount(card);
    if(!info)return {ok:false,reason:'未知卡牌'};
    if(!Number.isInteger(slots)||slots<0||slots>info.maxSlots)return {ok:false,reason:'卡牌槽位数据无效'};
    if(card.gems!==undefined&&!Array.isArray(card.gems))return {ok:false,reason:'卡牌宝石数据无效'};
    const keys=installed(card),evolutionCount=card.gemRulesVersion>=14?(card.evolved?1:0):keys.filter(k=>k==='evolve').length;
    if(card.gemRulesVersion>=14&&card.gems?.includes('evolve'))return {ok:false,reason:'进化标记不应占用宝石槽'};
    if(evolutionCount&&(evolutionCount!==1||!card.baseKey||card.evolutionRecipe!==card.key))return {ok:false,reason:'进化宝石数据无效'};
    if(card.baseKey&&!evolutionCount)return {ok:false,reason:'进化卡缺少进化宝石'};
    // Insertion order matters: native checks the incoming gem against prior gems.
    const copy={...card,gems:[]};
    for(const key of installed(card)){
      if(key==='evolve'){
        if(copy.gems.length>=slots)return {ok:false,reason:'没有空宝石槽'};
        copy.gems.push(key);continue;
      }
      const result=canInsert(copy,key);if(!result.ok)return result;
      copy.gems.push(key);
    }
    return {ok:true,reason:''};
  }
  function modifiers(card){
    const value={cost:0,damageMultiplier:1,free:false,reverse:false,draw:0,armor:0};
    let damage=0,damageCount=0;
    for(const key of installed(card)){
      if(!enabled.includes(key))continue;
      const gem=catalog.gems[key];
      if(gem.effect==='damageMultiplier'){damage+=gem.value;damageCount++;}
      else if(gem.effect==='free'||gem.effect==='reverse')value[gem.effect]=true;
      else value[gem.effect]+=gem.value;
    }
    if(damageCount)value.damageMultiplier=damage;
    return value;
  }
  function insertionPreview(card,key){
    const legal=canInsert(card,key);if(!legal.ok)return {...legal};
    const after={...card,gems:[...installed(card),key]};
    return {ok:true,cardId:card.id,gem:key,before:modifiers(card),after:modifiers(after),slots:slotCount(card),usedBefore:installed(card).length,usedAfter:installed(after).length};
  }
  const api={catalog,enabled,metadata,installed,slotCount,availableTags,canInsert,validate,modifiers,insertionPreview};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerGems=api;
})(typeof globalThis!=='undefined'?globalThis:this);
