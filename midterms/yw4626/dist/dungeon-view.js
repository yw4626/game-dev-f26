/* Procedural library and pixel raycaster; selected CC0 Kenney sprites in PixelAssets. */
(function(root){
  'use strict';
  const P={'.':null,o:'#100e20',d:'#27243d',s:'#51486b',p:'#786587',h:'#b1a0b8',w:'#e2d8c4',g:'#55756d',l:'#98b58a',r:'#913d56',R:'#e06c68',b:'#486d96',B:'#9ec2dd',y:'#aa783e',Y:'#e7bb67',f:'#f3df9a',v:'#854c88'};
  const sprites={
    ghost:[
      '......oooo......','....oohhhhoo....','...ohwwwwwwho...','..ohwwwwwww who..'.replace(' ',''),
      '..ohwddwwddwho..','..ohwddwwddwho..','..ohwwwwwwwwho..','..ohwwrrwwwwho..',
      '..ohwwwwwwwwho..','.ohwwwwwwwwwwho.','.ohhwwwwwwwwhho.','ohhwwwwwwwwwwhho',
      'ohwwwwoowwwwwoho','ohhwwo..owwwo.oo','.ohho....oho....','..oo......o.....'],
    zombie:[
      '.....oooooo.....','....oddggggo....','....odggggggo...','....ogwoggwgo...',
      '....ogggoogggo..','.....ogrrggo....','.....oogggoo....','...ooosssoooo...',
      '..ogossrssosgo..','.oggossrssosggo.','.oggosssssooggo.','..ooossssooooggo',
      '....ossdsso..oo.','....ossdsso.....','....osoodso.....','....osoodso.....',
      '....osoodso.....','...oggo.oggo....','...oooo.oooo....'],
    lion:[
      '....oo....oo....','..ooyyo..oyyoo..','.oyYYyyooyYYyyo.','oyYYYYYYYYYYYYyo',
      'oyYYyYYYYYYyYYyo','oyYywwYYYYwwyYyo','oyYyoRYyyYRoyYyo','oyYYyYYYYYYyYYyo',
      '.oyYYYyyyyYYYyo.','.oyYYyowwoyYYyo.','..oyYyorroryyo..','...oyYwwwwYyo...',
      '..ooyyyYYYyyoo..','.oysYYYYYYYYsyo.','oysooyYYYYyoosyo','oyo..oyYYyo..oyo',
      '.o....oyyo....o.','......oooo......'],
    hero:[
      '......oooo......','.....oossso.....','....ossssssso...','...ossssssssso..',
      '...ossdddddssso.','...osdwowowdso..','....oddwwwddo...','....ooodddooo...',
      '...ossssssssso..','..osssyyssssso..','.ossssyyyssssso.','.osssoyyyosssso.',
      'oyosooyyyoossso.','oyoo.oyyyoossso.','oyo..oddddoosso.','oyo..odoodoosso.',
      'oyo..odoodoosso.','oyo..odoodoooso.','ooo..oo..oo..oo.'],
    shop:[
      '.....oooooo.....','....oyyyyyyo....','...oyyyyyyyyo...','..oyYYYYYYYYyo..',
      '..ooooooooyyoo..','....owowowoo....','....owwwwwwo....','.....oyyyyo.....',
      '...ooyyyyyyoo...','..oyyysYYsyyyo..','.oyyyysYYsyyyyo.','.oyyyysYYsyyyyo.',
      '..oyoosYYsooyo..','...ooosYYsooo...','....osYYYYso....','....oyyyyyyo....',
      '..ooyyyyyyyyoo..','.oyyyyyyyyyyyyo.','.oooooooooooooo.'],
    treasure:[
      '................','................','................','...oooooooooo...',
      '..oyYYYYYYYYyo..','.oyYYYYYYYYYYyo.','.oyyyYyyYyyyyyo.','.oyyyYffYyyyyyo.',
      '.ooooYffYoooooo.','.oyyyYyyYyyyyyo.','.oyyyYyyYyyyyyo.','.oyyyyyyyyyyyyo.',
      '.oyYYYYYYYYYYyo.','..oooooooooooo..','................','................'],
    camp:[
      '................','.......R........','......Rf........','......RfR.......',
      '....R.RffR......','....RRfffR......','...RffYfffR.....','..RfYfYfYfR.....',
      '..RYYfYYfYR.....','...RYYYYYR......','....RRRRR.......','...yyoyyooyy....',
      '..oyyyoyyyyyo...','...ooyyyyoo.....','....oo..oo......','................'],
    stairs:[
      'oooooo....oooooo','osssso....osssso','osssso....osssso','osssso....osssso',
      'osssso....osssso','osssso....osssso','osssso....osssso','ossssoooooosssso',
      'ossssohhhhosssso','ossssohhhhoss sso'.replace(' ',''),'ossssoooooosssso','osssshhhhhhosss o'.replace(' ',''),
      'ossshhoooohhssso','osshhhoooohhhss o'.replace(' ',''),'oshhhhoooohhhhso','oooooooooooooooo'],
    shovel:[
      '.......oooo.....','......oyyyyo....','......oy..yo....','......oy..yo....',
      '.......oyyo.....','.......oyyo.....','.......oyyo.....','.......oyyo.....',
      '.......oyyo.....','.......oyyo.....','......oshhso....','.....oshhhho....',
      '.....oshhhho....','.....oswwwho....','......oshho.....','.......oo.......'],
    hole:[
      '................','................','................','................',
      '................','.....ssssss.....','...sshhhhhhss...','..shhsooooshhs..',
      '.shhsooooooshhs.','shhsooooooooshhs','shsooodddooooshs','shhooodddoooohhs',
      '.shhsooooooshhs.','..shhhsssshhhs..','...sshhhhhhss...','.....ssssss.....'],
    crate:[
      '................','..oooooooooooo..','.oyYYYYYYYYYYyo.','.oyyyYYYYYYyyyo.',
      '.oyYyoyyyyoyYyo.','.oyYYyoyyoyYYyo.','.oyYYYyooyYYYyo.','.oyYYYYyyYYYYyo.',
      '.oyYYYYyyYYYYyo.','.oyYYYyooyYYYyo.','.oyYYyoyyoyYYyo.','.oyYyoyyyyoyYyo.',
      '.oyyyYYYYYYyyyo.','.oyYYYYYYYYYYyo.','..oooooooooooo..','................'],
    barrel:[
      '.....oooooo.....','...ooyyyyyyoo...','..oyyyYYYYyyyo..','.osssssssssssso.',
      '.ohhhhhhhhhhhho.','.oyYyyYYyyYYyyo.','.oyYyyYYyyYYyyo.','.oyYyyYYyyYYyyo.',
      '.oyYyyYYyyYYyyo.','.oyYyyYYyyYYyyo.','.oyYyyYYyyYYyyo.','.ohhhhhhhhhhhho.',
      '.osssssssssssso.','..oyyyYYYYyyyo..','...ooyyyyyyoo...','.....oooooo.....'],
    rubble:[
      '................','................','................','................',
      '................','................','................','................',
      '.........oo.....','...oo...oyyo....','..oyyo.oyyyo....','.oyyyyooyyo..oo.',
      'oyyyyooshoo.oyyo','ooyyooshhhooyyyo','.ooooshhhooooyyo','...ooooooo..ooo.'],
    secret:[
      'ssssssssssssssss','shhhhhhhshhhhhhs','shhhhhhhshhhhhhs','shhhhhhoshhhh hhs'.replace(' ',''),
      'sssssssossssssss','shhhhhhoshhhhhhs','shhhhhhoshhhhhhs','shhhhhoshhhhhhhs',
      'ssssssosssssssss','shhhhhoshhhhhhhs','shhhhhhoshhhhhhs','shhhhohoshhhhhhs',
      'sssssossosssssss','shhhoshoshhhhhhs','shhhshhoshhhhhhs','ssssssssssssssss'],
    pickup:[
      '................','................','.........f......','........fff.....',
      '.........f......','.....oooooo.....','...ooyYYYYyoo...','..oyYYffffYYyo..',
      '..oyYfYffYfYyo..','..oyYfYffYfYyo..','..oyYfYffYfYyo..','..oyYYffffYYyo..',
      '...ooyYYYYyoo...','.....oooooo.....','................','................'],
    chicken:[
      '................','................','................','..........ww....',
      '.........wwww...','........owwoo...','.....ooooyyo....','...ooyYYYyo.....',
      '..oyYYYYYYyo....','.oyYYffYYYYyo...','.oyYffYYYYYyo...','.oyYYYYYYYyyo...',
      '..oyyyyyyyyo....','...oooooooo.....','................','................'],
    'icon-whip':[
      '................','.........yyyy...','.......yyYYYYy..','.....yyYY..yyYy.','....yYY......yY.','...yYY.......yY.','..yYY.......yY..','..yY.......yY...','..yY......yY....','...yY...yyY.....','....yyyyYY......','...ooYYy........','..osoo..........','.osso...........','..oo............','................'],
    'icon-wand':[
      '......B.........','.....BfB........','......B..B......','.......yY.......','......yY........','.....yY.........','....yY..........','...yY...........','..yY............','.yY.............','yy..............','................','................','................','................','................'],
    'icon-fire':[
      '......R.........','.....RfR........','.....RffR.......','....RfffR.......','..R.RfYfR.......','..RRfYYffR......','.RfffYYYffR.....','.RfYYYfYffR.....','..RYYfYYfR......','...RYYYR........','....yyy.........','...yy...........','..yy............','.yy.............','yy..............','................'],
    'icon-axe':[
      '......o...oo....','.....oho.ohho...','...oohhhohhhh o..'.replace(' ',''),'..ohhhhwYhhhhho.','.ohhhhwYhhhhho..','..ohhwYhhhooo...','...owYhhho......','....wYoo........','...wY...........','..wY............','.wY.............','wY..............','Y...............','................','................','................'],
    'icon-cross':[
      '......oo........','.....obBo.......','.....obBo.......','.....obBo.......','..oo obBooo......'.replace(' ',''),'.obBBwfwBBBBo...','.obBBwfwBBBBo...','..ooobBoooo.....','.....obBo.......','.....obBo.......','.....obBo.......','......oo........','................','................','................','................'],
    'icon-draw':[
      '................','.....BBBBB......','...BBfffffBB....','..BffBBBBBffB...','.BfBBbbbbbBBfB..','.BfBbbBBBbbBfB..','.BfBbbBfBbbBfB..','.BfBbbBBBbbBfB..','.BfBBbbbbbBBfB..','..BffBBBBBffB...','...BBfffffBB....','.....BBBBB......','......pp........','.....pppp.......','....pppppp......','................'],
    'icon-armor':[
      '.....oo..oo.....','...ooyYooYyoo...','..oyYYyyyyYYyo..','.oyYYYYYYYYYYyo.','.oyYYyYYYYyYYyo.','..oyyYYYYYYyyo..','...oyYYYYYYyo...','...oyYYyyYYyo...','...oyYYyyYYyo...','...oyYYYYYYyo...','...oyyyyyyyyo...','..oyYYYYYYYYyo..','..oooooooooooo..','................','................','................']
  };
  Object.assign(sprites,{
    gem:['......oo......','....ooBBoo....','...oBfBBbbo...','..oBffBBbbbo..','.oBfffBBbbbbo.','.oBBBBBBBBbbo.','..obBBBBbbbo..','...obBBbbbo...','....obBbbo....','.....obbo.....','......oo......'],
    'icon-knife':['...........ww...','..........wBw...','.........wBwo...','........wBwo....','.......wBwo.....','......wBwo......','.....wBwo.......','....wBwo........','...wBwo.........','..yyww..........','...yy...........','..yyo...........','.yyo............','..o.............'],
    'icon-cat':['..oo......oo....','..orro..orro....','..orrrrorrro....','...orrrrrro.....','..orwrrwrro.....','..ororrroro.....','...orrRrro......','....orrrroo.....','...orrrrrrro....','..orrrrrrrrro...','..orrrrrrrrroo..','..orrooorrrorro.','..orro..orro.oo.','...oo....oo.....'],
    'icon-bible':['..ooooooooooo...','..oYbbbbbbbbo...','..oYbbbbbbbbo...','..oYbbwwbbbbo...','..oYbbwwbbbbo...','..oYwwwwwwbbo...','..oYbbwwbbbbo...','..oYbbwwbbbbo...','..oYbbbbbbbbo...','..oYbbbbbbbbo...','..ooooooooooo...','..owwwwwwwwwo...','..ooooooooooo...'],
    'icon-runetracer':['......oo........','.....ovvo.......','....ovffvo......','...ovfvvfvo.....','..ovfvvvvfvo....','.ovfvvffvvfvo...','..ovfvvvvfvo....','...ovfvvfvo.....','....ovffvo......','.....ovvo.......','......oo........'],
    'icon-carrello':['................','...yyyyyyyyyy...','..oyYYYYYYYYyo..','..oyYyYYyYYyyo..','..oyYyYYyYYyyo..','..oyYYYYYYYYyo..','...oooooooooo...','....ooo..ooo....','...ohhhoohhho...','....ooo..ooo....','..ssssssssssss..'],
    'icon-celestial':['............ff..','..........fRf...','........fRRf....','......fRRRf.....','....ffRRRf......','...fRRRRf.......','..fRfffRf.......','.fRffYYRf.......','.fRfYYYRf.......','..fRYYRf........','...fRRf.........','....ff..........'],
    'icon-phiera':['................','..ooooooooooo...','..ohhhhhhhho....','..oRRRRRRRo.....','....oYoo........','....oYo.........','...oYYo.........','...oYYo.........','..oYYYo.........','...ooo..........'],
    'icon-lightning':['........fff.....','.......fff......','......fff.......','.....fff........','....fff.........','...fffffff......','.......fff......','......fff.......','.....fff........','....fff.........','...ff...........','..f.............']
  });
  sprites.gemchest=sprites.treasure.map((row,y)=>y>=5&&y<=10?row.slice(0,6)+['BB','fB','ff','BB','bb','bb'][y-5]+row.slice(8):row);
  sprites.removal=['................','......ffff......','.....fBBBBf.....','.....fBffBf.....','......fBBf......','.......ff.......','....oooooooo....','....ohhhhhoo....','....ohhBhhho....','....ohBBBhoo....','....ohhBhhho....','....ohhhhhoo....','...oooooooooo...','..ohhhhhhhhhho..','..oooooooooooo..','................'];
  sprites.treasureOpen=['..oooooooooooo..','.oyYYYYYYYYYYyo.','.oyyyyyyyyyyyyo.','.oyYyyyyyyyyYyo.','.oyYyyyyyyyyYyo.','..oooooooooooo..','..oooooooooooo..','.oyoffYffYffoyo.','.oyYfYffYffYYyo.','.ooooYffYoooooo.','.oyyyYyyYyyyyyo.','.oyyyyyyyyyyyyo.','.oyYYYYYYYYYYyo.','..oooooooooooo..','................','................'];
  const projectionCache=new WeakMap();
  // Independent cart and drop silhouettes; colors identify the guaranteed pickup.
  sprites.manaCart=[
    '................','......BBBB......','.....BfBBbB.....','....BffBBbbB....',
    '..oooooooooooo..','..oyyyyyyyyyyo..','..oyYYyYYyYYyo..','..oyyYyYYyYyyo..',
    '..oyyyyyyyyyyo..','..oyYYyYYyYYyo..','..oooooooooooo..','...oooo..oooo...',
    '..ohhho..ohhho..','..ohwho..ohwho..','...ooo....ooo...','................'];
  sprites.wildPickup=['................','....yyyyyyyy....','....ybbbbbbY....','....ybwwwwbY....','....ybwbbwby....','....ybwbbwby....','....ybwbbwby....','....ybwwwwby....','....ybbbbbbY....','....yyyyyyyy....','................','................','................','................','................','................'];
  sprites.bracerCart=sprites.manaCart.map((row,y)=>y<4?row.replaceAll('B','y').replaceAll('b','s'):row);
  sprites.manaPickup=[
    '................','.......BB.......','.....BBffBB.....','....BffffBBB....',
    '...BffBBBBbbB...','...BfBBBBBbbB...','..BfBBBBBBbbbB..','..BBBBBBBBbbbB..',
    '..BBBBBBBbbbbB..','...BBBBBbbbbB...','...BbbbbbbbbB...','....BbbbbbbB....',
    '.....BBBBBB.....','.......oo.......','................','................'];
  sprites.dealPickup=[
    '................','.....oooo.......','....oyYYyo......','...oyYYyyo......',
    '..oyYYyyyyo.....','..oyYyssyyo.....','...oysyysyyo....','...osyYYysyo....',
    '....oyYYyyso....','....osyYYyso....','.....oyyysyo....','.....osssyo.....',
    '......oyyo......','.......oo.......','................','................'];
  const tomeArt=['................','...oooooooooo...','..oywwwwwwwwyo..','..oybbbbbbbbbo..','..oybbbbbbbbbo..','..oybbYYYYbbbo..','..oybYwwwwYbbo..','..oybYwwwwYbbo..','..oybbYYYYbbbo..','..oybbbbbbbbbo..','..oybbbbbbbbbo..','..oybbbbbbbbbo..','..oywwwwwwwwyo..','...oooooooooo...','................','................'];
  sprites['icon-tome']=tomeArt;sprites['icon-lightTome']=tomeArt.map(r=>r.replaceAll('b','v'));sprites['icon-weightyTome']=tomeArt.map(r=>r.replaceAll('b','r'));sprites['icon-ancientTome']=tomeArt.map(r=>r.replaceAll('b','y'));
  sprites['icon-spinach']=['................','..........oo....','........ooglo...','......ooglllo...','.....oglllllo...','....oglllgllo...','...ogllgglllo...','...oglgllllo....','...oggglllo.....','...ogglllo......','...oggggo.......','....oggo........','....ogo.........','...ogo..........','...oo...........','................'];sprites['icon-sprig']=sprites['icon-spinach'].map(r=>r.replaceAll('g','l').replaceAll('l','Y'));
  sprites['icon-duplicator']=['................','...oooo..oooo...','..oyYYyooyYYyo..','.oyy..yYYy..yyo.','.oy....yy....yo.','.oy....yy....yo.','.oyy..yYYy..yyo.','..oyYYyooyYYyo..','...oooo..oooo...','................','................','................','................','................','................','................'];sprites['icon-duDuplicator']=sprites['icon-duplicator'].map(r=>r.replaceAll('y','b').replaceAll('Y','B'));
  sprites['icon-lightArmor']=sprites['icon-armor'].map(r=>r.replaceAll('Y','h').replaceAll('y','s'));sprites['icon-rainbowArmor']=sprites['icon-armor'].map((r,i)=>r.replaceAll('Y',['R','B','l'][i%3]));sprites['icon-bracer']=sprites.dealPickup;
  Object.assign(P,root.PixelAssets?.palette||{});
  function sprite(name){return root.PixelAssets?.sprites?.[name]||sprites[name]||sprites.ghost;}
  function art(name,cls=''){
    const rows=sprite(name.replace(/^enemy-/,'')),width=Math.max(...rows.map(r=>r.length)),height=rows.length;
    const safeClass=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
    const embedded=root.PixelAssets?.images?.[name.replace(/^enemy-/,'')];if(embedded)return `<svg xmlns="http://www.w3.org/2000/svg" class="pixel-art ${safeClass}" aria-hidden="true" viewBox="-2 -2 ${width+4} ${height+4}" shape-rendering="crispEdges"><image class="${name.startsWith('enemy-')?'enemy-idle':''}" width="${width}" height="${height}" href="${embedded}" style="image-rendering:pixelated"/></svg>`;
    let content='';
    rows.forEach((row,y)=>{for(let x=0;x<row.length;){const key=row[x],start=x;while(x<row.length&&row[x]===key)x++;if(P[key])content+=`<rect x="${start}" y="${y}" width="${x-start}" height="1" fill="${P[key]}"/>`;}});
    return `<svg xmlns="http://www.w3.org/2000/svg" class="pixel-art ${safeClass}" aria-hidden="true" viewBox="-2 -2 ${width+4} ${height+4}" shape-rendering="crispEdges">${content}</svg>`;
  }
  const rgb=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
  const colors=Object.fromEntries(Object.entries(P).filter(([,v])=>v).map(([k,v])=>[k,rgb(v)]));
  function noise(x,y){let n=Math.imul(x+271,y+819)^Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>24)/255;}
  const bookColors=[[135,47,40],[50,104,114],[90,117,65],[159,119,47],[110,66,129],[179,135,97],[49,73,130],[132,65,83]];
  const libraryTextures=new Map();
  function libraryWall(mx,my,floor){
    const seed=mx*71+my*113+floor*37,key=`${mx},${my},${floor}`;
    if(libraryTextures.has(key))return libraryTextures.get(key);
    const pixels=new Uint8ClampedArray(64*64*3),panel=noise(mx+floor,my)<.16;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const grain=noise(x+seed,y)*12-6,wood=[91+grain,40+grain*.5,34+grain*.6];let c=wood;
      const frame=x<5||x>58,rail=y<5||y>57||y===31||y===32;
      if(frame||rail){
        const edge=x===1||x===4||x===59||y===2||y===4||y===58;
        c=edge?[166+grain,85+grain,56+grain]:x===0||x===63||y===0||y===63?[26,15,24]:wood;
        if(frame&&y>8&&y<55&&x%3===0)c=[115+grain,52+grain,44+grain];
        if((y===3||y===59)&&x>7&&x<57&&x%8===0)c=[196,143,78];
      }else if(panel){
        const groove=(x+2)%13;
        c=groove<2?[43,22,29]:groove===2?[129+grain,64+grain,47+grain]:[77+grain,31+grain*.5,32+grain*.5];
        if(y===10||y===52)c=[138,70,48];
        // Brass wall candle, painted into the wall texture and depth-tested with it.
        if(x>28&&x<36&&y>17&&y<40){
          if(y>34)c=[146,102,48];else if(x>30&&x<34&&y>26)c=[224,198,142];
          else if(y>20&&y<28&&Math.abs(x-32)<(y>23?2:1))c=[255,230,146];
          else if(y>=28&&x===29)c=[73,39,28];
        }
      }else{
        const row=Math.floor((y-5)/13),ry=(y-5)%13,slot=Math.floor((x-5)/4),bx=(x-5)%4;
        const variation=noise(slot+seed,row+my*9),bookHeight=6+Math.floor(variation*4);
        c=[31+grain*.3,20+grain*.2,25+grain*.3];
        if(ry>=11)c=ry===11?[171+grain,96+grain,67+grain]:[69,31,29];
        else if(ry>=10-bookHeight&&ry<=10&&variation>.075){
          const color=bookColors[Math.min(bookColors.length-1,Math.floor(noise(slot+my*3,row+seed)*bookColors.length))];
          c=color.map((v,i)=>v+(bx===0?-25:bx===1?15:0)+(i===0?grain:grain*.3));
          if((ry===9||ry===12-bookHeight)&&bx>0&&variation>.35)c=[190,151,91];
          if(bx===3)c=[28,18,25];
        }
      }
      const i=(y*64+x)*3;pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];
    }
    if(libraryTextures.size>512)libraryTextures.clear();libraryTextures.set(key,pixels);return pixels;
  }
  const SCENE_SCALE=4,ARCH_HEIGHT=1.6,EYE_HEIGHT=.8;
  const topologyCache=new WeakMap(),renderStats={draws:0,sceneBuilds:0,battleCacheHits:0};
  const topologyStamp=state=>state.grid.join('|')+';'+Object.values(state.connections||{}).join(',')+';'+!!state.backdropOnly;
  function sceneFor(state){
    const stamp=topologyStamp(state),cached=topologyCache.get(state.grid);
    if(cached&&cached.stamp===stamp&&cached.generation===state.generation)return {...cached.scene,camera:cached.scene.anchor(state.x,state.y)};
    renderStats.sceneBuilds++;
    const scale=state.backdropOnly?1:SCENE_SCALE,logical=state.grid,width=logical[0].length*scale,height=logical.length*scale;
    const roomTiles=new Map(),logicalDirs=[[0,-1],[1,0],[0,1],[-1,0]],tileKey=(x,y)=>`${x},${y}`;
    const floor=(x,y)=>logical[y]?.[x]==='.';
    const logicalMask=(x,y)=>{
      if(!floor(x,y))return 0;
      return logicalDirs.reduce((mask,[dx,dy],dir)=>floor(x+dx,y+dy)&&(!state.connections||((state.connections[tileKey(x,y)]&(1<<dir))&&(state.connections[tileKey(x+dx,y+dy)]&(1<<((dir+2)%4)))))?mask|(1<<dir):mask,0);
    };
    const zones=state.generation?.zones||[];
    if(zones.length)zones.forEach((z,i)=>z.cells.forEach(p=>roomTiles.set(tileKey(p.x,p.y),i+1)));
    else if(state.generation?.rooms?.length)state.generation.rooms.forEach((r,i)=>{for(let y=r.y;y<r.y+r.height;y++)for(let x=r.x;x<r.x+r.width;x++)if(floor(x,y))roomTiles.set(tileKey(x,y),i+1);});
    else for(let y=0;y<logical.length;y++)for(let x=0;x<logical[y].length;x++)if(floor(x,y))roomTiles.set(tileKey(x,y),1);
    const cells=Array.from({length:height},()=>Array(width).fill('#')),roomOwner=new Uint8Array(width*height),masks=new Uint8Array(width*height);
    for(let y=0;y<logical.length;y++)for(let x=0;x<logical[y].length;x++){
      if(!floor(x,y))continue;const room=roomTiles.get(tileKey(x,y))||0,mask=logicalMask(x,y);
      for(let v=0;v<scale;v++)for(let u=0;u<scale;u++){
        // Rooms occupy their full tile footprint; corridors keep a two-cell lane.
        const horizontal=v===1||v===2,vertical=u===1||u===2;
        const open=room||(horizontal&&vertical)||(vertical&&((v<2&&(mask&1))||(v>=2&&(mask&4))))||(horizontal&&((u<2&&(mask&8))||(u>=2&&(mask&2))));
        const partition=scale>1&&room&&((u===0&&floor(x-1,y)&&!(mask&8))||(u===scale-1&&floor(x+1,y)&&!(mask&2))||(v===0&&floor(x,y-1)&&!(mask&1))||(v===scale-1&&floor(x,y+1)&&!(mask&4)));
        if(open&&!partition){const mx=x*scale+u,my=y*scale+v;cells[my][mx]='.';roomOwner[my*width+mx]=room;}
      }
    }
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(cells[y][x]==='.'){
      const lx=Math.floor(x/scale),ly=Math.floor(y/scale),mask=logicalMask(lx,ly);
      logicalDirs.forEach(([dx,dy],dir)=>{const nx=x+dx,ny=y+dy;if(cells[ny]?.[nx]!=='.')return;const same=Math.floor(nx/scale)===lx&&Math.floor(ny/scale)===ly;if(same||(mask&(1<<dir)))masks[y*width+x]|=1<<dir;});
    }
    const anchor=(x,y,side=false)=>{
      if(!side||!roomTiles.has(tileKey(x,y)))return {x:(x+.5)*scale,y:(y+.5)*scale};
      // Stable corner-side placement stays within the original interaction tile.
      const mask=logicalMask(x,y),choices=[[.38,.38],[.62,.38],[.38,.62],[.62,.62]],preferred=(x+y)%2?1:2;
      const score=([u,v],i)=>(!(mask&8)&&u<.5?2:0)+(!(mask&2)&&u>.5?2:0)+(!(mask&1)&&v<.5?2:0)+(!(mask&4)&&v>.5?2:0)+(i===preferred?.25:0);
      const selected=choices.reduce((best,p,i)=>score(p,i)>score(choices[best],best)?i:best,0),[u,v]=choices[selected];
      return {x:(x+u)*scale,y:(y+v)*scale};
    };
    const scene={scale,width,height,grid:cells.map(r=>r.join('')),masks,roomOwner,camera:anchor(state.x,state.y),anchor,logicalMask};
    topologyCache.set(state.grid,{stamp,generation:state.generation,scene});return scene;
  }
  const frameBuffers=new WeakMap();
  const skyProjectionCache=new Map();
  function skyProjection(W,H,half,fov){
    const key=[W,H,half,fov].join(':');let p=skyProjectionCache.get(key);if(p)return p;
    const yaw=new Float64Array(W),altitude=new Float64Array(W*Math.ceil(half));
    for(let x=0;x<W;x++){const cam=(2*x/W-1)*fov; yaw[x]=Math.atan(cam);const length=Math.sqrt(1+cam*cam);for(let y=0;y<half;y++)altitude[y*W+x]=Math.atan((half-y)/H/length);}
    p={yaw,altitude};if(skyProjectionCache.size>=4)skyProjectionCache.clear();skyProjectionCache.set(key,p);return p;
  }
  function* drawSteps(canvas,state,options={}){
    if(!canvas||!state?.grid)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    renderStats.draws++;
    const W=canvas.width||480,H=canvas.height||270,half=H*(options.horizon??.44),eyeHeight=options.eyeHeight??EYE_HEIGHT,step=1,floor=state.floor||1,archHeight=floor===1?1.05:ARCH_HEIGHT;
    ctx.imageSmoothingEnabled=false;
    let buffer=frameBuffers.get(canvas);if(!buffer||buffer.W!==W||buffer.H!==H){buffer={W,H,pixels:ctx.createImageData(W,H),covered:new Uint8Array(W*H)};frameBuffers.set(canvas,buffer);}const pixels=buffer.pixels,data=pixels.data,covered=buffer.covered;covered.fill(0);let markingWalls=true;
    const sky=floor===1&&root.GardenSky?skyProjection(W,H,half,.78):null;
    const put=(x,y,r,g,b)=>{const index=y*W+x,i=index*4;if(markingWalls)covered[index]=1;data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;};
    const scene=sceneFor(state),grid=scene.grid,angle=(state.dir%4)*Math.PI*.5-Math.PI*.5;
    const world=typeof module!=='undefined'&&module.exports?require('./dungeon.js'):root.CrawlerDungeon,house=world?.landmark(state);
    const estateDirection=house&&world.dirs[house.dir],estateCenter=house&&scene.anchor(house.x,house.y);
    let px=scene.camera.x,py=scene.camera.y;
    if(options.retreat){const back=(state.dir+2)%4;for(let i=0;i<4;i++){const nx=px-Math.cos(angle)*options.retreat/4,ny=py-Math.sin(angle)*options.retreat/4,ox=Math.floor(px),oy=Math.floor(py),cx=Math.floor(nx),cy=Math.floor(ny);if(grid[cy]?.[cx]!=='.'||((cx!==ox||cy!==oy)&&!(scene.masks[oy*scene.width+ox]&(1<<back))))break;px=nx;py=ny;}}
    const fx=Math.cos(angle),fy=Math.sin(angle),rx=-fy,ry=fx,fov=.78;
    // Use one projected facade for both the fence opening and the building.
    // A close view crops the roof naturally instead of shrinking the estate inside the opening.
    let estateFacade=null;
    if(house){
      const gx=estateCenter.x+estateDirection.x*scene.scale*.5-px,gy=estateCenter.y+estateDirection.y*scene.scale*.5-py;
      const gd=gx*fx+gy*fy;
      if(gd>.2){const center=W/2+(gx*rx+gy*ry)/gd/fov*W/2,width=Math.min(W*1.15,W/(2*fov)*8.6/gd);estateFacade={left:center-width/2,width};}
    }
    const depths=new Float32Array(W),wallTops=new Float32Array(W),wall=(x,y)=>!grid[y]||!grid[y][x]||grid[y][x]==='#';
    const ownerAt=(x,y)=>x>=0&&y>=0&&x<scene.width&&y<scene.height?scene.roomOwner[y*scene.width+x]:0;
    const openEdge=(x,y,dir)=>x>=0&&y>=0&&x<scene.width&&y<scene.height&&!!(scene.masks[y*scene.width+x]&(1<<dir));
    for(let x=0;x<W;x+=step){
      if(options.sliced&&x&&x%48===0)yield;
      const cam=(2*(x+.5)/W-1)*fov,dx=fx+rx*cam,dy=fy+ry*cam;
      let mx=Math.floor(px),my=Math.floor(py),sx=dx<0?-1:1,sy=dy<0?-1:1;
      const deltaX=Math.abs(1/(dx||1e-10)),deltaY=Math.abs(1/(dy||1e-10));
      let sideX=(dx<0?px-mx:mx+1-px)*deltaX,sideY=(dy<0?py-my:my+1-py)*deltaY,side=0;
      let doorFrame=false;
      for(let n=0;n<scene.width+scene.height+4;n++){
        const ox=mx,oy=my;
        if(sideX<sideY){sideX+=deltaX;mx+=sx;side=0;}else{sideY+=deltaY;my+=sy;side=1;}
        const dir=side===0?(sx>0?1:3):(sy>0?2:0);
        const closed=!(scene.masks[oy*scene.width+ox]&(1<<dir));
        if(wall(mx,my)||closed){doorFrame=!!ownerAt(ox,oy)&&state.grid[Math.floor(my/scene.scale)]?.[Math.floor(mx/scene.scale)]==='.'&&!ownerAt(mx,my);break;}
      }
      const distance=Math.max(.05,side===0?sideX-deltaX:sideY-deltaY),height=H*archHeight/distance,top=half-H*(archHeight-eyeHeight)/distance;
      // The estate entrance has an open approach, not a hedge/fence pasted over its facade.
      // Only omit the boundary immediately in front of this fixed landmark; other garden walls still occlude.
      if(house){
        const hx=px+distance*dx-estateCenter.x,hy=py+distance*dy-estateCenter.y;
        const along=hx*estateDirection.x+hy*estateDirection.y,lateral=Math.abs(hx*estateDirection.y-hy*estateDirection.x);
        const facing=dx*estateDirection.x+dy*estateDirection.y;
        if(estateFacade&&x>=estateFacade.left&&x<estateFacade.left+estateFacade.width&&facing>0&&along>=-.01&&along<=scene.scale*1.2+.01&&lateral<=4.3){depths[x]=Infinity;wallTops[x]=H;if(x+1<W){depths[x+1]=Infinity;wallTops[x+1]=H;}continue;}
      }
      depths[x]=distance;wallTops[x]=top;if(x+1<W){depths[x+1]=distance;wallTops[x+1]=top;}
      let impact=side===0?py+distance*dy:px+distance*dx;impact-=Math.floor(impact);
      const tx0=impact,shade=Math.max(.28,(side?.88:1)/(1+distance*.032)),texture=root.ThemeSurfaces?.wall(mx,my,floor)||libraryWall(mx,my,floor),textureSize=Math.round(Math.sqrt(texture.length/3)),tx=Math.floor(tx0*textureSize);
      if(floor===1){
        // World-anchored foliage breaks the ruler-straight skyline without a blurred overlay.
        const edgeU=side===0?py+distance*dy:px+distance*dx,branch=Math.floor(edgeU*18),seed=mx*17+my*29;
        const crown=Math.min(18,H/distance*(.045+noise(Math.floor(edgeU*7),seed)*.1));
        const distant=crown+Math.min(12,H/distance*.06)*(1+noise(Math.floor(edgeU*3),seed+7));
        for(let y=Math.max(0,Math.floor(top-distant));y<Math.min(H,top);y++){
          const rise=(top-y)/Math.max(1,crown),grain=noise(branch,Math.floor((top-y)*distance/H*90));
          if(rise>1){if(grain>.3&&rise<1.6)put(x,y,18,26,29);continue;}
          if(rise>.72&&grain<.28)continue;
          const glint=grain>.7?5:0;put(x,y,(23+glint)*shade,(35+glint)*shade,(28+glint)*shade);
        }
        wallTops[x]=top-crown;
      }
      const secret=typeof state.secretAt==='function'?state.secretAt(Math.floor(mx/scene.scale),Math.floor(my/scene.scale)):null;
      for(let y=Math.max(0,Math.floor(top/step)*step);y<Math.min(H,top+height);y+=step){
        const ty=Math.max(0,Math.min(textureSize-1,Math.floor((y-top)/height*textureSize))),index=(ty*textureSize+tx)*3;
        let v=0;
        // Secret cracks are part of the struck wall texture, never a through-wall billboard.
        const crackX=tx*64/textureSize,crackY=ty*64/textureSize;
        if(secret&&!secret.opened&&crackY>5&&crackY<59){
          const crack=[29,31,28,32,35,32,30,33][Math.floor(crackY/8)];
          const branch=crackY>22&&crackY<36&&Math.abs(crackX-(30-(crackY-22)))<1.5;
          if(Math.abs(crackX-crack)<(secret.discovered?2:1)||branch)v-=secret.discovered?43:23;
          else if(Math.abs(crackX-crack-2)<1)v+=secret.discovered?13:5;
        }
        const warm=1+Math.max(0,1-distance/12)*.12;
        if(doorFrame&&floor===2){const trim=tx<5||tx>58||ty<3||ty>60;put(x,y,(trim?175:75)*shade,(trim?115:36)*shade,(trim?66:35)*shade);}
        else put(x,y,(texture[index]+v)*shade*warm,(texture[index+1]+v)*shade,(texture[index+2]+v)*shade*.95);
      }
    }
    markingWalls=false;
    // Perspective floor/ceiling sampling from the same camera as the wall rays.
    for(let y=0;y<H;y+=step){
      if(options.sliced&&y&&y%24===0)yield;
      const ceiling=y<half,dist=H*(ceiling?ARCH_HEIGHT-eyeHeight:eyeHeight)/Math.max(1,Math.abs(y-half)),shade=Math.max(.24,1/(1+dist*.035));
      for(let x=0;x<W;x+=step){
        if(covered[y*W+x])continue;
        const cam=(2*x/W-1)*fov,wx=px+dist*(fx+rx*cam),wy=py+dist*(fy+ry*cam);
        if(floor===1&&ceiling&&root.GardenSky){const c=root.GardenSky.sample(angle+sky.yaw[x],sky.altitude[y*W+x]);put(x,y,c[0],c[1],c[2]);continue;}
        const tx=Math.floor(wx*64),ty=Math.floor(wy*64),cx=Math.floor(wx),cy=Math.floor(wy),u=wx-cx,v=wy-cy,grain=noise(tx,ty);
        const boundary=Math.min(openEdge(cx,cy,3)?1:u,openEdge(cx,cy,1)?1:1-u,openEdge(cx,cy,0)?1:v,openEdge(cx,cy,2)?1:1-v);
        const themed=root.ThemeSurfaces?.plane(floor,{ceiling,x,y,W,H,tx,ty,u,v,grain,room:ownerAt(cx,cy),boundary});
        if(themed){const lighting=floor===1&&ceiling?1:shade;put(x,y,themed[0]*lighting,themed[1]*lighting,themed[2]*lighting);continue;}
        let base;
        if(ceiling){
          const beam=u<.055||v<.055,inlay=u<.085||v<.085||u>.96||v>.96,plank=((ty%12)+12)%12;
          base=beam?[22,13,23]:inlay?[108,47,38]:plank<1?[32,17,26]:[64+grain*13,26+grain*5,29+grain*6];
        }else{
          const boundary=Math.min(openEdge(cx,cy,3)?1:u,openEdge(cx,cy,1)?1:1-u,openEdge(cx,cy,0)?1:v,openEdge(cx,cy,2)?1:1-v);
          if(ownerAt(cx,cy)&&boundary>.13){
            const diamond=Math.abs(((u*2)%1)-.5)+Math.abs(((v*2)%1)-.5),weave=(tx+ty)%3===0;
            base=boundary<.17?[172+grain*20,117+grain*17,74+grain*13]:diamond>.43&&diamond<.49?[115+grain*12,45+grain*9,102+grain*14]:[79+grain*20+(weave?8:0),24+grain*9,77+grain*25];
          }else{
            const grout=((tx%16)+16)%16<1||((ty%16)+16)%16<1;
            base=grout?[59,36,40]:[119+grain*44,68+grain*28,62+grain*25];
          }
        }

        const lighting=floor===1&&ceiling?1:shade;
        put(x,y,base[0]*lighting,base[1]*lighting,base[2]*lighting);
      }
    }
    // Draw billboard pixels against the per-column depth buffer, far to near.
    const objects=[],labels=[],visible=[];projectionCache.set(canvas,visible);
    const project=p=>{const vx=p.x-px,vy=p.y-py,d=vx*fx+vy*fy,lateral=vx*rx+vy*ry;return {d,center:W/2+lateral/d/fov*W/2};};
    // The estate is a fixed landmark, rendered in exploration AND combat before victory.
    if(house)objects.push({name:'mansionDoor',...project({x:house.worldX*scene.scale,y:house.worldY*scene.scale}),x:house.x,y:house.y,landmark:true,locked:house.locked});
    if(options.entities!==false)for(let y=0;y<state.grid.length;y++)for(let x=0;x<state.grid[y].length;x++){
      if(options.hideObjects?.includes(x+','+y))continue;
      const room=typeof state.roomAt==='function'?state.roomAt(x,y):null;
      const object=typeof state.objectAt==='function'?state.objectAt(x,y):null;
      if(room&&!(room.cleared&&['battle','elite','boss','exit','treasure'].includes(room.type))&&!object?.openedChest){
        const name=room.visualKey||{battle:'ghost',elite:'zombie',boss:'lion',exit:'ghost',shop:'shop',camp:'camp',treasure:'treasure',stairs:'stairs'}[room.type];
        if(name)objects.push({name,...project(scene.anchor(x,y)),x,y,cleared:room.cleared,sealed:room.sealed,encounter:['battle','elite','boss','exit'].includes(room.type)});
      }
      if(object&&object.active!==false&&!object.broken&&['gargoyle','crate','barrel','manaCart','bracerCart','shovel','hole','pickup','rubble','gemchest','removal'].includes(object.type)){
        const name=object.type==='gargoyle'?'lion':object.type==='pickup'&&object.reward?.kind==='card'?'wildPickup':object.type==='pickup'?({heal:'chicken',mana:'manaPickup',deal:'dealPickup'}[object.reward?.kind]||'pickup'):object.type;
        const point=project(scene.anchor(x,y,!object.openedChest&&!['shovel','hole'].includes(object.type)));
        if(object.openedChest)objects.push({name:'treasureOpen',...point,x,y});
        objects.push({name,...point,object:true,x,y,coinLift:object.openedChest?.42:0});
      }
    }
    objects.filter(obj=>obj.d>.2&&obj.d<56&&obj.center>=-W&&obj.center<=W*2).sort((a,b)=>b.d-a.d).forEach(obj=>{
      const rows=root.PixelAssets?.detailSprites?.[obj.name]||sprite(obj.name),sw=Math.max(...rows.map(r=>r.length)),sh=rows.length;
      const objectScale={mansionDoor:5.4,crate:.65,barrel:.75,manaCart:.8,bracerCart:.8,shovel:.9,hole:.2,pickup:.32,wildPickup:.6,manaPickup:.4,dealPickup:.4,chicken:.32,rubble:.2}[obj.name]||(obj.encounter?.95:.9);
      const groundBottom=half+H/obj.d*(eyeHeight-(obj.coinLift||0));
      const scale=obj.landmark&&estateFacade?estateFacade.width/sw:H/obj.d*objectScale/sh,height=sh*scale,width=sw*scale*(obj.name==='hole'?2:1),bottom=groundBottom,top=bottom-height,left=obj.landmark&&estateFacade?estateFacade.left:obj.center-width*.5;
      if(obj.landmark||obj.center>=0&&obj.center<W&&obj.d<=depths[Math.floor(obj.center)]+.02)visible.push({x:obj.x,y:obj.y,name:obj.name,left,top,width,height});
      const shade=Math.max(.3,1/(1+obj.d*.03))*(obj.cleared&&obj.name==='treasure'?.48:1);
      if(obj.landmark){
        // A shallow stone footing and central approach bridge transparent sprite pixels to the ground.
        // Keep this in the building's depth layer, so nearer walls and enemies remain in front.
        const apron=Math.max(3,Math.min(14,H/obj.d*.22)),footTop=bottom-Math.max(2,scale*2),center=left+width/2;
        for(let y=Math.max(0,Math.floor(footTop));y<Math.min(H,bottom+apron);y++){
          const progress=Math.max(0,(y-bottom)/apron),span=y<bottom?width*.96:width*(.96-progress*.18);
          for(let x=Math.max(0,Math.floor(center-span/2));x<Math.min(W,center+span/2);x++){
            if(obj.d>depths[x]+.02&&y>=wallTops[x])continue;
            const edge=Math.abs(x-center)/(span/2),g=noise(Math.floor((x-left)/Math.max(1,scale)),Math.floor((y-bottom)/Math.max(1,scale)));
            if(y>=bottom&&edge>.3&&g<progress*.85+(edge-.3)*.35)continue;
            const blockW=Math.max(3,scale*8),blockH=Math.max(2,apron/3),row=Math.floor((y-footTop)/blockH);
            const mortar=(x-left+(row%2)*blockW*.5)%blockW<1||(y-footTop)%blockH<1;
            const stairs=edge<.24&&y>=bottom,tone=mortar?25:stairs?61:43;
            put(x,y,(tone+g*9)*shade,(tone+g*8+3)*shade,(tone+g*5-2)*shade);
          }
        }
      }
      if(obj.object&&obj.d<=3*scene.scale&&obj.center>=5&&obj.center<W-5&&obj.d<=depths[Math.floor(obj.center)]+.02){
        const info=typeof state.objectInfo==='function'?state.objectInfo(obj.x,obj.y):null;
        if(info?.viewText)labels.push({text:info.viewText,d:obj.d,center:obj.center,top});
      }
      for(let x=Math.max(0,Math.floor(left/step)*step);x<Math.min(W,left+width);x+=step){
        if(!obj.landmark&&obj.d>depths[x]+.02)continue;
        const tx=Math.floor((x-left)/(width/sw));if(tx<0||tx>=sw)continue;
        for(let y=Math.max(0,Math.floor(top/step)*step);y<Math.min(H,bottom);y+=step){
          // Towers rise above hedges; lower facade stays occluded by nearer walls.
          if(obj.landmark&&obj.d>depths[x]+.02&&y>=wallTops[x])continue;
          const ty=Math.floor((y-top)/scale),c=colors[rows[ty]?.[tx]];
          if(c){const locked=obj.name==='stairs'&&obj.sealed;put(x,y,(c[0]+(locked?25:0))*shade,c[1]*shade*(locked?.7:1),c[2]*shade*(locked?.8:1));}
        }
      }
    });
    ctx.putImageData(pixels,0,0);
    // Keep labels on visible near objects, using the same wall-depth clipping as sprites.
    ctx.font='12px "Ark Pixel",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    const labelBoxes=[];
    for(const label of labels.sort((a,b)=>a.d-b.d)){
      if(labelBoxes.length>=3)break;
      const width=Math.ceil(ctx.measureText(label.text).width)+12,height=20,left=Math.max(5,Math.min(W-width-5,label.center-width/2)),top=Math.max(9,Math.min(H-height-10,label.top-24));
      if(labelBoxes.some(box=>left<box.left+box.width+4&&left+width+4>box.left&&top<box.top+height+3&&top+height+3>box.top))continue;
      ctx.save();ctx.beginPath();
      for(let x=Math.floor(left);x<Math.min(W,left+width);x++)if(label.d<=depths[x]+.02)ctx.rect(x,top,1,height);
      ctx.clip();ctx.fillStyle='#130f20';ctx.fillRect(left,top,width,height);ctx.fillStyle='#b9905e';ctx.fillRect(left,top+height-1,width,1);ctx.fillStyle='#ffe2a4';ctx.fillText(label.text,left+width/2,top+height/2);ctx.restore();
      labelBoxes.push({left,top,width});
    }
    // Pixel framing and a modest lantern in the player's hand establish scale.
    if(options.lantern!==false){const flameX=W-39,flameY=H-53;
    ctx.fillStyle='#100c19';ctx.fillRect(flameX-10,flameY+3,27,46);ctx.fillStyle='#68433c';ctx.fillRect(flameX-4,flameY+20,9,30);
    ctx.fillStyle='#b17a47';ctx.fillRect(flameX-7,flameY+13,17,9);ctx.fillStyle='#d98a48';ctx.fillRect(flameX-5,flameY-8,14,22);
    ctx.fillStyle='#f1c76f';ctx.fillRect(flameX-2,flameY-13,7,27);ctx.fillStyle='#fff0b2';ctx.fillRect(flameX,flameY+1,4,14);}
    ctx.fillStyle='#0c0a14';ctx.fillRect(0,0,W,3);ctx.fillRect(0,H-3,W,3);ctx.fillRect(0,0,3,H);ctx.fillRect(W-3,0,3,H);
  }
  function draw(canvas,state,options={}){for(const part of drawSteps(canvas,state,options)){} }
  function drawBackdrop(canvas){draw(canvas,{grid:['#######','#.....#','#.....#','#.....#','#.....#','#.....#','#######'],x:3,y:5,dir:0,floor:1,backdropOnly:true},{entities:false,lantern:false});}
  const battleBackgroundCache=new WeakMap(),preparedBattles=new WeakMap();
  const battleStamp=(canvas,state)=>state?.grid?[topologyStamp(state),state.generation,state.x,state.y,state.dir,state.floor,state.exit?.ready,canvas.width,canvas.height]:[];
  const sameStamp=(a,b)=>a&&b.length&&b.every((v,i)=>v===a[i]);
  async function prepareBattle(canvas,state){
    if(!canvas||!state?.grid||typeof document==='undefined')return;
    const stamp=battleStamp(canvas,state);if(sameStamp(battleBackgroundCache.get(canvas),stamp)||sameStamp(preparedBattles.get(canvas)?.stamp,stamp))return;
    const buffer=document.createElement('canvas');buffer.width=canvas.width;buffer.height=canvas.height;
    const steps=drawSteps(buffer,state,{entities:false,lantern:false,horizon:.27,eyeHeight:.5,retreat:1.1,sliced:true});
    let done=false;while(!done){const start=performance.now();do{done=steps.next().done;}while(!done&&performance.now()-start<5);if(!done)await new Promise(resolve=>requestAnimationFrame(resolve));}
    preparedBattles.set(canvas,{stamp,buffer});
  }
  function drawBattle(canvas,state){
    if(!canvas)return;
    const stamp=battleStamp(canvas,state);
    const last=battleBackgroundCache.get(canvas);if(last&&stamp.length&&stamp.every((v,i)=>v===last[i])){renderStats.battleCacheHits++;return;}
    const prepared=preparedBattles.get(canvas);
    if(prepared&&sameStamp(prepared.stamp,stamp)){canvas.getContext('2d').drawImage(prepared.buffer,0,0);projectionCache.set(canvas,projectionCache.get(prepared.buffer)||[]);preparedBattles.delete(canvas);}
    else if(state?.grid)draw(canvas,state,{entities:false,lantern:false,horizon:.27,eyeHeight:.5,retreat:1.1});else drawBackdrop(canvas);
    battleBackgroundCache.set(canvas,stamp);
  }
  function objectBounds(canvas,x,y,name){
    const p=projectionCache.get(canvas)?.filter(p=>p.x===x&&p.y===y&&(!name||p.name===name)).at(-1);if(!p)return null;
    const r=canvas.getBoundingClientRect();return {left:r.left+p.left/canvas.width*r.width,top:r.top+p.top/canvas.height*r.height,width:p.width/canvas.width*r.width,height:p.height/canvas.height*r.height};
  }
  const api={draw,drawBattle,prepareBattle,drawBackdrop,art,sceneFor,objectBounds,metrics:()=>({...renderStats}),spriteData:name=>({rows:sprite(name),palette:P})};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DungeonView=api;
})(typeof globalThis!=='undefined'?globalThis:this);
