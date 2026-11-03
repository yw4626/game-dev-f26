(function(root){
  'use strict';
  // Authored 16px silhouettes. These visual identifiers are not extracted game art.
  const entries={
    armor:{shape:'shield',name:'防御',english:'Armor',color:'#74bbff',light:'#d8f2ff',shade:'#3057a5',rows:['................','..############..','..############..','..############..','..############..','..############..','..############..','...##########...','...##########...','....########....','....########....','.....######.....','......####......','.......##.......','................','................']},
    double:{shape:'twin-diamond',name:'双倍伤害',english:'Double damage',color:'#f47b62',light:'#ffe2ac',shade:'#9e344a',rows:['................','................','....##....##....','...####..####...','..############..','.##############.','################','################','.##############.','..############..','...####..####...','....##....##....','................','................','................','................']},
    triple:{shape:'crown',name:'三倍伤害',english:'Triple damage',color:'#ffb84c',light:'#fff2b4',shade:'#ae542b',rows:['................','.......##.......','......####......','.##...####...##.','.###.######.###.','.##############.','..############..','..############..','..############..','...##########...','...##########...','...##########...','...##########...','................','................','................']},
    costDown:{shape:'down-arrow',name:'减少法力消耗',english:'Mana cost down',color:'#57daca',light:'#cefff1',shade:'#217c91',rows:['................','.....######.....','.....######.....','.....######.....','.....######.....','.....######.....','.##############.','.##############.','..############..','...##########...','....########....','.....######.....','......####......','.......##.......','................','................']},
    costUp:{shape:'up-arrow',name:'增加法力消耗',english:'Mana cost up',color:'#bf91ff',light:'#f7deff',shade:'#7042a1',rows:['................','.......##.......','......####......','.....######.....','....########....','...##########...','..############..','.##############.','.##############.','.....######.....','.....######.....','.....######.....','.....######.....','.....######.....','................','................']},
    might:{shape:'cross-star',name:'力量',english:'Might',color:'#f35c89',light:'#ffd4df',shade:'#972b60',rows:['................','......####......','......####......','.....######.....','.....######.....','...##########...','.##############.','.##############.','.##############.','.##############.','...##########...','.....######.....','.....######.....','......####......','......####......','................']},
    free:{shape:'ring',name:'免费',english:'Free',color:'#f9df68',light:'#fffbd8',shade:'#a67b2c',rows:['................','.....######.....','...##########...','..############..','..####....####..','.####......####.','.###........###.','.###........###.','.###........###.','.###........###.','.####......####.','..####....####..','..############..','...##########...','.....######.....','................']},
    amount:{shape:'three-prong',name:'发射数量',english:'Amount',color:'#fc925c',light:'#ffe8b5',shade:'#a44d39',rows:['................','.......##.......','......####......','......####......','..##..####..##..','.####.####.####.','.####.####.####.','.##############.','..############..','...##########...','....########....','.....######.....','.....######.....','.....######.....','................','................']},
    draw:{shape:'tablet',name:'抽牌',english:'Draw',color:'#87df83',light:'#e7ffd1',shade:'#43805d',rows:['................','...##########...','..############..','..############..','..############..','..############..','..############..','..############..','..############..','..############..','..############..','..############..','..############..','...##########...','................','................']},
    reverse:{shape:'hook',name:'逆向连击',english:'Reverse combo',color:'#ba9bed',light:'#f3e4ff',shade:'#6553a2',rows:['................','.......######...','.....#########..','....###########.','...#####...####.','...####.....###.','...####.....###.','...####.....###.','.########...###.','..######...####.','...####...#####.','....##..######..','.......######...','................','................','................']}
  };
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function icon(key,{label,en=false,decorative=false,className=''}={}){
    const gem=entries[key];if(!gem)return '';
    const title=label||(en?gem.english:gem.name),paths={outline:[],body:[],light:[],shade:[]};
    const filled=(x,y)=>gem.rows[y]?.[x]==='#';
    for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(filled(x,y)){
      const edge=!filled(x-1,y)||!filled(x+1,y)||!filled(x,y-1)||!filled(x,y+1);
      const tone=edge?'outline':!filled(x-2,y)||!filled(x,y-2)?'light':x+y>18?'shade':'body';
      paths[tone].push(`M${x} ${y}h1v1h-1z`);
    }
    const colors={outline:'#1a1429',body:gem.color,light:gem.light,shade:gem.shade};
    return `<svg class="gem-shape ${escape(className)}" data-gem="${escape(key)}" data-shape="${gem.shape}" viewBox="0 0 16 16" shape-rendering="crispEdges" focusable="false" ${decorative?'aria-hidden="true"':`role="img" aria-label="${escape(title)}"`}><title>${escape(title)}</title>${Object.entries(paths).filter(([,v])=>v.length).map(([tone,v])=>`<path fill="${colors[tone]}" d="${v.join('')}"/>`).join('')}</svg>`;
  }
  function evolutionBadge(en=false){return `<span class="evolution-badge" title="${en?'Evolution does not occupy a gem socket':'进化不占用宝石槽位'}">${en?'EVOLVED':'已进化'}</span>`;}
  function strip(card,{installed=card?.gems||[],slots=card?.gemSlots||0,en=false}={}){
    const keys=installed.filter(k=>k!=='evolve'),evolved=!!(card?.evolutionRecipe||card?.baseKey||installed.includes('evolve'));
    const chips=keys.map(k=>{const gem=entries[k];return `<span class="gem-chip filled gem-${escape(k)}" title="${escape(en?gem?.english:gem?.name)}">${icon(k,{en,decorative:true})}<span>${escape(gem?(en?gem.english:gem.name):k)}</span></span>`;}).join('');
    const empty=Array.from({length:Math.max(0,slots-keys.length)},()=>`<span class="gem-chip empty"><span aria-hidden="true">◇</span> ${en?'Empty':'空槽'}</span>`).join('');
    return `<span class="gem-strip shaped-gems" aria-label="${en?'Gems':'宝石'} ${keys.length}/${slots}">${chips}${empty}${!slots?`<span class="gem-chip">${en?'No sockets':'无宝石槽'}</span>`:''}</span>${evolved?evolutionBadge(en):''}`;
  }
  const api={entries,icon,strip,evolutionBadge};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GemShapes=api;
})(typeof globalThis!=='undefined'?globalThis:this);
