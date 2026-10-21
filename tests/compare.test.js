import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePayloads, sanitize, parsePayload } from '../src/compare.js';

test('redacts secret-bearing keys recursively', () => {
  assert.deepEqual(sanitize({ token: 'real', nested: { api_key: '123', name: 'A' } }), { token: '[REDACTED]', nested: { api_key: '[REDACTED]', name: 'A' } });
});
test('detects additions and modifications', () => {
  const result = comparePayloads('{"data":{"status":"pending"}}', '{"data":{"status":"paid","new":true}}');
  assert.equal(result.summary.added, 1);
  assert.equal(result.summary.changed, 1);
  assert.ok(result.changes.some(x=>x.path === '$.data.status'));
});
test('does not include raw keys designated as secrets in the report', () => {
  const result = comparePayloads('{"authorization":"Bearer abcdefghijkl","count":1}', '{"authorization":"Bearer supersecret123","count":2}');
  assert.ok(!JSON.stringify(result).includes('supersecret123'));
  assert.ok(!JSON.stringify(result).includes('abcdefghijkl'));
});
test('rejects primitive or oversized payloads', () => {
  assert.throws(() => parsePayload('42'), /object or array/);
  assert.throws(() => parsePayload('{' + ' '.repeat(150001) + '}'), /smaller than/);
});
