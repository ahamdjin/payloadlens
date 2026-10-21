import test from 'node:test';
import assert from 'node:assert/strict';
import {comparePayloads,parseRedactionKeys} from '../src/compare.js';
import {analyzeShapeDrift,buildExampleSchema} from '../src/contract.js';
test('removed webhook fields and changed types are clearly identified',()=>{
 const p=comparePayloads('{"data":{"old":"yes","amount":100,"keep":true}}','{"data":{"amount":"100","keep":true,"new":1}}');
 assert.equal(p.drift.alertCount,2);
 assert.ok(p.drift.changes.some(x=>x.path==='$.data.old'&&x.kind==='removed'));
 assert.ok(p.drift.changes.some(x=>x.path==='$.data.amount'&&x.kind==='type-changed'));
});
test('custom redaction and default personal identifiers mask values before reporting',()=>{
 const p=comparePayloads('{"email":"a@secret.test","accountNumber":"PRIVATE1","count":1}','{"email":"b@secret.test","accountNumber":"PRIVATE2","count":2}',{customKeys:'ACCOUNTNUMBER'});
 const encoded=JSON.stringify(p);
 assert.doesNotMatch(encoded,/PRIVATE|secret\.test/);
 assert.equal(p.before.email,'[REDACTED]');
 assert.equal(p.before.accountNumber,'[REDACTED]');
 assert.equal(p.drift.alertCount,0);
});
test('single sample schema is permissive about required keys',()=>{
 const schema=buildExampleSchema({data:{status:'paid',count:1,items:[{sku:'one'}]}});
 assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
 assert.equal(schema.properties.data.properties.count.type,'number');
 assert.equal(schema.properties.data.properties.items.items.type,'object');
 assert.equal(schema.required,undefined);
});
test('array shape changes identified separately from type incompatibilities',()=>{
 const d=analyzeShapeDrift({items:[{price:12}]},{items:[{price:'12'},{price:15}]});
 assert.equal(d.alertCount,1);
 assert.ok(d.changes.some(x=>x.kind==='array-size'));
 assert.ok(d.changes.some(x=>x.path==='$.items[0].price'));
});
test('input custom redaction list is bounded',()=>assert.throws(()=>parseRedactionKeys('x'.repeat(1001)),/too long/));
