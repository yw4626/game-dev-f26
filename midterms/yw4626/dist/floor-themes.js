/* Authored five-floor campaign. Names, boss tuning and rosters are prototype design. */
(function(root){
 'use strict';
 const enemy=(visualKey,key,name,english)=>({visualKey,key,name,english});
 const floors=[
  {id:'garden',name:'荆棘花园',english:'Thorn Garden',boss:enemy('bossPlant','lion','荆棘守卫','Thorn Guardian'),stats:{health:360,attack:8,armor:18,shield:20,xp:10},
   enemies:[enemy('gardenLeaf','ghost','荆棘妖精','Thorn Sprite'),enemy('gardenBloom','ghost','铃兰妖花','Bellflower'),enemy('gardenBeetle','zombie','花园甲虫','Garden Beetle'),enemy('gardenBud','ghost','毒芽','Poison Bud'),enemy('gardenShrub','zombie','游荡灌木','Brambleling')]},
  {id:'library',name:'禁忌图书馆',english:'Forbidden Library',boss:enemy('bossBook','lion','千页魔典','Thousand-page Grimoire'),stats:{health:550,attack:12,armor:28,shield:30,xp:15},
   enemies:[enemy('libraryBook','ghost','失控魔书','Wild Grimoire'),enemy('libraryCandle','ghost','蜡烛幽魂','Candle Spirit'),enemy('libraryWisp','ghost','墨渍怪','Ink Wisp'),enemy('libraryArmor','lion','书库盔灵','Archive Armor'),enemy('librarySpirit','ghost','纸页游魂','Paper Spirit')]},
  {id:'cellar',name:'腐化地窖',english:'Blighted Cellar',boss:enemy('bossRat','lion','变异鼠王','Mutant Rat King'),stats:{health:800,attack:16,armor:40,shield:42,xp:22},
   enemies:[enemy('cellarRat','zombie','窃粮鼠','Grain Rat'),enemy('cellarBug','zombie','腐木虫','Wood Louse'),enemy('cellarSpider','ghost','窖穴蜘蛛','Cellar Spider'),enemy('cellarSnail','lion','酸液蜗牛','Acid Snail'),enemy('cellarSludge','ghost','污水软泥','Sewer Sludge')]},
  {id:'prison',name:'铁锁监狱',english:'Ironbound Prison',boss:enemy('bossPrisoner','lion','断链巨囚','Unchained Giant'),stats:{health:1150,attack:21,armor:55,shield:58,xp:30},
   enemies:[enemy('prisonGuard','lion','铁面狱卒','Iron Jailer'),enemy('prisonConvict','zombie','失心囚徒','Hollow Prisoner'),enemy('prisonRogue','zombie','潜行逃犯','Fugitive'),enemy('prisonDemon','lion','刑架恶鬼','Rack Fiend'),enemy('prisonGolem','lion','锁牢傀儡','Shackle Golem')]},
  {id:'sanctum',name:'吸血鬼藏身处',english:'Vampire Sanctum',boss:enemy('bossVampire','lion','永夜伯爵','Count of Endless Night'),stats:{health:1600,attack:28,armor:75,shield:80,xp:45},
   enemies:[enemy('sanctumBat','ghost','血翼蝠','Bloodwing'),enemy('sanctumWraith','ghost','暮影侍从','Dusk Wraith'),enemy('sanctumImp','zombie','紫翼魔','Violet Imp'),enemy('sanctumBone','lion','白骨飞蛇','Bone Wyrm'),enemy('sanctumEye','ghost','血眼触须','Blood Eye')]}
 ];
 const get=floor=>floors[Math.max(0,Math.min(4,(floor||1)-1))];
 const api={floors,get};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrawlerThemes=api;
})(globalThis);
