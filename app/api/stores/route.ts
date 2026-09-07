import { findStores } from '@/lib/providers.mjs';
export async function POST(request: Request) {
 if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin) return Response.json({message:'不接受跨站請求。'},{status:403});
 try { const raw=await request.text();if(raw.length>2000)return Response.json({message:'地標過長。'},{status:413});const body=JSON.parse(raw);return Response.json(await findStores(body,process.env),{headers:{'Cache-Control':'no-store'}}); }
 catch { return Response.json({message:'店家查詢未成功。請確認地標與步行分鐘，或稍後再試。',stores:[]},{status:400}); }
}
