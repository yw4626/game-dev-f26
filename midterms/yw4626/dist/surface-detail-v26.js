/* Repository-authored material detail compiled to 64px textures; topology is unchanged. */
(function(root){
 'use strict';
 const original=root.ThemeSurfaces,cache=new Map(),N=128;
 const noise=(x,y,s=0)=>{let n=Math.imul(x+271+s,374761393)^Math.imul(y+819,668265263);n=Math.imul(n^(n>>>13),1274126177);return(n>>>24)/255;};
 const books=[[96,49,48],[53,74,78],[63,77,51],[112,87,51],[74,57,83],[106,92,72]];
 function wall(mx,my,floor){
  const key=[mx,my,floor].join(':');if(cache.has(key))return cache.get(key);
  const a=new Uint8ClampedArray(N*N*3),seed=mx*37+my*83,variant=Math.abs(seed)%7;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   const n=noise(x,y,seed),grain=(n-.5)*13,row=Math.floor(y/18),bx=(x+(row%2)*19)%38,by=y%18;let c;
   const mortar=bx<1||by<1,edge=bx===1||by===1,chip=noise(Math.floor(x/3),Math.floor(y/2),seed)>.94&&by<4;
   if(floor===1){
    const leaf=noise(Math.floor(x/5),Math.floor(y/4),seed),rim=(x+2*y)%7===0;
    c=y>102?(mortar?[25,31,31]:[61+grain,64+grain,57+grain]):leaf>.75?[41+grain,55+grain,37+grain]:[24+grain*.6,38+grain,29+grain*.6];
    if(rim&&y<102)c=c.map((v,i)=>v+(i===1?8:3));
    if(leaf>.97&&x%5>1&&y%4>1&&y>25&&y<99)c=[81+grain,36+grain,42+grain];
    if(variant<2&&y<104){c=[19+grain*.4,28+grain*.4,28+grain*.4];if(x%20<3||y===33||y===88)c=x%20===1?[85,85,77]:[43,48,47];if(y<22&&Math.abs(x%20-1)<Math.max(0,3-Math.abs(y-12)/4))c=[87,87,78];}
    if(variant===3&&x>49&&x<79&&y>31)c=mortar?[24,29,29]:edge?[83,82,69]:[61+grain,64+grain,57+grain];
   }else if(floor===2){
    const shelf=y%37,frame=x<7||x>120||shelf<5;
    c=frame?[78+grain,48+grain*.6,36+grain*.4]:[18,17,24];
    if(frame&&(x===3||x===123||shelf===2))c=[119,84,51];
    if(!frame){const spine=x%11,book=Math.floor(x/11),h=20+Math.floor(noise(book,Math.floor(y/37),seed)*12);if(shelf>36-h){c=books[(book+row+Math.abs(seed))%books.length].map(v=>v+grain*.45);if(spine===0)c=[20,18,23];else if(spine===1)c=c.map(v=>v+18);if((shelf===30||shelf===14)&&spine>2&&spine<9)c=[146,117,66];}}
    if(variant===1&&x>33&&x<95&&y>12&&y<109){const frame=x<37||x>91||y<16||y>105;c=frame?[112+grain,84+grain,55+grain]:[23,28,39];if(!frame&&(x===64||y===63))c=[91,88,75];}
   }else{
    const base=floor===3?[68,66,56]:floor===4?[58,65,72]:[59,42,58];c=mortar||chip?[23,25,29]:base.map(v=>v+grain+(edge?12:0));
    if(!mortar&&((x+Math.floor(y/5))%83===0||bx===36&&by>3))c=c.map(v=>v*.65);
    if(floor===3&&y>88&&noise(Math.floor(x/3),Math.floor(y/4),seed)>.57)c=[34+grain,49+grain,37+grain];
    if(floor===3&&variant===1&&x<42&&y<38&&(Math.abs(x-y)<1||(x+y)%16===0))c=[100,101,88];
    if(floor===4&&variant<3&&x>15&&x<114&&y>11&&y<118){c=[15+grain*.3,22+grain*.3,29+grain*.3];if(x%17<4)c=x%17===1?[108,115,116]:[56,66,75];if(y===28||y===93)c=[77,86,92];}
    if(floor===4&&variant===4&&Math.abs(x-(63+Math.round(Math.sin(y*.28)*2)))<3&&y<85)c=y%10<6?[109,107,98]:[31,32,37];
    if(floor===5){if(x<6||x>121)c=[87+grain,77+grain,84+grain];if(x>26&&x<103&&y>12&&y<113){const fold=x%13;c=[55+fold*2+grain*.3,20+grain*.3,34+grain*.4];if(y<15||y>110)c=[135,103,60];}if(variant===1&&x>34&&x<94&&y>15&&y<112){c=[24,31,43];if(x%13<2||y%27<2)c=[99,82,63];else if((x+y)%19<8)c=[83,41,53];else c=[48,66,79];}}
   }
   if(floor>1&&variant===5&&x>54&&x<75&&y>36&&y<88){if(y>70)c=[91,74,52];else if(x>59&&x<67&&y>43)c=y<57?[181,135,70]:[128,111,75];}
   const i=(y*N+x)*3;a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];
  }
  const reduced=new Uint8ClampedArray(64*64*3);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const to=(y*64+x)*3,from=(y*2*N+x*2)*3;reduced.set(a.subarray(from,from+3),to);}
  if(cache.size>512)cache.delete(cache.keys().next().value);cache.set(key,reduced);return reduced;
 }
 function plane(floor,p){
  let base=original.plane(floor,p);if(!base)return null;
  if(p.ceiling&&floor===1){const cloud=noise(Math.floor(p.x/9),Math.floor(p.y/4),7);return base.map((v,i)=>v+(cloud>.7?3:0)+(i===2?2:0));}
  if(!p.ceiling){const grain=noise(p.tx*2,p.ty*2, floor);const wear=grain>.94?-11:grain<.06?7:0;base=base.map(v=>v+wear);}
  return base;
 }
 root.ThemeSurfaces={wall,plane,resolution:64};
})(globalThis);
