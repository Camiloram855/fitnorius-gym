// In-memory, bounded cache. Never persists session or API data to storage.
export function createRequestPool({ now = Date.now, limit = 24 } = {}) {
  const pending = new Map();
  const cache = new Map();
  let generation = 0;
  return {
    clear() { generation += 1; pending.clear(); cache.clear(); },
    async get(key, fetcher, ttl = 0) {
      const hit = cache.get(key);
      if (hit && hit.expires > now()) return hit.response.clone();
      cache.delete(key);
      let task = pending.get(key);
      if (!task) {
        const version = generation;
        task = Promise.resolve().then(fetcher).then(async (response) => {
          const control = response.headers.get("cache-control") || "";
          if (ttl > 0 && response.ok && !/no-store|no-cache|private/i.test(control)
            && response.headers.get("content-type")?.includes("application/json")) {
            // Buffer once, so repeated clones cannot accumulate unread streams.
            const body = await response.clone().text();
            if (version === generation && body.length <= 128 * 1024) {
              if (cache.size >= limit) cache.delete(cache.keys().next().value);
              cache.set(key, { expires: now() + ttl, response: new Response(body, {
                status: response.status, statusText: response.statusText, headers: response.headers,
              }) });
            }
          }
          return response;
        });
        pending.set(key, task);
        const forget = () => { if (pending.get(key) === task) pending.delete(key); };
        task.then(forget, forget);
      }
      return (await task).clone();
    },
  };
}
