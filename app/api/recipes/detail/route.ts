import {recipeService} from '@/lib/recipe-service.mjs';
export async function GET(request:Request){
 try{const id=new URL(request.url).searchParams.get('id')||'';return Response.json({recipe:await recipeService.detail(id)},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({message:'食譜目前無法讀取；請稍後再試。'},{status:502});}
}
