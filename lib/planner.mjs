import {INGREDIENTS,EQUIPMENT,EXCLUSIONS,RECIPES} from './catalog.mjs';
const ids=new Set(INGREDIENTS.map(i=>i.id));
const numPattern='(?:[0-9]+(?:\\.[0-9]+)?|[零一二兩三四五六七八九十百半]+)';
function number(s){if(!s)return null;if(/^\d/.test(s))return Number(s);if(s==='半')return .5;const n={零:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};if(s.includes('百')){const [a,b]=s.split('百');return (n[a]||1)*100+(b?number(b):0);}if(s.includes('十')){const [a,b]=s.split('十');return (n[a]||1)*10+(n[b]||0);}return n[s]??null;}
const exclusionAliases={egg:['雞蛋','蛋'],soy:['黃豆','大豆','豆製品','豆腐','醬油'],wheat:['小麥','麩質','麵粉'],peanut:['花生'],sesame:['芝麻'],dairy:['牛奶','乳製品','奶'],seafood:['海鮮','魚','蝦','貝'],spicy:['辣椒','辣'],allium:['蔥','蒜','洋蔥','五辛'],meat:['肉','葷']};
export function parseInput(text){
 const draft={inventory:{},equipment:[],exclusions:[],unresolved:[],people:null,minutes:null,mode:null};
 text=String(text??'').slice(0,3000).normalize('NFKC');
 const restriction=/(?:不吃|忌口|不能吃|過敏|不要吃|避免食用)[^，,。；;\n]*/g;
 const forbidden=[...new Set([...text.matchAll(restriction)].map(m=>m[0]).concat(text.split(/[，,。；;\n]/).filter(s=>s.includes('過敏'))))];
 for(const part of forbidden){let rest=part.replace(/不吃|忌口|不能吃|過敏|不要吃|避免食用/g,'');for(const [id,aliases] of Object.entries(exclusionAliases))if(aliases.some(a=>part.includes(a)))draft.exclusions.push(id);for(const a of Object.values(exclusionAliases).flat().sort((a,b)=>b.length-a.length))rest=rest.split(a).join('');rest=rest.replace(/[對和與跟及、\s:：]/g,'');if(rest)draft.unresolved.push('未辨識忌口：'+part);}
 if(/全素|純素/.test(text))draft.exclusions.push('egg','dairy','meat','seafood');
 if(/蛋奶素/.test(text))draft.exclusions.push('meat','seafood');
 const stockText=text.replace(restriction,'').replace(/(?:沒有|沒剩|缺少|缺乏|缺|不買|不要)[^，,。；;\n]*/g,'');
 for(const item of INGREDIENTS){
  const aliases=[...item.aliases].sort((a,b)=>b.length-a.length);
  // Longer names are consumed first so 醬油 never becomes 食用油.
  const clean=stockText.replace(item.id==='oil'?/醬油/g:/$^/g,'').replace(item.id==='noodles'?/平底鍋/g:/$^/g,'');
  const match=clean.match(new RegExp('('+aliases.join('|')+')'));
  if(!match)continue;
  const at=match.index;const right=clean.slice(at+match[0].length).split(/[，,。；;、\n和與]/)[0];
  const left=clean.slice(0,at).split(/[，,。；;、\n和與]/).pop();
  const found=right.match(new RegExp('^\\s*('+numPattern+')\\s*(公斤|千克|kg|公克|克|g|毫升|ml|公升|升|顆|個|粒)','i')) || left.match(new RegExp('('+numPattern+')\\s*(公斤|千克|kg|公克|克|g|毫升|ml|公升|升|顆|個|粒)\\s*$','i'));
  if(!found){draft.unresolved.push(item.name+'：請填寫現有數量（'+item.unit+'）');continue;}
  let amount=number(found[1]);const unit=found[2].toLowerCase();
  const category=['公斤','千克','kg','公克','克','g'].includes(unit)?'克':['毫升','ml','公升','升'].includes(unit)?'毫升':'顆';
  if(category!==item.unit || amount===null){draft.unresolved.push(item.name+'：請換算為'+item.unit);continue;}
  if(['公斤','千克','kg','公升','升'].includes(unit))amount*=1000;
  if(item.id==='egg'&&!Number.isInteger(amount)){draft.unresolved.push('雞蛋請填完整顆數');continue;}
  draft.inventory[item.id]=amount;
 }
 for(const tool of EQUIPMENT){const pattern=new RegExp('(?:沒有|無|缺少)\\s*(?:'+tool.aliases.join('|')+')');if(tool.aliases.some(a=>text.includes(a))&&!pattern.test(text))draft.equipment.push(tool.id);}
 const p=text.match(new RegExp('('+numPattern+')\\s*(?:個人|人|位)'));if(p)draft.people=number(p[1]);
 const m=text.match(new RegExp('('+numPattern+')\\s*分鐘'));if(m)draft.minutes=number(m[1]);
 if(/只用|嚴格|不補買|不買|不出門/.test(text))draft.mode='strict';else if(/補買|可買|可以買/.test(text))draft.mode='shop';
 draft.exclusions=[...new Set(draft.exclusions)];
 // Tell users which food-like segments could not be interpreted; never silently
 // include them. The confirmation step requires a full review in all cases.
 for(const part of text.split(/[，,。；;\n]/))if(/雞腿|牛肉|豬肉|冷凍|生米|馬鈴薯|紅蘿蔔|冰箱/.test(part))draft.unresolved.push('目前目錄未涵蓋或需另外確認：'+part.trim());
 return draft;
}
export function planMeals(input){
 const {inventory={},people,minutes,equipment=[],exclusions=[],mode='strict',shoppingMinutes=0}=input;
 const issues=[];
 if(!Number.isInteger(people)||people<1||people>6)issues.push('用餐人數請填1至6人。');
 if(!Number.isFinite(minutes)||minutes<1||minutes>240)issues.push('料理上限請填1至240分鐘。');
 if(!Number.isFinite(shoppingMinutes)||shoppingMinutes<0||shoppingMinutes>240)issues.push('採買預留時間無效。');
 if(!['strict','shop'].includes(mode))issues.push('請選擇料理模式。');
 for(const [id,amount] of Object.entries(inventory))if(!ids.has(id)||!Number.isFinite(amount)||amount<0||amount>100000||(id==='egg'&&!Number.isInteger(amount)))issues.push('請確認食材數量與單位。');
 if(exclusions.some(x=>!EXCLUSIONS.some(e=>e.id===x)))issues.push('有未辨識的忌口，請先確認。');
 if(issues.length)return {plans:[],issues:[...new Set(issues)]};
 const possible=RECIPES.filter(r=>r.equipment.every(t=>equipment.includes(t))&&Object.keys(r.ingredients).every(id=>{const i=INGREDIENTS.find(i=>i.id===id);return !exclusions.includes(id)&&!i.tags.some(t=>exclusions.includes(t));}));
 const combinations=[];
 for(const main of possible.filter(r=>r.kind!=='side')){
  combinations.push([main]);
  for(const side of possible.filter(r=>r.kind==='side'))combinations.push([main,side]);
 }
 const plans=[];
 for(const recipes of combinations){
  const totals={};const scaled=recipes.map(r=>({...r,ingredients:Object.fromEntries(Object.entries(r.ingredients).map(([id,a])=>[id,id==='egg'?Math.ceil(a*people/2):Math.ceil(a*people/2)])),steps:r.steps.map(s=>({...s,minutes:s.minutes+(people>2?Math.ceil((people-2)*s.minutes/5):0)}))}));
  for(const r of scaled)for(const [id,a] of Object.entries(r.ingredients))totals[id]=(totals[id]||0)+a;
  const ingredients=Object.entries(totals).map(([id,amount])=>({...INGREDIENTS.find(i=>i.id===id),amount,available:inventory[id]||0}));
  const missing=ingredients.filter(i=>i.amount>i.available).map(i=>({...i,shortage:Math.round((i.amount-i.available)*100)/100}));
  if(mode==='strict'&&missing.length)continue;
  // Require at least one non-staple food on hand in shopping mode.
  if(!ingredients.some(i=>!['water','salt','oil','soySauce'].includes(i.id)&&i.available>0))continue;
  let cursor=shoppingMinutes;const timeline=[];
  for(const r of scaled)for(const s of r.steps){timeline.push({...s,recipe:r.name,start:cursor,end:cursor+s.minutes});cursor+=s.minutes;}
  if(cursor>minutes)continue;
  const score=missing.length*100 + (recipes.length===1?35:0) + (recipes[0].kind==='staple'?0:4) + cursor/10;
  plans.push({id:recipes.map(r=>r.id).join('+'),title:recipes.map(r=>r.name).join(' ＋ '),recipes:scaled,ingredients,missing,timeline,totalMinutes:cursor,cookingMinutes:cursor-shoppingMinutes,shoppingMinutes,people,score,hasStaple:recipes.some(r=>r.kind==='staple')});
 }
 plans.sort((a,b)=>a.score-b.score);
 return {plans:plans.slice(0,3),issues:plans.length?[]:['目前食譜庫沒有符合所有條件的餐點。請檢查食材數量、油鹽水、爐火與鍋具，或調整時間／補買模式。']};
}
