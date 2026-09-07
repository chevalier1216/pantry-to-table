import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequestGate} from '../lib/request-gate.mjs';
test('a delayed response cannot restore results after inputs change',async()=>{
 const gate=createRequestGate();let displayed='new inputs';let resolve;
 const pending=new Promise(r=>{resolve=r;});const ticket=gate.begin();const task=pending.then(value=>{if(gate.isCurrent(ticket))displayed=value;});gate.invalidate();resolve('old results');await task;assert.equal(displayed,'new inputs');
});
test('only the latest request can publish its result',async()=>{
 const gate=createRequestGate();const first=gate.begin();const second=gate.begin();assert.equal(gate.isCurrent(first),false);assert.equal(gate.isCurrent(second),true);
});
