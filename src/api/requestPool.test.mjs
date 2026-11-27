import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestPool } from './requestPool.js';
const json = (data, headers = {}) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', ...headers } });
test('concurrent callers share one request and can each read the response', async () => {
  const pool = createRequestPool(); let calls = 0;
  const fetcher = async () => { calls++; return json({ price: 100 }); };
  const responses = await Promise.all(Array.from({ length: 10 }, () => pool.get('product', fetcher)));
  assert.equal(calls, 1);
  for (const response of responses) assert.deepEqual(await response.json(), { price: 100 });
  await pool.get('product', fetcher); assert.equal(calls, 2);
});
test('presentation cache expires and invalidates', async () => {
  let time = 0; let calls = 0; const pool = createRequestPool({ now: () => time });
  const fetcher = async () => json(++calls);
  await pool.get('banner', fetcher, 30); await pool.get('banner', fetcher, 30); assert.equal(calls, 1);
  time = 31; await pool.get('banner', fetcher, 30); assert.equal(calls, 2);
  pool.clear(); await pool.get('banner', fetcher, 30); assert.equal(calls, 3);
});
test('a request started before invalidation cannot refill the cache', async () => {
  const pool = createRequestPool(); let resolve;
  const stale = pool.get('banner', () => new Promise(r => { resolve = r; }), 100);
  await Promise.resolve(); pool.clear(); resolve(json('old')); await stale;
  assert.equal(await (await pool.get('banner', () => json('new'), 100)).json(), 'new');
});
test('failures and private responses are never cached', async () => {
  const pool = createRequestPool(); let calls = 0;
  const fetcher = () => { calls++; return json('private', { 'cache-control': 'no-store' }); };
  await pool.get('private', fetcher, 100); await pool.get('private', fetcher, 100); assert.equal(calls, 2);
  await assert.rejects(pool.get('failure', () => Promise.reject(new Error('offline'))));
  assert.equal(await (await pool.get('failure', () => json('recovered'))).json(), 'recovered');
});
test('distinct request identities are isolated and cache size is bounded', async () => {
  const pool = createRequestPool({ limit: 1 }); let calls = 0;
  const fetcher = () => json(++calls);
  await pool.get('a', fetcher, 100); await pool.get('b', fetcher, 100); await pool.get('a', fetcher, 100);
  assert.equal(calls, 3);
});
