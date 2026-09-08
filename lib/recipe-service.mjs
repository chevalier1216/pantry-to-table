import {INGREDIENTS} from './catalog.mjs';
import {defaultRecipes,rank,assess,validateInput} from './recipe-candidates.mjs';
import {createICook} from './icook.mjs';
import {directions,pairingQuery,supportsDirection} from './recipe-pairing.mjs';
export {directions,pairingRules} from './recipe-pairing.mjs';
export function queries(input){const names=INGREDIENTS.filter(i=>input.inventory[i.id]&&!['water','salt','oil','soySauce','sugar'].includes(i.id)).map(i=>i.name);return [...new Set([names.slice(0,2).join(' '),...names.slice(0,2)])].filter(Boolean).slice(0,3);}
export function combine(a,b){const known=a.servings&&b.servings;const ingredients=known?[...a.ingredients.map(i=>({...i,amount:i.amount===null?null:i.amount/a.servings})),...b.ingredients.map(i=>({...i,amount:i.amount===null?null:i.amount/b.servings}))]:[...a.ingredients,...b.ingredients];return {id:a.id+'+'+b.id,source:'pair',sourceUrl:null,title:a.title+' ＋ '+b.title,author:null,servings:known?1:null,totalMinutes:a.totalMinutes!==null&&b.totalMinutes!==null?a.totalMinutes+b.totalMinutes:null,ingredients,equipment:a.equipment&&b.equipment?[...new Set([...a.equipment,...b.equipment])]:null,steps:[],complete:a.complete&&b.complete,note:'搭配方向由外部搜尋食譜支持；兩道的材料合併核對，未明資訊需確認。',parts:[a,b]};}
export function createRecipeService(provider=createICook()){
 return {async recommend(input){
  const issues=validateInput(input);if(issues.length)return {candidates:[],pairings:[],issues,requests:0};
  let requests=0,failed=false;const external=[];
  async function search(q){if(requests>=5||failed)return [];requests++;try{return await provider.search(q)}catch{failed=true;return [];}}
  for(const q of queries(input)){external.push(...await search(q));if(failed)break;}
  const candidates=rank([...defaultRecipes(),...external],input),pairings=[];
  if(input.pairMeals&&!failed){
   for(const main of candidates.filter(r=>!/飯|麵|粥/.test(r.title)&&directions(r).length).slice(0,2)){
    const direction=directions(main)[0];if(!direction||requests>=5)continue;
    const evidence=await search(pairingQuery(main,direction));if(failed)break;
    const staple=evidence.find(r=>r.id!==main.id&&supportsDirection(main,r,direction)&&!assess(r,input).rejected);
    if(!staple)continue;const pair=combine(main,staple),assessment=assess(pair,input);if(!assessment.rejected)pairings.push({...pair,assessment,evidenceUrl:staple.sourceUrl});
   }
  }
  return {candidates,pairings,requests,issues:failed?['iCook 暫時無法取得，已停止後續搜尋；保留內建及已取得的候選。']:[],externalStatus:failed?'unavailable':'ok'};
 },async detail(id){if(id.startsWith('default:')){const r=defaultRecipes().find(r=>r.id===id);if(!r)throw new Error('食譜不存在');return r;}if(!/^icook:\d{1,12}$/.test(id))throw new Error('食譜編號無效');return provider.detail(id.slice(6));}};
}
export const recipeService=createRecipeService();
