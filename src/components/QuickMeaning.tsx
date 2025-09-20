import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Search, WifiOff } from 'lucide-react';
import { OFFLINE_DICTIONARY, OfflineEntry } from '../lib/offline-dictionary';

interface QuickMeaningProps {
  className?: string;
  isOnline?: boolean; // optional override from parent
}

// Lightweight cache stored in localStorage to support offline reuse
const CACHE_KEY = 'quick_meaning_cache_v1';

type CachedEntry = OfflineEntry & { cachedAt: string; source: 'offline' | 'online' };

type CacheMap = Record<string, CachedEntry>;

function loadCache(): CacheMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCache(map: CacheMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
}

function normalize(word: string) {
  return word.trim().toLowerCase();
}

function inflectionCandidates(word: string): string[] {
  const w = normalize(word);
  const variants = new Set<string>([w]);
  // Basic singularization heuristics for quick offline hits
  if (w.endsWith('es')) variants.add(w.slice(0, -2));
  if (w.endsWith('s')) variants.add(w.slice(0, -1));
  if (w.endsWith('ing')) variants.add(w.slice(0, -3));
  if (w.endsWith('ed')) variants.add(w.slice(0, -2));
  return Array.from(variants);
}

export default function QuickMeaning({ className = '', isOnline: onlineOverride }: QuickMeaningProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CachedEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<CacheMap>(() => loadCache());

  const isOnline = onlineOverride ?? navigator.onLine;

  useEffect(() => {
    const onOnline = () => {};
    const onOffline = () => {};
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const suggestions = useMemo(() => {
    // Provide a small curated list, prioritized by relevance to STEM/academics
    return ['viscosity', 'momentum', 'equilibrium', 'algorithm', 'buoyancy', 'laminar'];
  }, []);

  function lookupOffline(wordRaw: string): CachedEntry | null {
    const candidates = inflectionCandidates(wordRaw);
    for (const c of candidates) {
      if (OFFLINE_DICTIONARY[c]) {
        const entry: CachedEntry = {
          ...OFFLINE_DICTIONARY[c],
          cachedAt: new Date().toISOString(),
          source: 'offline'
        };
        return entry;
      }
    }
    return null;
  }

  function lookupCache(wordRaw: string): CachedEntry | null {
    const w = normalize(wordRaw);
    if (cache[w]) return cache[w];
    // Try naive variants
    for (const c of inflectionCandidates(w)) {
      if (cache[c]) return cache[c];
    }
    return null;
  }

  async function lookupOnline(wordRaw: string): Promise<CachedEntry | null> {
    if (!isOnline) return null;
    try {
      const w = encodeURIComponent(normalize(wordRaw));
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`;
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      // Extract first reasonable definition
      const first = data[0];
      const meaningBlocks = first?.meanings || [];
      let defText = '';
      let pos = '';
      for (const m of meaningBlocks) {
        const defs = m?.definitions || [];
        if (defs.length > 0) {
          defText = defs[0].definition || '';
          pos = m.partOfSpeech || '';
          break;
        }
      }
      if (!defText) return null;
      const entry: CachedEntry = {
        definition: defText,
        partOfSpeech: pos || undefined,
        example: undefined,
        cachedAt: new Date().toISOString(),
        source: 'online'
      };
      // Update cache
      const key = normalize(wordRaw);
      const next = { ...cache, [key]: entry };
      setCache(next);
      saveCache(next);
      return entry;
    } catch {
      return null;
    }
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const word = normalize(query);
    setError(null);
    setResult(null);
    if (!word) {
      setStatus('idle');
      return;
    }

    // 1) Offline dictionary
    const offlineHit = lookupOffline(word);
    if (offlineHit) {
      setResult(offlineHit);
      setStatus('idle');
      // Cache for future
      const key = normalize(word);
      const next = { ...cache, [key]: offlineHit };
      setCache(next);
      saveCache(next);
      return;
    }

    // 2) Local cache
    const cacheHit = lookupCache(word);
    if (cacheHit) {
      setResult(cacheHit);
      setStatus('idle');
      return;
    }

    // 3) Online (if available), otherwise fail fast
    setStatus('searching');
    const onlineHit = await lookupOnline(word);
    if (onlineHit) {
      setResult(onlineHit);
      setStatus('idle');
      return;
    }

    setStatus('error');
    setError(isOnline
      ? 'No definition found. Try a simpler form of the word.'
      : 'No offline definition found. Connect to the internet to expand results.');
  }

  function handleSuggestionClick(w: string) {
    setQuery(w);
    // Immediately search using offline/cache to be instant
    setTimeout(() => handleSearch(), 0);
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-md bg-blue-50 text-blue-600">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Quick Meaning</div>
            <div className="text-xs text-gray-500">Instant, low-data dictionary</div>
          </div>
        </div>
        {!isOnline && (
          <div className="flex items-center text-xs text-orange-600">
            <WifiOff className="w-4 h-4 mr-1" /> Offline: using local data
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex items-stretch space-x-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a word (e.g., viscosity)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {status === 'searching' && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-2.5 text-gray-400" />
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm inline-flex items-center"
        >
          <Search className="w-4 h-4 mr-1" />
          Define
        </button>
      </form>

      {result && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="text-sm text-gray-700">
            {result.partOfSpeech && (
              <span className="text-xs uppercase tracking-wide text-gray-500 mr-2">{result.partOfSpeech}</span>
            )}
            {result.definition}
          </div>
          {result.example && (
            <div className="text-xs text-gray-500 mt-2">Example: {result.example}</div>
          )}
          <div className="text-[10px] text-gray-400 mt-2">Source: {result.source}</div>
        </div>
      )}

      {!result && (
        <div className="text-xs text-gray-500">Try:
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="px-2 py-1 rounded-full border text-gray-700 hover:bg-gray-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="text-xs text-red-600 mt-2">{error}</div>
      )}

      <div className="text-[10px] text-gray-400 mt-3">
        Tips: Use simple base forms (e.g., "optimize" instead of "optimized"). Results are cached for offline use.
      </div>
    </div>
  );
}
