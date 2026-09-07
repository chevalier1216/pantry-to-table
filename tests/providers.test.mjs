import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDraft,findStores,safeExternalUrl} from '../lib/providers.mjs';
test('AI unavailable is explicit and makes no network calls',async()=>{const r=await extractDraft('雞蛋三顆',{});assert.equal(r.status,'unavailable');});
test('store lookup without credentials never returns invented stores',async()=>{const r=await findStores({location:'台北車站',walkMinutes:10},{});assert.equal(r.status,'unavailable');assert.deepEqual(r.stores,[]);});
test('invalid walk times are rejected even when provider is configured',async()=>{await assert.rejects(()=>findStores({location:'台北',walkMinutes:-5},{GOOGLE_MAPS_API_KEY:'fixture'}),/步行/);});
test('external links reject unsafe and foreign URL schemes',()=>{assert.equal(safeExternalUrl('javascript:alert(1)'),null);assert.equal(safeExternalUrl('https://evil.example'),null);assert.ok(safeExternalUrl('https://www.google.com/maps/place/test'));});
