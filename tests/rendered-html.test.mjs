import assert from 'node:assert/strict';
import test from 'node:test';
const {default:worker}=await import('../dist/server/index.js');
const env={ASSETS:{fetch:async()=>new Response('Not found',{status:404})}};
const ctx={waitUntil(){},passThroughOnException(){}};
test('production worker serves the Traditional Chinese working surface',async()=>{
 const response=await worker.fetch(new Request('http://localhost/',{headers:{accept:'text/html'}}),env,ctx);
 assert.equal(response.status,200);const html=await response.text();
 assert.match(html,/lang="zh-Hant"/);assert.match(html,/今晚煮什麼/);assert.match(html,/textarea/);assert.match(html,/family-dinner/);assert.doesNotMatch(html,/Starter Project|codex-preview/);
});
test('production status endpoint exposes only boolean availability',async()=>{
 const r=await worker.fetch(new Request('http://localhost/api/status'),env,ctx);assert.equal(r.status,200);assert.deepEqual(await r.json(),{ai:false,maps:false});
});
test('production store endpoint reports missing configuration without fake data',async()=>{
 const r=await worker.fetch(new Request('http://localhost/api/stores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'台北車站',walkMinutes:10})}),env,ctx);assert.equal(r.status,200);const d=await r.json();assert.equal(d.status,'unavailable');assert.deepEqual(d.stores,[]);
});
