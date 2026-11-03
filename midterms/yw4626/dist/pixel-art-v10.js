/* Authored v10 pixel art. Integer 16x16 grids only; no sampled game assets.
 * Load after pixel-assets.js, preferably before dungeon-view.js. */
(function(root){
  'use strict';
  const palette={o:'#100e20',d:'#27243d',s:'#51486b',p:'#786587',h:'#b1a0b8',w:'#e2d8c4',g:'#55756d',l:'#98b58a',r:'#913d56',R:'#e06c68',b:'#486d96',B:'#9ec2dd',y:'#aa783e',Y:'#e7bb67',f:'#f3df9a',v:'#854c88',G:'#15945d',L:'#71df6d'},sprites={};
  function paint(draw){const a=Array.from({length:16},()=>Array(16).fill('.'));const p=(x,y,c)=>{if(x>=0&&y>=0&&x<16&&y<16)a[y][x]=c;};const box=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)p(i,j,c);};const line=(x,y,X,Y,c)=>{const dx=Math.abs(X-x),sx=x<X?1:-1,dy=-Math.abs(Y-y),sy=y<Y?1:-1;let e=dx+dy;for(;;){p(x,y,c);if(x===X&&y===Y)break;const t=2*e;if(t>=dy){e+=dy;x+=sx;}if(t<=dx){e+=dx;y+=sy;}}};const disc=(x,y,r,c)=>{for(let j=y-r;j<=y+r;j++)for(let i=x-r;i<=x+r;i++)if((i-x)**2+(j-y)**2<=r*r)p(i,j,c);};draw({p,box,line,disc});return a.map(row=>row.join(''));}
  const add=(key,draw)=>sprites['icon-'+key]=paint(draw),copy=(key,base,map={})=>sprites['icon-'+key]=sprites['icon-'+base].map(row=>[...row].map(c=>map[c]||c).join(''));
  const sparkle=(s,x,y,c='f')=>{s.p(x,y-1,c);s.p(x-1,y,c);s.p(x,y,c);s.p(x+1,y,c);s.p(x,y+1,c);};
  function candle(s,x,y){s.box(x-1,y,3,7,'o');s.box(x,y,1,6,'w');s.p(x,y-3,'R');s.box(x-1,y-2,3,2,'Y');s.p(x,y-2,'f');}
  add('candelabrador',s=>{candle(s,8,5);s.box(5,12,7,2,'y');s.box(4,14,9,1,'o');});
  add('candelabrador1',s=>{candle(s,5,5);candle(s,11,5);s.line(4,12,12,12,'Y');s.box(7,12,3,3,'y');});
  add('candelabrador2',s=>{candle(s,3,6);candle(s,8,4);candle(s,13,6);s.line(3,12,13,12,'Y');s.box(7,12,3,2,'y');s.box(5,14,7,1,'Y');});
  add('clover',s=>{[[5,4],[10,4],[5,9],[10,9]].forEach(([x,y])=>{s.disc(x,y,3,'o');s.disc(x,y,2,'g');s.p(x-1,y-1,'l');});s.line(7,7,10,14,'l');s.p(7,7,'f');});
  add('spellbinder',s=>{s.box(2,3,12,11,'o');s.box(3,4,10,9,'v');s.box(4,5,8,2,'p');s.line(3,9,12,9,'y');s.box(7,7,2,5,'Y');s.p(7,8,'f');s.box(5,13,6,1,'y');});
  add('hollowHeart',s=>{s.disc(5,5,4,'o');s.disc(10,5,4,'o');s.line(2,8,7,14,'o');s.line(13,8,8,14,'o');s.disc(5,5,3,'r');s.disc(10,5,3,'R');for(let y=7;y<13;y++)s.box(y-5,y,26-y*2,1,y<10?'R':'r');s.box(6,5,4,4,'o');s.box(7,4,2,6,'o');s.p(3,4,'w');});
  add('crown',s=>{s.line(2,3,3,12,'o');s.line(13,3,12,12,'o');s.box(3,9,10,4,'y');s.box(4,10,8,2,'Y');[[3,4],[8,2],[12,4]].forEach(([x,y])=>{s.line(x,y,x,10,'Y');s.p(x,y-1,'f');});s.line(3,6,6,10,'Y');s.line(12,6,9,10,'Y');s.box(7,9,2,2,'v');s.box(3,13,10,1,'o');});
  add('stoneMask',s=>{s.box(4,2,8,12,'o');s.box(2,4,12,6,'o');s.box(4,3,8,10,'s');s.box(3,4,10,6,'h');s.box(5,3,6,2,'w');s.box(4,6,3,2,'o');s.box(9,6,3,2,'o');s.line(8,5,7,10,'p');s.box(5,11,6,1,'o');s.p(8,11,'R');});
  add('pummarola',s=>{s.disc(8,9,6,'o');s.disc(8,9,5,'r');s.disc(9,8,4,'R');s.box(5,6,2,3,'w');s.line(8,1,7,5,'g');s.line(3,3,11,5,'l');s.line(5,5,11,2,'g');});
  add('tirajisu',s=>{s.box(2,5,12,9,'o');s.box(3,6,10,7,'y');s.box(3,6,10,2,'w');s.box(3,10,10,2,'f');s.line(2,14,14,14,'h');s.box(5,3,7,2,'r');s.p(8,2,'R');s.p(4,7,'Y');});
  add('skull',s=>{s.disc(8,6,6,'o');s.disc(8,6,5,'w');s.box(4,9,8,5,'o');s.box(5,10,6,3,'h');s.box(4,5,3,3,'o');s.box(9,5,3,3,'o');s.p(5,6,'R');s.p(10,6,'R');s.p(8,8,'o');s.line(6,11,6,13,'o');s.line(9,11,9,13,'o');});
  add('bagOfCoins',s=>{s.box(5,2,6,2,'y');s.line(5,2,8,5,'o');s.line(10,2,8,5,'o');s.disc(8,10,6,'o');s.disc(8,10,5,'y');s.box(6,4,5,2,'Y');s.disc(8,10,3,'Y');s.line(8,8,8,12,'f');s.p(4,9,'f');});
  copy('largeBagOfCoins','bagOfCoins',{y:'Y',Y:'f'});
  add('coinPurse',s=>{s.box(2,5,12,9,'o');s.box(3,6,10,7,'r');s.box(4,7,8,3,'y');s.box(9,8,5,4,'Y');s.p(11,9,'f');s.line(3,4,12,4,'h');s.p(6,3,'Y');s.p(9,3,'Y');});
  add('orologion',s=>{s.box(6,0,4,3,'o');s.box(7,1,2,1,'Y');s.disc(8,9,6,'o');s.disc(8,9,5,'Y');s.disc(8,9,4,'w');s.line(8,5,8,9,'d');s.line(8,9,11,10,'d');s.p(8,9,'R');s.p(4,9,'y');s.p(8,13,'y');});
  add('rosary',s=>{[[4,3],[7,2],[10,3],[12,6],[11,9],[4,9],[2,6]].forEach(([x,y])=>{s.disc(x,y,1,'Y');s.p(x,y,'f');});s.line(5,10,8,12,'y');s.line(10,10,8,12,'y');s.box(7,11,2,5,'w');s.box(5,12,6,2,'w');s.p(7,12,'Y');});
  add('vacuum',s=>{s.disc(8,8,6,'o');s.disc(8,8,5,'b');s.disc(8,8,3,'B');s.disc(8,8,2,'w');[[2,2],[13,3],[2,12],[13,13]].forEach(([x,y])=>sparkle(s,x,y,'Y'));s.p(6,5,'f');});
  add('combo',s=>{s.line(3,1,7,7,'y');s.line(12,1,8,7,'y');s.disc(8,10,5,'o');s.disc(8,10,4,'Y');s.disc(6,9,2,'b');s.disc(9,9,2,'R');s.line(5,10,8,13,'B');s.line(10,10,8,13,'R');});
  add('wings',s=>{for(let y=2;y<13;y++)for(let x=y<9?1:y-7;x<=Math.min(7,y);x++){s.p(x,y,'w');s.p(15-x,y,'w');}for(let i=0;i<4;i++){s.line(1,3+i*2,6,8+i,'B');s.line(14,3+i*2,9,8+i,'B');}s.box(7,10,2,5,'Y');});
  add('cloverPetal',s=>{s.disc(5,6,3,'o');s.disc(10,6,3,'o');s.disc(5,6,2,'g');s.disc(10,6,2,'l');s.line(3,8,8,13,'g');s.line(12,8,8,13,'l');s.box(6,7,4,4,'g');s.p(4,5,'l');s.line(8,12,9,15,'l');});add('littleClover',s=>{[[8,4],[4,9],[11,9]].forEach(([x,y])=>{s.disc(x,y,3,'o');s.disc(x,y,2,'g');s.p(x-1,y-1,'l');});s.line(8,8,9,15,'l');});copy('littleHeart','hollowHeart',{o:'r',r:'R'});for(const k of ['clover','cloverPetal','littleClover'])sprites['icon-'+k]=sprites['icon-'+k].map(row=>row.replace(/g/g,'G').replace(/l/g,'L')); 
  add('rawMana',s=>{s.line(8,1,3,8,'B');s.line(3,8,8,15,'b');s.line(8,1,13,8,'w');s.line(13,8,8,15,'B');s.box(6,5,5,7,'b');s.box(7,5,2,6,'B');s.p(8,4,'f');});
  add('bracelet',s=>{s.disc(8,8,6,'o');s.disc(8,8,5,'Y');s.disc(8,8,3,'.');s.box(6,1,5,4,'o');s.box(7,2,3,2,'B');s.p(7,2,'w');});
  add('wildDefence',s=>{s.box(3,2,10,9,'o');s.box(4,3,8,7,'B');for(let y=9;y<14;y++)s.box(y-5,y,26-2*y,1,'b');s.box(7,4,2,8,'Y');s.box(5,6,6,2,'Y');s.p(5,4,'w');});
  add('coinCard',s=>{s.disc(8,8,6,'o');s.disc(8,8,5,'Y');s.disc(8,8,3,'y');s.line(8,5,8,11,'f');s.p(5,4,'w');});
  // Weapon silhouettes are intentionally different, even at a 24px card thumbnail.
  add('holyWand',s=>{s.box(7,6,2,9,'Y');s.disc(8,4,4,'o');s.disc(8,4,3,'B');sparkle(s,8,4,'f');s.p(3,9,'w');s.p(12,7,'w');});
  add('thousandEdge',s=>{for(let j=0;j<3;j++){const x=2+j*5;s.line(x,3,x+2,1,'w');s.box(x,3,2,7,'B');s.box(x-1,10,4,1,'Y');s.box(x,11,2,4,'r');}});
  add('bloodyTear',s=>{s.line(2,13,5,10,'y');s.line(4,10,4,5,'R');s.line(4,5,8,2,'R');s.line(8,2,13,5,'R');s.line(13,5,11,10,'r');s.line(11,10,8,10,'R');s.p(8,12,'R');s.box(7,13,3,2,'R');s.p(8,13,'f');});
  add('unholyVespers',s=>{s.box(2,3,12,11,'o');s.box(3,4,5,9,'v');s.box(8,4,5,9,'r');s.line(8,4,8,13,'Y');s.box(5,7,6,2,'Y');s.box(7,6,2,5,'Y');s.p(3,1,'R');s.p(13,1,'R');});
  add('valkyrieTurner',s=>{s.box(2,5,9,6,'o');s.box(3,6,7,4,'s');s.box(5,6,3,4,'Y');s.box(4,11,3,4,'y');s.line(11,6,15,3,'R');s.line(11,7,15,7,'Y');s.line(11,9,15,12,'R');});
  add('viciousHunger',s=>{s.disc(8,8,6,'o');s.disc(8,8,5,'v');s.box(3,6,10,5,'w');s.disc(8,8,3,'R');s.box(7,5,2,7,'o');s.p(9,6,'f');s.p(2,3,'Y');s.p(13,2,'Y');});
  add('deathSpiral',s=>{s.line(3,14,10,2,'y');s.line(4,14,11,2,'Y');s.line(8,2,13,3,'w');s.line(13,3,15,7,'B');s.line(15,7,13,10,'B');s.line(9,4,12,5,'h');s.p(3,4,'v');s.p(1,7,'v');});
  add('heavenSword',s=>{s.line(8,0,5,5,'B');s.line(8,0,10,5,'w');s.box(6,4,4,7,'B');s.line(8,3,8,10,'w');s.box(3,11,10,2,'Y');s.box(7,13,2,3,'b');});
  add('hellfire',s=>{s.line(8,0,3,8,'R');s.line(8,2,12,6,'r');s.disc(8,10,6,'r');s.disc(8,10,4,'R');s.line(9,4,5,11,'Y');s.disc(8,11,2,'f');s.p(2,5,'Y');s.p(13,2,'R');});
  add('noFuture',s=>{s.line(8,1,2,8,'B');s.line(2,8,8,14,'v');s.line(8,14,14,8,'R');s.line(14,8,8,1,'Y');s.box(6,5,5,6,'B');s.box(7,6,3,4,'f');[[2,2],[13,2],[1,13],[13,13]].forEach(([x,y])=>sparkle(s,x,y,'R'));});
  add('soulEater',s=>{s.disc(8,8,7,'o');s.disc(8,8,6,'v');s.disc(8,8,4,'d');s.box(6,4,4,7,'h');s.box(5,5,6,4,'w');s.p(6,6,'R');s.p(9,6,'R');s.line(6,10,3,13,'h');s.line(9,10,12,13,'h');});
  add('fuwalafuwaloo',s=>{s.line(1,13,13,1,'R');s.line(2,14,14,2,'Y');s.line(1,2,13,14,'v');s.line(2,1,14,13,'B');s.disc(8,8,3,'R');sparkle(s,8,8);});
  add('laBorra',s=>{s.box(6,0,4,3,'Y');s.box(5,3,6,4,'o');s.disc(8,10,6,'o');s.disc(8,10,5,'b');s.box(4,7,9,3,'B');s.box(5,10,7,3,'v');s.p(5,8,'w');s.p(10,12,'f');});
  add('phieraggi',s=>{s.box(1,3,6,4,'o');s.box(9,3,6,4,'o');s.box(2,4,4,2,'R');s.box(10,4,4,2,'B');s.box(4,7,2,6,'y');s.box(10,7,2,6,'y');s.line(7,6,8,12,'Y');sparkle(s,8,13);});
  add('thunderloop',s=>{s.disc(8,8,6,'Y');s.disc(8,8,4,'.');s.line(9,1,5,8,'B');s.box(5,7,7,2,'w');s.line(11,8,6,15,'B');s.p(3,2,'Y');s.p(13,13,'Y');});
  add('vandalier',s=>{s.box(7,4,3,7,'v');s.box(8,2,3,3,'w');s.p(11,3,'Y');for(let j=0;j<5;j++){s.line(6-j,3+j,6,9+j,j%2?'B':'w');s.line(10+j,4+j,10,9+j,j%2?'R':'Y');}s.line(8,10,5,15,'R');s.line(9,10,11,15,'B');});
  add('infiniteCorridor',s=>{s.box(2,2,12,12,'Y');s.box(3,3,10,10,'d');s.box(5,5,6,7,'B');s.box(6,6,4,6,'d');s.box(7,8,2,4,'w');s.line(2,14,6,11,'v');s.line(14,14,10,11,'v');});
  add('mannajja',s=>{s.line(3,2,3,13,'v');s.line(7,1,7,12,'Y');s.line(11,3,11,14,'R');s.disc(5,11,3,'o');s.disc(5,11,2,'v');s.disc(10,10,3,'o');s.disc(10,10,2,'R');s.line(6,3,12,5,'Y');});
  add('gorgeousMoon',s=>{s.disc(8,8,6,'Y');s.disc(10,6,5,'d');s.p(4,7,'f');sparkle(s,11,10,'w');sparkle(s,3,2,'B');sparkle(s,13,2,'Y');});
  // Family variants retain identity but use a new dominant hue or accent.
  for(const [k,b,m] of [['crown0','crown',{Y:'y',f:'Y'}],['crown2','crown',{y:'b',Y:'B',v:'w'}],['hollowHeart0','hollowHeart',{R:'r',w:'h'}],['hollowHeart2','hollowHeart',{R:'v',r:'b',w:'B'}],['pummarola0','pummarola',{R:'r',w:'h'}],['pummarola2','pummarola',{R:'Y',r:'y'}],['stoneMask0','stoneMask',{h:'s',w:'h'}],['stoneMask2','stoneMask',{h:'Y',s:'y',w:'f'}],['goldRing','bracelet',{}],['silverRing','bracelet',{Y:'h',B:'w'}],['attractorb','vacuum',{Y:'B'}],['armor3','wildDefence',{B:'Y',b:'y'}],['garlic','soulEater',{v:'g',h:'w',R:'g'}],['cat','viciousHunger',{v:'g',R:'l'}],['bible','unholyVespers',{v:'b',r:'b',Y:'w'}],['shadowPinion','valkyrieTurner',{R:'s',Y:'h'}],['water','laBorra',{v:'B',Y:'h'}],['lightning','thunderloop',{Y:'b',B:'Y'}],['clockLancet','orologion',{Y:'h',R:'B'}],['pentagram','gorgeousMoon',{Y:'v',B:'R'}],['songOfMana','mannajja',{R:'B',v:'b'}],['ventoSacro','bloodyTear',{R:'B',r:'b'}],['runetracer','noFuture',{R:'g',Y:'l'}],['peachone','vandalier',{v:'w',R:'w',B:'h',Y:'w'}],['ebonyWings','vandalier',{w:'s',B:'v',Y:'h'}],['eightSparrow','phieraggi',{R:'B',Y:'w'}],['phiera','phieraggi',{B:'R',Y:'y'}]])copy(k,b,m);
  add('garlic',s=>{s.line(7,1,8,6,'g');s.line(9,1,8,6,'l');s.disc(5,10,4,'h');s.disc(11,10,4,'h');s.disc(8,10,5,'w');s.line(6,6,6,13,'h');s.line(10,6,10,13,'h');s.box(6,14,5,1,'y');s.p(7,8,'f');});
  add('cat',s=>{s.box(3,5,10,7,'o');s.line(3,1,7,6,'o');s.line(12,1,8,6,'o');s.box(4,6,8,6,'s');s.p(4,3,'r');s.p(11,3,'r');s.box(4,7,3,2,'l');s.box(9,7,3,2,'l');s.p(5,7,'o');s.p(10,7,'o');s.p(8,10,'R');s.line(1,9,4,10,'h');s.line(14,9,11,10,'h');s.box(6,12,5,2,'o');});
  add('pentagram',s=>{const pts=[[8,1],[12,14],[1,6],[15,6],[4,14],[8,1]];for(let i=1;i<pts.length;i++)s.line(...pts[i-1],...pts[i],'v');sparkle(s,8,8,'R');s.p(8,1,'f');});
  root.PixelAssets??={palette:{},sprites:{},manifest:[]};Object.assign(root.PixelAssets.palette,palette);Object.assign(root.PixelAssets.sprites,sprites);
  const data={version:10,size:16,palette,sprites,source:'Original authored integer-pixel drawings; no original-game image assets.'};root.PixelArtV10=data;if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(typeof globalThis!=='undefined'?globalThis:this);
