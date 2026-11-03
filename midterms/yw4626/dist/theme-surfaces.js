/* Code-native 64px surfaces sampled by the existing perspective renderer. */
(function(root){
 const cache=new Map();
 const noise=(x,y)=>{let n=Math.imul(x+271,y+819)^Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return(n>>>24)/255;};
 function wall(mx,my,floor){
  const variant=Math.abs(mx*17+my*29)%7;
  if(floor===2&&variant>1)return null;const key=[mx,my,floor].join(',');if(cache.has(key))return cache.get(key);
  const data=new Uint8ClampedArray(64*64*3),seed=mx*31+my*73;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const g=noise(x+seed,y)*18,brickY=y%12,brickX=(x+(Math.floor(y/12)%2)*12)%24;let c;
   if(floor===1){
    // Dense hedge, stone plinth and rose clusters; the sky remains above it.
    c=y>51?(brickY<2||brickX<2?[35,39,39]:[63+g,66+g,59+g]):[24+g*.5,37+g*.9,30+g*.6];
    if(y<52){const leaf=noise(Math.floor(x/3)+seed,Math.floor(y/3));if(leaf>.72)c=[42+g,54+g,35+g];if(leaf<.1)c=[16,25,23];if(leaf>.96&&y>15)c=[91+g,39+g*.4,45+g*.5];}
    if(variant<2&&y<53){c=[20+g*.3,29+g*.5,29+g*.4];if(x%12<2||y===15||y===45)c=x%12===0?[78,78,72]:[40,44,46];if(y<9&&Math.abs(x%12-1)<(y>4?2:1))c=[66,69,65];}
    if(variant===3&&x>24&&x<40&&y>22){c=brickY<2?[33,36,37]:[64+g,66+g,61+g];if(y===24||y===43)c=[95,91,77];}
   }else if(floor===2){
    c=brickY<2||brickX<2?[31,27,33]:[62+g,48+g*.7,44+g*.6];
    const arch=y>10+Math.abs(x-32)*.6&&x>13&&x<51&&y<58;
    if(arch){c=[17,25,36];if(x%12<2||y===34)c=[94,81,68];if(x>29&&x<35&&y>15)c=[67,76,91];}
    if(variant===1&&x>20&&x<44&&y>15&&y<50){c=[53+g,23,32];if(x<23||x>40||y<18||y>46)c=[118,91,57];if(x>28&&x<36&&y>25&&y<38)c=[91,80,66];}
   }else if(floor===3){
    c=brickY<2||brickX<2?[34,34,34]:[69+g,66+g,55+g];
    if(y>47&&noise(x+seed,y)>.6)c=[43,66+g,43];
    if((mx+my)%3===0&&x>13&&x<51&&y>28&&y<61){const edge=x<17||x>47;c=edge?[50,32,25]:[103+g,68+g*.7,40];if(y===34||y===35||y===53||y===54)c=[55+g,62+g,61+g];}
   }else if(floor===4){
    c=brickY<2||brickX<2?[25,32,42]:[56+g,65+g,76+g];
    if(x>7&&x<57&&y>5&&y<59){c=[13+g*.35,20+g*.4,29+g*.5];if(x%10<3)c=x%10===1?[125,139,147]:[65,80,94];if(y===13||y===47)c=[76,90,104];}
   }else{
    c=brickY<2||brickX<2?[29,18,34]:[58+g,37+g*.55,55+g];
    if(x<5||x>58)c=[92+g,82+g,97+g];
    if(x>16&&x<48&&y>7&&y<55){const fold=(x%8);c=[64+fold*6,12+g*.3,33+g*.4];if(y<10||y>51)c=[160,117,62];}
    if(x>29&&x<35&&y>18&&y<43)c=y<27?[180,137,72]:[149,100,60];
   }
   // Localized masonry wear, sconces, chains and webs; deterministic per wall.
   if(floor===3&&variant===1&&x<20&&y<18&&((x+y)%7===0||x===y))c=[94,98,89];
   if(floor===4&&variant===2&&Math.abs(x-(30+Math.round(Math.sin(y*.4))))<2&&y<40)c=y%5<3?[115,117,109]:[30,32,37];
   if(floor>1&&variant===5&&x>26&&x<38&&y>19&&y<45){if(y>34)c=[99,78,46];else if(x>29&&x<34&&y>24)c=y<30?[188,133,66]:[160,150,116];}
   if(floor===5&&variant===1&&y>8&&y<58&&x>17&&x<47){c=[15,20,31];if(x%8<2||y===26||y===43)c=[94,72,62];else if((x+y)%13<4)c=[78,29,45];}
   if(floor!==1&&noise(Math.floor(x/5)+seed,Math.floor(y/5))>.94&&((x+y)%9===0))c=c.map(v=>v*.5);
   const i=(y*64+x)*3;data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];
  }
  cache.set(key,data);return data;
 }
 function plane(floor,{ceiling,x,y,W,H,tx,ty,u,v,grain,room,boundary}){
  if(floor===2)return null;
  if(floor===1){
   if(ceiling){const h=y/(H*.5),cloud=noise(Math.floor(x/36),Math.floor(y/10));if(y<H*.28&&cloud>.77)return [30,37,49];return [13+h*17,18+h*21,29+h*23];}
   const path=room?boundary<.22:(u>.25&&u<.75||v>.25&&v<.75);
   const fallen=noise(Math.floor(tx/3),Math.floor(ty/3));if(fallen>.96&&(tx+ty)%3)return [69+grain*18,49+grain*13,33+grain*10];
   if(path){const seam=tx%16===0||ty%16===0,crack=(tx+ty*2)%47===0;return seam||crack?[30,35,33]:[72+grain*22,74+grain*19,64+grain*15];}
   return [25+grain*17,38+grain*22,29+grain*14];
  }
  if(ceiling){const seam=tx%24===0||ty%24===0;return seam?[20,21,29]:floor===3?[40+grain*12,38+grain*10,32+grain*8]:floor===4?[27+grain*12,34+grain*12,45+grain*12]:[29+grain*14,18+grain*7,35+grain*16];}
  const seam=((tx%16)+16)%16<1||((ty%16)+16)%16<1;
  if(floor===3){const wet=noise(Math.floor(tx/13),Math.floor(ty/13))>.75;return seam?[25,28,27]:wet?[29+grain*10,42+grain*14,44+grain*15]:[61+grain*23,59+grain*22,45+grain*14];}
  if(floor===4){const drain=Math.abs(tx%64)<9&&Math.abs(ty%64)<11;return drain?(tx%4<2?[13,18,25]:[67,74,78]):seam?[24,28,35]:[55+grain*21,64+grain*23,72+grain*24];}
  if(room&&boundary>.14)return boundary<.19?[177,132,65]:[90+grain*23,20+grain*8,41+grain*14];
  const tile=(Math.floor(tx/16)+Math.floor(ty/16))%2===0;return seam?[25,20,32]:tile?[82+grain*14,74+grain*13,91+grain*17]:[47+grain*12,40+grain*12,58+grain*14];
 }
 root.ThemeSurfaces={wall,plane};
})(globalThis);
