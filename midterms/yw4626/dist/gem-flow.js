/* Presentation only. Preview modifiers come from the same gem rules as settlement. */
(function(root){
  'use strict';
  function render(run,{tr,escape,cardTile}){
    const G=Crawler.gems,choice=run.gemChoice,obj=run.gemObject(),selected=choice.selected;
    const anyCompatible=obj.offers.some(k=>run.deck.some(c=>G.canInsert(c,k).ok));
    const compatible=selected?run.deck.filter(c=>G.canInsert(c,selected).ok):[];
    const blocked=selected?run.deck.filter(c=>!G.canInsert(c,selected).ok):[];
    const name=g=>tr(g.name,g.english||g.name);
    function changes(c){
      const p=G.insertionPreview(c,selected),labels={cost:tr('费用修正','Cost modifier'),damageMultiplier:tr('伤害倍率','Damage multiplier'),free:tr('免费出牌','Free play'),reverse:tr('逆序连击','Reverse combo'),draw:tr('额外抽牌','Extra draw'),armor:tr('额外护甲','Extra armor')};
      const value=x=>typeof x==='boolean'?(x?tr('是','Yes'):tr('否','No')):String(x);
      return Object.keys(labels).filter(k=>p.before[k]!==p.after[k]).map(k=>`${labels[k]} ${value(p.before[k])} → ${value(p.after[k])}`).join(' · ')+` · ${tr('槽位','Sockets')} ${p.usedBefore}/${p.slots} → ${p.usedAfter}/${p.slots}`;
    }
    return `<div class="room-heading"><span class="eyebrow">GEMS / SOCKET A CARD</span><h2>${tr('为一张卡牌镶嵌宝石','Socket a gem into one card')}</h2><ol class="gem-steps" aria-label="${tr('镶嵌步骤','Socket steps')}"><li class="${!selected?'current':'done'}">1 · ${tr('选择宝石','Choose gem')}</li><li class="${selected?'current':''}">2 · ${tr('选择卡牌，完成镶嵌','Choose card to finish')}</li></ol><p role="status">${!anyCompatible?tr('当前没有兼容卡牌。请暂时离开；新增卡牌或扩槽后再来，奖励会保留。','No compatible cards. Leave for now; return after gaining cards or expanding sockets. The reward is preserved.'):selected?tr('宝石已选中，尚未镶嵌。请选择下方亮起的卡牌；点击“镶入此牌”后才领取奖励。','Gem selected, not attached yet. Choose a highlighted card below to claim this reward.'):tr('先选择一颗宝石。每次奖励只镶入一张卡牌，其他候选不会领取。','Select a gem. Each reward sockets one card; other offers are not claimed.')}</p></div>
    <div class="offer-grid gem-offers">${obj.offers.map(k=>{const g=G.catalog.gems[k],count=run.deck.filter(c=>G.canInsert(c,k).ok).length;return `<button class="gem-offer ${k===selected?'selected':''}" data-run-action="gem:${k}" aria-pressed="${k===selected}" ${k===selected||!count?'disabled':''}>${GemShapes.icon(k,{en:CrawlerLocale.language==='en'})}<strong>${escape(name(g))}</strong><span>${escape(CrawlerLocale.text(g.description))}</span><small>${!count?tr('无兼容卡牌','No compatible cards'):k===selected?tr('已选中 · 下一步选择卡牌','Selected · choose a card'):tr('选择宝石','Select gem')} · ${count} ${tr('张兼容卡牌','compatible cards')}</small></button>`;}).join('')}</div>
    ${selected?`<section class="gem-targets" aria-label="${tr('兼容卡牌','Compatible cards')}"><h3 class="socket-title">${escape(name(G.catalog.gems[selected]))} · ${compatible.length} ${tr('张可镶嵌卡牌','compatible cards')}</h3>${compatible.length?`<div class="card-gallery">${compatible.map(c=>`<article class="gem-target">${cardTile(c,'socket:'+c.id,tr('镶入此牌 · 完成','Socket here · finish'))}<p class="gem-change">${escape(changes(c))}</p></article>`).join('')}</div>`:`<p class="gem-empty">${tr('当前没有兼容卡牌。请选择其他宝石，或暂时离开。奖励不会被消耗。','No compatible cards. Choose another gem or leave; this reward will remain available.')}</p>`}</section>${blocked.length?`<details class="gem-blocked"><summary>${tr('查看不可镶嵌卡牌及原因','View incompatible cards and reasons')} (${blocked.length})</summary><ul>${blocked.map(c=>`<li>${escape(tr(Crawler.definition(c).name,Crawler.definition(c).english))} #${c.id} — ${escape(CrawlerLocale.text(G.canInsert(c,selected).reason))}</li>`).join('')}</ul></details>`:''}`:''}
    <button class="quiet-button room-exit" data-run-action="gemcancel">${choice.source==='boss'?tr('返回奖励选择','Back to rewards'):tr('暂时离开 · 保留宝石箱','Leave · keep this chest')} →</button>`;
  }
  root.GemFlow={render};
})(globalThis);
