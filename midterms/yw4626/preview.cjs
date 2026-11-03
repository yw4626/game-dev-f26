'use strict';
// Optional loopback preview. The game also works directly from dist/index.html.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist');
const watch=require('./agents/watch-server.cjs').createWatchHandler(__dirname);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ogg':'audio/ogg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
  if(watch(req,res))return;
  const pathname=new URL(req.url,'http://localhost').pathname;
  const names={'/combat-specials.js':'combat-specials.js','/combat-v12.css':'combat-v12.css','/hand-layout.js':'hand-layout.js','/hand-v11.css':'hand-v11.css','/pixel-art-v10.js':'pixel-art-v10.js','/evolution-v10.js':'evolution-v10.js','/wild-v10.js':'wild-v10.js','/effects-v10.js':'effects-v10.js','/v10.css':'v10.css','/attack-patterns.js':'attack-patterns.js','/encounters.js':'encounters.js','/wild-cards.js':'wild-cards.js','/pixel-font.css':'pixel-font.css','/pixel-assets.js':'pixel-assets.js','/pixel-skin.css':'pixel-skin.css','/presentation.css':'presentation.css','/locale.js':'locale.js','/characters-evolution.js':'characters-evolution.js','/':'index.html','/index.html':'index.html','/style.css':'style.css','/pixel.css':'pixel.css','/library.css':'library.css','/catalog.js':'catalog.js','/engine.js':'engine.js','/extra-cards.js':'extra-cards.js','/extra-cards-v7.js':'extra-cards-v7.js','/gem-catalog.js':'gem-catalog.js','/gems.js':'gems.js','/room-templates.js':'room-templates.js','/room-layout.js':'room-layout.js','/world-gen.js':'world-gen.js','/dungeon.js':'dungeon.js','/dungeon-view.js':'dungeon-view.js','/run.js':'run.js','/progression-catalog.js':'progression-catalog.js','/pickup-catalog.js':'pickup-catalog.js','/app.js':'app.js'};
  // Serve future versioned browser modules too, while keeping paths inside dist.
  if(/^\/[a-zA-Z0-9_-]+\.(html|js|css)$/.test(pathname))names[pathname]=pathname.slice(1);
  if(/^\/assets\/[a-zA-Z0-9_./-]+\.(png|svg|woff2|txt|ogg)$/.test(pathname)&&!pathname.includes('..'))names[pathname]=pathname.slice(1);
  if(!names[pathname]||!fs.existsSync(path.join(root,names[pathname]))){res.writeHead(404);res.end('Not found');return;}
  const file=path.join(root,names[pathname]);res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
server.listen(8765,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8765'));
process.on('SIGINT',()=>server.close());


