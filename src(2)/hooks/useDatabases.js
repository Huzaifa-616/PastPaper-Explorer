import { useState, useEffect } from 'react';

// Fetches the generated JSON databases once per session (module-level cache),
// so navigating between pages never re-downloads them.
const cache = { topicals: undefined, library: undefined };

async function load(key, url) {
  if (cache[key] !== undefined) return cache[key];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    cache[key] = await res.json();
  } catch {
    cache[key] = null; // generated DB not present yet — pages handle null gracefully
  }
  return cache[key];
}

export function useDatabases() {
  const [topicalDb, setTopicalDb] = useState(cache.topicals ?? null);
  const [libraryDb, setLibraryDb] = useState(cache.library ?? []);

  useEffect(() => {
    let alive = true;
    load('topicals', '/topicals_db.json').then(d => { if (alive && d) setTopicalDb(d); });
    load('library', '/library_db.json').then(d => { if (alive && d) setLibraryDb(d); });
    return () => { alive = false; };
  }, []);

  return { topicalDb, libraryDb };
}
