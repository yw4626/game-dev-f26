/* A final boss waits at the back until every ordinary enemy has fallen. */
(function(root){
 const waiting=(enemy,enemies)=>!!enemy.finalBoss&&enemies.some(e=>!e.finalBoss&&e.health>0.000001);
 const active=enemies=>enemies.filter(e=>e.health>0.000001);
 const api={waiting,active};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BattleRoster=api;
})(globalThis);
