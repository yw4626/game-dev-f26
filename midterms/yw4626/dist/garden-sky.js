/* A cached world-space pixel panorama. Walls and the estate render over this distant sky. */
(function(root){
 'use strict';
 const W=1024,H=256,TAU=Math.PI*2,MAX_ALT=.8,MOON_YAW=-1.12,MOON_ALT=.255,MOON_RADIUS=.064;
 const data=new Uint8Array(W*H*3);
 const hash=(x,y)=>{let n=Math.imul(x+173,374761393)^Math.imul(y+59,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967296;};
 const smooth=t=>t*t*(3-2*t);
 function cloud(u,v,cells){const x=u*cells,y=v*cells/4,ix=Math.floor(x),iy=Math.floor(y),a=smooth(x-ix),b=smooth(y-iy),wrap=n=>(n%cells+cells)%cells;return (hash(wrap(ix),iy)*(1-a)+hash(wrap(ix+1),iy)*a)*(1-b)+(hash(wrap(ix),iy+1)*(1-a)+hash(wrap(ix+1),iy+1)*a)*b;}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const u=x/W,alt=y/H*MAX_ALT,yaw=u*TAU-Math.PI,dx=Math.atan2(Math.sin(yaw-MOON_YAW),Math.cos(yaw-MOON_YAW))*Math.cos(MOON_ALT),dy=alt-MOON_ALT,r=Math.hypot(dx,dy)/MOON_RADIUS;
  const t=alt/MAX_ALT;let c=[25-15*t,32-19*t,45-23*t];
  if(r<1){const crater=hash(Math.floor(dx*180),Math.floor(dy*180)),shade=crater<.24?35:crater<.5?16:0;c=[205-shade,211-shade,203-shade];}
  else if(r<1.38&&hash(x,y)>(r-1)/.38)c=[43,51,65];
  const n=cloud(u,y/H,16)*.64+cloud(u,y/H,48)*.26+cloud(u,y/H,96)*.1;
  // Dark irregular banks can pass in front of the moon; no screen-space overlay.
  const density=Math.floor(Math.max(0,Math.min(1,(n-.48)*4.2))*4)/4;
  if(density>0){const rim=n<.54?8:0,shade=[13+rim,18+rim,28+rim];c=c.map((v,i)=>v*(1-density)+shade[i]*density);}
  const i=(y*W+x)*3;data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];
 }
 function sample(yaw,alt){const x=((Math.floor((yaw+Math.PI)/TAU*W)%W)+W)%W,y=Math.max(0,Math.min(H-1,Math.floor(alt/MAX_ALT*H))),i=(y*W+x)*3;return [data[i],data[i+1],data[i+2]];}
 root.GardenSky={sample,moon:{yaw:MOON_YAW,altitude:MOON_ALT,radius:MOON_RADIUS}};
})(globalThis);
