'use client';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogHeader} from '@/components/ui/dialog';
import {defaultRecipes,rank,assess} from '@/lib/recipe-candidates.mjs';
import {combine} from '@/lib/recipe-service.mjs';
import {favorites} from '@/lib/favorites.mjs';
import {RecipeDetail} from './recipe-detail';
type Recipe=ReturnType<typeof defaultRecipes>[number];
type Candidate=Recipe&{assessment:ReturnType<typeof assess>;parts?:Recipe[]};
export type Conditions={inventory:Record<string,number|{description:string;sufficient:boolean}>;people:number;minutes:number;mode:string;equipment:string[];exclusions:string[];shoppingMinutes:number;pairMeals:boolean};
export function RecipeCandidates({input,onDefault}:{input:Conditions|null;onDefault:(id:string|null)=>void}){
 const [rows,setRows]=useState<Candidate[]>([]),[pairs,setPairs]=useState<Candidate[]>([]),[saved,setSaved]=useState<Recipe[]>([]),[message,setMessage]=useState(''),[favoriteMessage,setFavoriteMessage]=useState(''),[busy,setBusy]=useState(false),[open,setOpen]=useState(false),[details,setDetails]=useState<Recipe[]>([]),[detailMessage,setDetailMessage]=useState('');
 const generation=useRef(0),detailGeneration=useRef(0);const onDefaultRef=useRef(onDefault);onDefaultRef.current=onDefault;
 useEffect(()=>{try{setSaved(favorites(localStorage).read() as Recipe[])}catch(e){setFavoriteMessage((e as Error).message)}},[]);
 useEffect(()=>{
  const ticket=++generation.current;detailGeneration.current++;setOpen(false);setPairs([]);setMessage('');
  if(!input){setRows([]);setBusy(false);return;}
  setRows(rank(defaultRecipes(),input) as Candidate[]);setBusy(true);
  fetch('/api/recipes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}).then(async r=>{if(!r.ok)throw Error('搜尋暫時無法使用，保留內建候選。');return r.json()}).then(d=>{if(ticket!==generation.current)return;setRows(d.candidates);setPairs(d.pairings);setMessage(d.issues.join(' '));}).catch(e=>{if(ticket===generation.current)setMessage(e.message)}).finally(()=>{if(ticket===generation.current)setBusy(false)});
  return ()=>{generation.current++;};
 },[input]);
 async function show(r:Recipe&{parts?:Recipe[]},cached=false){
  const ticket=++detailGeneration.current;onDefaultRef.current(null);setDetailMessage('讀取食譜…');setDetails([]);setOpen(true);
  try{const parts=r.parts||[r],loaded:Recipe[]=[];for(const part of parts){if(cached||part.source==='default'){loaded.push(part);continue;}const response=await fetch('/api/recipes/detail?id='+encodeURIComponent(part.id));const data=await response.json();if(!response.ok)throw Error(data.message);loaded.push(data.recipe);}if(ticket!==detailGeneration.current)return;setDetails(loaded);setDetailMessage(cached?'收藏快照，可能與來源目前內容不同。':'');}catch(e){if(ticket===detailGeneration.current)setDetailMessage((e as Error).message);}
 }
 function save(r:Recipe){try{setSaved(favorites(localStorage).save(r) as Recipe[]);setFavoriteMessage('已儲存在此瀏覽器。')}catch(e){setFavoriteMessage((e as Error).message)}}
 function remove(id:string){try{setSaved(favorites(localStorage).remove(id) as Recipe[]);setFavoriteMessage('已移除收藏。')}catch(e){setFavoriteMessage((e as Error).message)}}
 const combined=details.length===2?combine(details[0],details[1]):details[0];const assessment=combined&&input?assess(combined,input):null;
 function card(r:Candidate){return <article className="candidate-card" key={r.id}><small>{r.parts?'套餐搭配':r.source==='default'?'Default 原創食譜':'iCook 搜尋候選'}</small><h3>{r.title}</h3><p>{r.assessment.checks.length?'待核對條件':r.assessment.missing.length?'補買後可做':'符合目前條件'} · {r.totalMinutes===null?'時間未知':`${r.totalMinutes} 分鐘（來源／估算）`}</p>{r.assessment.missing.length>0&&<p>缺少：{r.assessment.missing.join('、')}</p>}<p className="small-note">{r.assessment.checks.join('；')}</p><Button variant="outline" onClick={()=>{if(r.source==='default'){onDefaultRef.current(r.id.slice(8));}else void show(r)}}>查看食譜</Button>{r.source==='default'&&<Button variant="ghost" onClick={()=>save(r)}>收藏</Button>}</article>}
 return <section className="recipe-candidates" aria-label="料理候選與收藏">
 {input&&<><h2>依目前食材的單道料理候選</h2><p className="small-note">{rows.length} 道候選。外部摘要未核對完整份量、設備與時間；點開詳細頁再核對。候選數量不等於已確認能做的數量。</p><p role="status">{busy?'正在搜尋 iCook…':message||(!rows.length?'目前沒有符合已知條件的候選。':'')}</p><div className="candidate-grid">{rows.map(card)}</div>{input.pairMeals&&<><h2>搭配成套餐</h2><p className="small-note">少量主食搭配，材料與時間合併核對；搜尋證據不代表已確認足量。</p><div className="candidate-grid">{pairs.map(card)}</div>{!busy&&!pairs.length&&<p>目前沒有取得符合條件的主食搭配證據。</p>}</>}</>}
 <h2>我的收藏</h2><p className="small-note">收藏保存在此瀏覽器，清除瀏覽器資料會移除收藏；不會成為全站內建食譜。</p><p role="status">{favoriteMessage}</p>{!saved.length?<p>尚未收藏食譜。</p>:<div className="candidate-grid">{saved.map(r=><article className="candidate-card" key={r.id}><h3>{r.title}</h3><Button variant="outline" onClick={()=>void show(r,true)}>查看收藏快照</Button><Button variant="ghost" onClick={()=>remove(r.id)}>移除收藏</Button></article>)}</div>}
 <Dialog open={open} onOpenChange={v=>{setOpen(v);if(!v)detailGeneration.current++}}><DialogContent className="recipe-dialog"><DialogHeader><DialogTitle>{combined?.title||'Recipe Detail'}</DialogTitle><DialogDescription>站內食譜詳細資料 · 依來源顯示，不推算未知份量。</DialogDescription></DialogHeader><p role="status">{detailMessage}</p>{assessment&&<div className="notice"><strong>{assessment.rejected?'不符合目前條件，請勿視為可完成推薦':assessment.checks.length?'仍有條件待核對':'符合目前已知條件'}</strong><p>{assessment.missing.length?'缺少：'+assessment.missing.join('、'):''}</p><p>{assessment.checks.join('；')}</p><ul>{assessment.needs.map((i,n)=><li key={n}>{i.name}：{i.amount===null?'指定人份用量未知':`${i.amount} ${i.unit||''}`}{i.shortage?`（缺 ${i.shortage} ${i.unit}）`:''}</li>)}</ul></div>}{!input&&details.length>0&&<p>尚未設定料理條件；收藏不代表目前可完成。</p>}{details.map(r=><RecipeDetail key={r.id} recipe={r}><Button onClick={()=>save(r)}>收藏這道食譜</Button></RecipeDetail>)}</DialogContent></Dialog>
 </section>;
}
