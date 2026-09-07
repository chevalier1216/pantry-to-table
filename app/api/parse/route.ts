import { extractDraft } from '@/lib/providers.mjs';
export async function POST(request: Request) {
 if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin) return Response.json({message:'不接受跨站請求。'},{status:403});
 try { const raw=await request.text();if(raw.length>16000)return Response.json({message:'輸入過長。'},{status:413});const body=JSON.parse(raw);return Response.json(await extractDraft(body.text, process.env),{headers:{'Cache-Control':'no-store'}}); }
 catch { return Response.json({message:'AI 辨識未成功。請稍後重試，或使用基本辨識再手動確認。'},{status:400}); }
}
