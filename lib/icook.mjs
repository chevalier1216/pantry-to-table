import {clean,ingredient} from './recipe-candidates.mjs';
export function parseSearch(html){
 const results=[];
 for(const match of html.matchAll(/<article\b[^>]*data-recipe-id=["'](\d+)["'][^>]*>([\s\S]*?)<\/article>/g)){
  const [,id,card]=match,title=clean(card.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1]);
  const list=clean(card.match(/<p\b[^>]*class=["']browse-recipe-content-ingredient["'][^>]*>([\s\S]*?)<\/p>/)?.[1]).replace(/^食材[：:]/,'');
  if(!title||!list)continue;
  const time=card.match(/data-title=["']烹飪時間\s*(\d+)\s*分鐘/);
  results.push({id:'icook:'+id,source:'icook',sourceUrl:'https://icook.tw/recipes/'+id,title,author:clean(card.match(/<span\b[^>]*class=["']browse-username-by["'][^>]*>([\s\S]*?)<\/span>/)?.[1])||null,servings:null,totalMinutes:time?Number(time[1]):null,ingredients:list.split('、').filter(Boolean).map(n=>ingredient(n)),equipment:null,steps:[],complete:false,note:''});
  if(results.length===20)break;
 }
 if(!results.length&&!/找不到|沒有符合|沒有找到/.test(html))throw new Error('搜尋頁結構無法辨識');
 return results;
}
function nodes(v){if(Array.isArray(v))return v.flatMap(nodes);if(v&&typeof v==='object')return [v,...nodes(v['@graph']||[])];return [];}
export function parseDetail(html,id){
 let r;
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{r=nodes(JSON.parse(m[1])).find(x=>[x['@type']].flat().includes('Recipe'));}catch{}if(r)break;}
 if(!r?.name||!Array.isArray(r.recipeIngredient)||!r.recipeIngredient.length)throw new Error('詳細頁缺少食譜資料');
 const stepText=v=>Array.isArray(v)?v.flatMap(stepText):typeof v==='string'?[clean(v)]:v?.itemListElement?stepText(v.itemListElement):v?.text?[clean(v.text)]:[];
 const time=String(r.totalTime||'').match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
 const serving=String(r.recipeYield??'').match(/^(\d+(?:\.\d+)?)\s*(?:人份|份|人)?$/);
 const ingredients=r.recipeIngredient.slice(0,100).map(raw=>{const s=clean(raw);const m=s.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|克|公克|毫升|ml|cc|顆|個)\s*$/i);if(!m)return ingredient(s);return ingredient(m[1],Number(m[2]),/^(g|克|公克)$/i.test(m[3])?'克':/^(ml|cc|毫升)$/i.test(m[3])?'毫升':'顆');});
 // Keep free-form names separate from descriptive amounts where JSON-LD does so.
 for(let i=0;i<ingredients.length;i++)if(ingredients[i].amount===null){const s=clean(r.recipeIngredient[i]);const at=s.lastIndexOf(' ');if(at>0){ingredients[i]= {...ingredient(s.slice(0,at)),amountText:s.slice(at+1)};}}
 return {id:'icook:'+id,source:'icook',sourceUrl:'https://icook.tw/recipes/'+id,title:clean(r.name),author:clean(r.author?.name)||null,servings:serving&&Number(serving[1])>0?Number(serving[1]):null,totalMinutes:time?Number(time[1]||0)*60+Number(time[2]||0):null,ingredients,equipment:null,steps:stepText(r.recipeInstructions).slice(0,100),complete:true,note:'依來源食譜顯示；未提供的設備、用量與時間範圍仍需核對。'};
}
export function createCache({ttl=300000,max=60,now=Date.now}={}){
 const values=new Map();
 return {async get(k,load){const old=values.get(k);if(old&&old.expires>now())return structuredClone(await old.value);values.delete(k);while(values.size>=max)values.delete(values.keys().next().value);const entry={expires:now()+ttl,value:Promise.resolve().then(load)};values.set(k,entry);try{return structuredClone(await entry.value)}catch(e){if(values.get(k)===entry)values.delete(k);throw e;}}};
}
export function createICook({fetcher=fetch,now=Date.now}={}){
 const searchCache=createCache({now}),detailCache=createCache({ttl:900000,max:40,now});
 async function html(url){
  const r=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(10000),headers:{Accept:'text/html'}});
  if(!r.ok)throw new Error('iCook 暫時無法讀取（HTTP '+r.status+'）');
  if(!r.headers.get('content-type')?.includes('text/html'))throw new Error('iCook 回應格式異常');
  const reader=r.body.getReader();const decoder=new TextDecoder();let size=0,text='';
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>1500000)throw new Error('iCook 頁面超過讀取上限');text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel();}
  if(/cf-chl-|challenge-platform|<title[^>]*>\s*Just a moment/i.test(text))throw new Error('iCook 要求驗證，已停止讀取');
  return text;
 }
 return {search:query=>searchCache.get(query,async()=>parseSearch(await html('https://icook.tw/search/'+encodeURIComponent(query)))),detail:id=>{if(!/^\d{1,12}$/.test(id))throw new Error('食譜編號無效');return detailCache.get(id,async()=>parseDetail(await html('https://icook.tw/recipes/'+id),id));}};
}
