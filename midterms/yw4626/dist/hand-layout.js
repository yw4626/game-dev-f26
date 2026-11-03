(function(root){
  'use strict';
  // Browser adaptation of the native fan, hover lift and selected-card repel.
  // 20 is our hand capacity, not an inferred native hard limit.
  const capacity=20;
  function fan({count,width,cardWidth,selected=-1}){
    count=Math.max(0,Math.trunc(count));width=Math.max(cardWidth+24,width);
    const step=count<2?0:Math.max(36,Math.min(115,(width-cardWidth-24)/(count-1)));
    const span=cardWidth+Math.max(0,count-1)*step,contentWidth=Math.max(width,span+24),start=(contentWidth-span)/2,mid=(count-1)/2;
    const cards=Array.from({length:count},(_,i)=>{
      const normalized=mid?(i-mid)/mid:0,focused=i===selected;
      const repel=selected>=0&&!focused?Math.sign(i-selected)*Math.min(48,64/Math.abs(i-selected)):0;
      return {x:Math.round(Math.max(12,Math.min(contentWidth-cardWidth-12,start+i*step+repel))),lift:focused?0:38+Math.round(16*normalized*normalized),angle:focused||count<=2?0:normalized*4,order:focused?count+2:i+1};
    });
    // Preserve a reachable edge even when selected-card repel hits a boundary.
    for(let i=1;i<cards.length;i++)cards[i].x=Math.max(cards[i].x,cards[i-1].x+24);
    if(cards.length)cards[cards.length-1].x=Math.min(cards[cards.length-1].x,contentWidth-cardWidth-12);
    for(let i=cards.length-2;i>=0;i--)cards[i].x=Math.min(cards[i].x,cards[i+1].x-24);
    return {contentWidth,step,cards};
  }
  const api={capacity,fan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerHand=api;
})(typeof globalThis!=='undefined'?globalThis:this);
