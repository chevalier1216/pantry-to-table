import test from 'node:test';
import assert from 'node:assert/strict';
import {ingredient,rank,defaultRecipes} from '../lib/recipe-candidates.mjs';
import {directions,createRecipeService} from '../lib/recipe-service.mjs';
import {supportsDirection} from '../lib/recipe-pairing.mjs';
const input={inventory:{egg:10,tomato:1000,cabbage:1000,mushroom:1000,tofu:1000,oil:100,salt:30,water:5000,cookedRice:1000,noodles:1000,soySauce:100},people:2,minutes:120,equipment:['any'],exclusions:[],mode:'shop',shoppingMinutes:0,pairMeals:true};
const dish=(id,title,names,steps=[])=>({id:'icook:'+id,source:'icook',sourceUrl:'https://icook.tw/recipes/'+id,title,ingredients:names.map(n=>ingredient(n)),steps,complete:false,servings:null,totalMinutes:null,equipment:null});

test('directions use ingredient and cooking traits even with a generic title',()=>{
 const cases=[
  [dish(1,'家常料理',['牛肉','高湯']), '湯麵'],
  [dish(2,'晚餐',['雞肉','水'],['煮湯至雞肉熟透']), '湯麵'],
  [dish(3,'清爽配菜',['小黃瓜','紅蘿蔔']), '涼麵'],
  [dish(4,'家常料理',['茄子','咖哩醬']), '白飯'],
  [dish(5,'家常料理',['豆腐','醬油'],['燉煮至醬汁濃稠']), '白飯'],
  [dish(6,'家常料理',['雞蛋','高麗菜'],['切丁後翻炒']), '炒飯'],
 ];
 for(const [r,expected] of cases){assert.ok(directions(r).includes(expected),`${r.ingredients.map(i=>i.name)} -> ${expected}`);assert.ok(directions(r).length<=2);}
 for(const r of [dish(7,'蒸蛋',['雞蛋','水']),dish(8,'煎甜點',['糖','麵粉']),dish(9,'牛肉湯',['牛肉','高湯']),dish(10,'咖哩燴蛋',['蛋','咖哩醬'])])assert.ok(!directions(r).includes('炒飯'),r.title);
 assert.deepEqual(directions(dish(11,'未知料理',['未知材料'])),[]);
});

test('pair searches include selected dish context and direction; unrelated staple hits cannot validate a meal',async()=>{
 const calls=[];
 const service=createRecipeService({search:async q=>{calls.push(q);return calls.length<=3?[]:[dish(90,'白飯炒飯湯麵涼麵',['熟白飯','乾麵條'])]}});
 const result=await service.recommend(input);
 assert.equal(calls.length,5);
 for(const q of calls.slice(3))assert.ok(result.candidates.some(r=>q.includes(r.title)&&directions(r).some(d=>q.includes(d))),q);
 assert.equal(result.pairings.length,0);
});

test('only contextual combined-direction evidence is accepted, without fetching details',async()=>{
 let count=0;
 const service=createRecipeService({search:async q=>{
  if(++count<=3)return [];
  const main=defaultRecipes().find(r=>q.startsWith(r.title+' '));
  if(!main)return [];
  const direction=q.slice(main.title.length+1);
  const staple=/麵/.test(direction)?'乾麵條':'熟白飯';
  return [dish(91,'無關'+direction,['蝦仁',staple]),dish(92,q,[...main.ingredients.map(i=>i.name),staple])];
 },detail:()=>{throw Error('must remain on demand')}});
 const result=await service.recommend(input);
 assert.ok(result.pairings.length>0);
 assert.ok(result.pairings.every(p=>p.evidenceUrl.endsWith('/92')));
 assert.ok(count<=5);
});

test('tomato and egg near variants share the two-item cap despite title aliases and garnish',()=>{
 const rows=rank([
  dish(1,'家常番茄炒蛋',['番茄','雞蛋','油']),
  dish(2,'蕃茄滑蛋',['蕃茄','蛋','鹽']),
  dish(3,'西紅柿炒雞蛋',['西紅柿','雞蛋','蔥']),
  dish(4,'滑蛋番茄',['蛋','番茄']),
  dish(5,'番茄蛋花湯',['番茄','蛋','水']),
 ],input);
 assert.equal(rows.filter(r=>r.id!=='icook:5').length,2);
 assert.ok(rows.some(r=>r.id==='icook:5'));
});

test('unrelated stir fries remain eligible and recipe title does not erase ingredient identity',()=>{
 const dishes=[dish(1,'清炒高麗菜',['高麗菜']),dish(2,'蒜炒鮮菇',['鮮菇','蒜']),dish(3,'家常小炒',['豆腐']),dish(4,'家常小炒',['番茄','蛋'])];
 assert.equal(rank(dishes,input).length,4);
});

test('a direction in the title still requires actual rice or noodles, not corn, rice wine or flour',()=>{
 const main=dish(1,'雞蛋料理',['蛋']);
 for(const extra of ['玉米','米酒'])assert.equal(supportsDirection(main,dish(2,'蛋炒飯',['蛋',extra]),'炒飯'),false);
 assert.equal(supportsDirection(main,dish(3,'蛋湯麵',['蛋','麵粉']),'湯麵'),false);
 assert.equal(supportsDirection(main,dish(4,'蛋炒飯',['蛋','隔夜飯']),'炒飯'),true);
 assert.equal(supportsDirection(main,dish(5,'蛋湯麵',['蛋','烏龍麵']),'湯麵'),true);
});
