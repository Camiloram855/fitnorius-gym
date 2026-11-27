import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('HTTP integration: deduplication, fresh products, invalidation, cancellation and sessions', async () => {
  const source = (await readFile(new URL('./client.js', import.meta.url), 'utf8'))
    .replace('import API_URL from "../config";', 'const API_URL = "https://api.test";')
    .replace('"./requestPool.js"', JSON.stringify(new URL('./requestPool.js', import.meta.url).href))
    .replace('"./loadingBus"', JSON.stringify(new URL('./loadingBus.js', import.meta.url).href));
  const { apiFetch, login } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return new Response(JSON.stringify(url.endsWith('/login') ? { accessToken: 'test', user: {} } : { ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  };
  try {
    await Promise.all([apiFetch('/api/products'), apiFetch('/api/products', { loading: false })]);
    assert.equal(calls, 1, 'loader preference must not duplicate network traffic');
    await apiFetch('/api/products'); assert.equal(calls, 2, 'products stay fresh');
    await apiFetch('/api/banner/all'); await apiFetch('/api/banner/all'); assert.equal(calls, 3);
    await apiFetch('/api/banner/upload', { method: 'POST' });
    await apiFetch('/api/banner/all'); assert.equal(calls, 5, 'mutation invalidates presentation data');
    const controller = new AbortController(); controller.abort();
    const results = await Promise.allSettled([apiFetch('/api/products', { signal: controller.signal }), apiFetch('/api/products')]);
    assert.equal(results[0].status, 'rejected'); assert.equal(results[1].status, 'fulfilled');
    await login('test', 'test');
    const before = calls;
    await apiFetch('/api/banner/all'); await apiFetch('/api/banner/all');
    assert.equal(calls, before + 2, 'authenticated reads are not cached');
    const { subscribeToLoading } = await import('./loadingBus.js');
    let count; const unsubscribe = subscribeToLoading(value => { count = value; }); unsubscribe();
    assert.equal(count, 0, 'loading bookkeeping settles after failures');
  } finally { globalThis.fetch = original; }
});
