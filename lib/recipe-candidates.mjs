import {INGREDIENTS, EXCLUSIONS, EQUIPMENT, RECIPES} from './catalog.mjs';
export const clean = value => String(value ?? '').replace(/<[^>]*>/g,'').replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi,m=>({ '&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' ' }[m] ?? String.fromCodePoint(Math.min(0x10ffff,parseInt(m.slice(2,-1).replace(/^x/i,''),m[2]?.toLowerCase()==='x'?16:10)||32)))).trim();
export const key = value => clean(value).normalize('NFKC').replace(/蕃茄|西紅柿/g,'番茄').replace(/雞蛋/g,'蛋').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();
export function ingredient(name, amount=null, unit=null){
 name=clean(name).slice(0,150);
 const item=INGREDIENTS.find(i=>[i.name,...i.aliases].some(a=>key(a)===key(name)));
 return {name,internalId:item?.id??null,amount:Number.isFinite(amount)&&amount>0?amount:null,unit:unit||null};
}
export function defaultRecipes(){return RECIPES.map(r=>({id:'default:'+r.id,source:'default',sourceUrl:null,title:r.name,author:null,servings:2,totalMinutes:r.steps.reduce((n,s)=>n+s.minutes,0),ingredients:Object.entries(r.ingredients).map(([id,a])=>{const i=INGREDIENTS.find(i=>i.id===id);return ingredient(i.name,a,i.unit)}),equipment:r.equipment,steps:r.steps.map(s=>s.detail),stepMinutes:r.steps.map(s=>s.minutes),complete:true,note:r.note}));}
export function validateInput(x){
 if(!x||!Number.isInteger(x.people)||x.people<1||x.people>6||!Number.isFinite(x.minutes)||x.minutes<1||x.minutes>240||!['strict','shop'].includes(x.mode)||!x.inventory||typeof x.inventory!=='object'||Array.isArray(x.inventory))return ['料理條件無效。'];
 if(!Array.isArray(x.equipment)||!x.equipment.length||x.equipment.some(id=>!EQUIPMENT.some(e=>e.id===id)))return ['請確認廚具。'];
 if(!Array.isArray(x.exclusions)||x.exclusions.some(id=>!EXCLUSIONS.some(e=>e.id===id))||x.otherRestriction?.trim())return ['有未確認的忌口。'];
 if(x.pairMeals!==undefined&&typeof x.pairMeals!=='boolean')return ['套餐選項無效。'];
 if(!Number.isFinite(x.shoppingMinutes??0)||(x.shoppingMinutes??0)<0||(x.shoppingMinutes??0)>240)return ['採買時間無效。'];
 for(const [id,a] of Object.entries(x.inventory))if(!INGREDIENTS.some(i=>i.id===id)||!(typeof a==='number'?Number.isFinite(a)&&a>=0&&a<=100000&&(id!=='egg'||Number.isInteger(a)):a&&typeof a.description==='string'&&a.description.trim()&&a.description.length<=150&&typeof a.sufficient==='boolean'))return ['食材數量或描述無效。'];
 return [];
}
const restrictionWords={egg:/蛋/,soy:/豆|醬油/,wheat:/麵|麥|醬油/,peanut:/花生/,sesame:/芝麻|麻油/,dairy:/奶|乳|起司|奶油/,seafood:/魚|蝦|貝|蛤|蚵|海鮮|蟹|蚌|魷/,spicy:/辣/,allium:/蔥|蒜|洋蔥|韭/,meat:/肉|雞(?!蛋)|牛(?!奶)|豬|鴨(?!蛋)|鵝|火腿|培根/};
export function assess(recipe,x){
 const missing=[],checks=[];let rejected=false;
 const text=recipe.ingredients.map(i=>i.name).join(' ');
 if(x.exclusions.some(id=>restrictionWords[id]?.test(text)||recipe.ingredients.some(i=>INGREDIENTS.find(v=>v.id===i.internalId)?.tags.includes(id))))rejected=true;
 if(x.exclusions.length&&recipe.ingredients.some(i=>!i.internalId))checks.push('有未分類食材，忌口尚未完整核對');
 if(!recipe.complete)checks.push('搜尋摘要不完整，請點開核對材料與用量');
 if(!recipe.equipment?.length){if(!x.equipment.includes('any'))checks.push('來源未提供完整設備需求');}
 else if(!x.equipment.includes('any')&&!recipe.equipment.every(id=>x.equipment.includes(id)||(id==='pan'&&x.equipment.includes('castIron'))))rejected=true;
 const factor=recipe.servings?x.people/recipe.servings:null;
 if(!factor)checks.push('來源份數未知，不能換算人份');
 const totals=new Map();
 for(const i of recipe.ingredients){const id=i.internalId||key(i.name);const k=id+'|'+i.unit;const old=totals.get(k);totals.set(k,old?{...i,amount:old.amount!==null&&i.amount!==null?old.amount+i.amount:null}:i);}
 const needs=[...totals.values()].map(i=>{
  const stock=i.internalId?x.inventory[i.internalId]:undefined;
  const canonical=INGREDIENTS.find(v=>v.id===i.internalId);
  const amount=factor&&i.amount!==null?((i.internalId==='egg'||recipe.source==='default')?Math.ceil(i.amount*factor):Math.round(i.amount*factor*100)/100):null;
  let shortage=null;
  if(stock===undefined||stock===0){missing.push(i.name);if(x.mode==='strict')rejected=true;}
  else if(amount===null||i.unit!==canonical?.unit)checks.push(i.name+'：來源用量或單位待核對');
  else if(typeof stock==='number'){shortage=Math.max(0,Math.round((amount-stock)*100)/100);if(shortage){missing.push(i.name);if(x.mode==='strict')rejected=true;}}
  else if(!stock.sufficient)checks.push(i.name+'：份量請對照');
  return {...i,amount,sourceAmount:i.amount,stock:stock??null,shortage};
 });
 const cooking=recipe.source==='default'&&recipe.stepMinutes?recipe.stepMinutes.reduce((n,m)=>n+m+(x.people>2?Math.ceil((x.people-2)*m/5):0),0):recipe.totalMinutes;
 const total=cooking===null?null:cooking+(x.shoppingMinutes||0);
 if(total===null)checks.push('來源未提供時間');else if(total>x.minutes)rejected=true;
 if(recipe.source!=='default')checks.push('來源時間未確認包含全部備料與指定人份');
 if(!recipe.ingredients.some(i=>i.internalId&&!['water','salt','oil','soySauce','sugar'].includes(i.internalId)&&x.inventory[i.internalId]))rejected=true;
 return {rejected,missing:[...new Set(missing)],checks:[...new Set(checks)],needs,totalMinutes:total};
}
export function family(r){const t=key(r.title);if(/番茄.*炒蛋|蛋.*炒番茄/.test(t))return '番茄炒蛋';const method=['湯麵','炒飯','涼麵','烘蛋','蒸蛋','蛋花湯','湯','煎','炒','燉','烤'].find(s=>t.includes(s))||t;return method;}
export function rank(candidates,input,limit=15){
 if(validateInput(input).length)return [];
 const seen=new Set();const pool=[];
 for(const r of candidates){if(seen.has(r.id))continue;seen.add(r.id);const a=assess(r,input);if(a.rejected)continue;pool.push({...r,assessment:a});}
 pool.sort((a,b)=>a.assessment.missing.length-b.assessment.missing.length||a.assessment.checks.length-b.assessment.checks.length||a.title.localeCompare(b.title,'zh-Hant'));
 const counts=new Map(),result=[];
 while(pool.length&&result.length<limit){let at=pool.findIndex(r=>!counts.get(family(r)));if(at<0)at=pool.findIndex(r=>(counts.get(family(r))||0)<2);if(at<0)break;const [r]=pool.splice(at,1);counts.set(family(r),(counts.get(family(r))||0)+1);result.push(r);}
 return result;
}
