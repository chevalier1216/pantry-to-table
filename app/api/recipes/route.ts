import {recipeService} from '@/lib/recipe-service.mjs';
export async function POST(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({message:'不接受跨站請求。'},{status:403});
 try{const raw=await request.text();if(raw.length>16000)return Response.json({message:'輸入過長。'},{status:413});return Response.json(await recipeService.recommend(JSON.parse(raw)),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({message:'無法取得料理候選。'},{status:400});}
}
