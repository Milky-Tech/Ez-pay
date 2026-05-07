"use client";

import { useState, useEffect, useRef } from "react";

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useCachedFetch<T>(url: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let isMounted = true;
    fetchedUrl.current = url;

    const fetchData = async () => {
      // 1. Check Cache immediately
      const cached = cache[url];
      if (cached) {
        setData(cached.data);
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh data in background
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        
        // 3. Update state and cache if it's still the same URL we care about
        if (isMounted && fetchedUrl.current === url) {
          const fetchedData = json.data || json;
          setData(fetchedData);
          setLoading(false);
          setError(null);
          cache[url] = { data: fetchedData, timestamp: Date.now() };
        }
      } catch (err: any) {
        if (isMounted && fetchedUrl.current === url) {
          setError(err);
          // If we had cache, don't show loading error, just keep old data
          if (!cached) setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error };
}
