import test from 'node:test';
import assert from 'node:assert/strict';
import {parseInput,planMeals} from '../lib/planner.mjs';

const base={inventory:{egg:6,tomato:600,cabbage:500,oil:60,salt:10,water:1500,cookedRice:500},people:2,minutes:40,equipment:['pan','stove','pot'],exclusions:[],mode:'strict',shoppingMinutes:0};
test('Chinese input extracts units and constraints without assuming staples',()=>{
 const d=parseInput('雞蛋四顆、番茄300克，兩個人，40分鐘，不吃辣，有平底鍋和爐火');
 assert.equal(d.inventory.egg,4);assert.equal(d.inventory.tomato,300);assert.equal(d.people,2);assert.equal(d.minutes,40);assert.ok(d.exclusions.includes('spicy'));assert.equal(d.inventory.oil,undefined);
});
test('negated foods do not become inventory and household quantities stay descriptive',()=>{
 const d=parseInput('沒有雞蛋，半顆高麗菜，不吃花生');
 assert.equal(d.inventory.egg,undefined);assert.match(d.inventory.cabbage.description,/半顆/);assert.ok(d.exclusions.includes('peanut'));
});
test('household amounts and sufficient seasonings do not require unit conversion',()=>{
 const d=parseInput('雞蛋4顆、番茄兩顆、半顆高麗菜、半瓶醬油，鹽和糖都足夠，油足夠，有飲用水');
 assert.equal(d.inventory.egg,4);assert.match(d.inventory.tomato.description,/兩顆/);
 assert.match(d.inventory.soySauce.description,/半瓶/);assert.equal(d.inventory.salt.sufficient,true);
 assert.equal(d.inventory.sugar.sufficient,true);assert.equal(d.inventory.oil.sufficient,true);
 assert.equal(d.inventory.water.sufficient,false);assert.deepEqual(d.unresolved,[]);
});
test('descriptive stock produces precise recipe needs without invented stock amounts',()=>{
 const d=parseInput('雞蛋4顆、番茄兩顆、油足夠、鹽足夠');
 const r=planMeals({...base,inventory:d.inventory});assert.ok(r.plans.length);
 const p=r.plans.find(p=>p.id==='tomato-eggs');assert.ok(p);
 assert.equal(p.ingredients.find(i=>i.id==='tomato').amount,300);
 assert.equal(p.ingredients.find(i=>i.id==='tomato').available,null);
 assert.deepEqual(p.quantityChecks.map(i=>i.id),['tomato']);assert.equal(p.missing.length,0);
 assert.equal(planMeals({...base,inventory:{...d.inventory,oil:1}}).plans.length,0);
});
test('unrestricted equipment is explicit and new appliances are never treated as a stove',()=>{
 assert.ok(planMeals({...base,equipment:['any']}).plans.length);
 for(const tool of ['microwave','oven','airFryer','castIron'])assert.equal(planMeals({...base,equipment:[tool]}).plans.length,0);
 const d=parseInput('有微波爐、烤箱、氣炸鍋、鑄鐵鍋，廚具不拘，忌口無');
 assert.deepEqual(d.equipment,['any']);assert.deepEqual(d.exclusions,[]);assert.deepEqual(d.unresolved,[]);
});
test('strict mode yields usable meals with aggregate quantities within pantry',()=>{
 const r=planMeals(base);assert.ok(r.plans.length>0);
 for(const p of r.plans){assert.equal(p.missing.length,0);for(const i of p.ingredients)assert.ok(i.amount<=base.inventory[i.id]);assert.ok(p.totalMinutes<=40);}
});
test('strict mode never invents oil or salt',()=>{
 const r=planMeals({...base,inventory:{egg:4,tomato:300},equipment:['pan','stove']});assert.equal(r.plans.length,0);
});
test('shopping mode lists precise shortages while respecting equipment',()=>{
 const r=planMeals({...base,mode:'shop',inventory:{egg:2,tomato:300}});assert.ok(r.plans.length>0);assert.ok(r.plans[0].missing.length>0);
 assert.equal(planMeals({...base,mode:'shop',equipment:[]}).plans.length,0);
});
test('egg exclusion is a hard filter',()=>{
 const r=planMeals({...base,exclusions:['egg']});assert.ok(r.plans.every(p=>p.ingredients.every(i=>i.id!=='egg')));
});
test('unknown exclusions and nonfinite amounts block planning',()=>{
 assert.ok(planMeals({...base,exclusions:['unrecognized']}).issues.length);
 assert.ok(planMeals({...base,inventory:{...base.inventory,egg:Infinity}}).issues.length);
});
test('shopping reserve is part of total deadline and no zero-time meal is offered',()=>{
 assert.equal(planMeals({...base,minutes:10,shoppingMinutes:10}).plans.length,0);
 const r=planMeals({...base,mode:'shop',shoppingMinutes:15});for(const p of r.plans)assert.ok(p.totalMinutes<=40);
});
test('a known restriction never hides another unknown restriction',()=>{const d=parseInput('不吃蛋和芹菜，雞蛋4顆');assert.ok(d.unresolved.some(s=>s.includes('忌口')));});
test('shared oil is added across dishes before strict filtering',()=>{const r=planMeals({...base,inventory:{...base.inventory,oil:20}});assert.ok(r.plans.length);assert.ok(!r.plans.some(p=>p.recipes.some(r=>r.id==='tomato-eggs')&&p.recipes.some(r=>r.id==='cabbage')));});
test('allergen before the word allergy is excluded rather than silently dropped',()=>{
 for(const phrase of ['對蛋過敏','蛋過敏']){const d=parseInput('雞蛋3顆、番茄300克、食用油15毫升、鹽2克。兩個人，40分鐘，有平底鍋和爐火，只用現有食材。'+phrase);assert.ok(d.exclusions.includes('egg')||d.unresolved.some(s=>s.includes('忌口')));}
});
