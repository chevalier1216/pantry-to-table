import type {ReactNode} from 'react';
import {defaultRecipes} from '../lib/recipe-candidates.mjs';
import {EQUIPMENT} from '../lib/catalog.mjs';
type Recipe=ReturnType<typeof defaultRecipes>[number];
export function RecipeDetail({recipe:r,children}:{recipe:Recipe;children?:ReactNode}){
 return <article><h3>{r.title}</h3><p>{r.author&&`作者：${r.author} · `}原食譜 {r.servings??'未知'} 人份 · {r.totalMinutes??'未知'} 分鐘</p><p>設備：{r.equipment?.map((id:string)=>EQUIPMENT.find(e=>e.id===id)?.name||id).join('、')||'來源未提供完整設備資訊'}</p><h4>來源用量</h4><ul>{r.ingredients.map((i,n)=><li key={n}>{i.name}：{i.amount===null?('amountText' in i?String(i.amountText):'未提供精確用量'):`${i.amount} ${i.unit}`}</li>)}</ul><h4>作法</h4>{r.steps.length?<ol>{r.steps.map((s:string,n:number)=><li key={n}>{s}</li>)}</ol>:<p>來源未提供作法。</p>}<p>{r.note}</p>{r.sourceUrl&&<p>來源：iCook 愛料理</p>}{children}</article>;
}
