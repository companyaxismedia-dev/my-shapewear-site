const cacheStore = new Map();

function getCache(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
}

function setCache(key, value, ttlMs = 60000) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function clearCache(prefix = "") {
  if (!prefix) {
    cacheStore.clear();
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

async function cached(key, ttlMs, loader) {
  const cachedValue = getCache(key);
  if (cachedValue) return cachedValue;

  const value = await loader();
  setCache(key, value, ttlMs);
  return value;
}

module.exports = {
  cached,
  clearCache,
  getCache,
  setCache,
};
