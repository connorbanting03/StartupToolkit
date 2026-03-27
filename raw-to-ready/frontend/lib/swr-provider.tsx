"use client";

import { useMemo } from "react";
import { SWRConfig } from "swr";

function localStorageProvider() {
  const map = new Map<string, any>();

  // Load from localStorage on init
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("swr-cache");
      if (stored) {
        const entries: [string, any][] = JSON.parse(stored);
        for (const [key, value] of entries) {
          map.set(key, value);
        }
      }
    } catch {
      // ignore corrupt cache
    }

    // Persist to localStorage before unload
    window.addEventListener("beforeunload", () => {
      try {
        const entries = Array.from(map.entries());
        localStorage.setItem("swr-cache", JSON.stringify(entries));
      } catch {
        // quota exceeded — silently ignore
      }
    });
  }

  return map;
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo(
    () => ({
      provider: localStorageProvider,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }),
    []
  );

  return (
    <SWRConfig value={config}>
      {children}
    </SWRConfig>
  );
}
