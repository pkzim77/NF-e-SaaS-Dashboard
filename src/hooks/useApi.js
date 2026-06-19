import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

const cache = new Map(); // path -> { data, error }
const listeners = new Map(); // path -> Set<fn>

function subscribers(path) {
  if (!listeners.has(path)) listeners.set(path, new Set());
  return listeners.get(path);
}

function load(path) {
  return api
    .get(path)
    .then((data) => {
      cache.set(path, { data, error: null });
      subscribers(path).forEach((fn) => fn());
    })
    .catch((error) => {
      cache.set(path, { data: cache.get(path)?.data ?? null, error });
      subscribers(path).forEach((fn) => fn());
    });
}

export function useApi(path) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const onChange = () => forceUpdate((n) => n + 1);
    subscribers(path).add(onChange);
    load(path);
    return () => subscribers(path).delete(onChange);
  }, [path]);

  const refetch = useCallback(() => load(path), [path]);
  const entry = cache.get(path);

  return { data: entry?.data ?? null, loading: !entry, error: entry?.error ?? null, refetch };
}
