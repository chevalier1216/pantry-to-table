import {ingredient,clean} from './recipe-candidates.mjs';
const STORAGE_KEY='pantry-to-table:favorites:v1';
export function snapshot(r){
 if(!r||!['default','icook'].includes(r.source)||typeof r.id!=='string'||!(r.source==='icook'?/^icook:\d{1,12}$/:/^default:[a-z-]+$/).test(r.id)||typeof r.title!=='string'||!r.title.trim()||!Array.isArray(r.ingredients)||r.ingredients.length>100||!Array.isArray(r.steps)||r.steps.length>100)throw Error('無效收藏');
 return {id:r.id,source:r.source,sourceUrl:r.source==='icook'?'https://icook.tw/recipes/'+r.id.slice(6):null,title:clean(r.title).slice(0,200),author:clean(r.author).slice(0,100)||null,servings:Number.isFinite(r.servings)&&r.servings>0?r.servings:null,totalMinutes:Number.isFinite(r.totalMinutes)&&r.totalMinutes>0?r.totalMinutes:null,ingredients:r.ingredients.map(i=>({...ingredient(i.name,i.amount,i.unit),amountText:clean(i.amountText).slice(0,100)})),equipment:Array.isArray(r.equipment)?r.equipment.filter(v=>typeof v==='string').slice(0,15):null,steps:r.steps.map(s=>clean(s).slice(0,3000)),stepMinutes:Array.isArray(r.stepMinutes)&&r.stepMinutes.every(n=>Number.isFinite(n)&&n>0)?r.stepMinutes.slice(0,100):null,complete:r.complete===true,note:clean(r.note).slice(0,500)};
}
export function favorites(storage){
 function read(){try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return [];if(raw.length>1000000)throw Error('收藏資料過大');const list=JSON.parse(raw);if(!Array.isArray(list)||list.length>50)throw Error('收藏格式無效');return list.map(snapshot);}catch{throw Error('無法讀取收藏，瀏覽器資料可能損毀或已停用。');}}
 return {read,save(r){const normalized=snapshot(r),rows=read().filter(v=>v.id!==r.id);if(rows.length>=50)throw Error('收藏已達 50 道上限。');rows.push(normalized);storage.setItem(STORAGE_KEY,JSON.stringify(rows));return rows;},remove(id){const rows=read().filter(r=>r.id!==id);storage.setItem(STORAGE_KEY,JSON.stringify(rows));return rows;}};
}
