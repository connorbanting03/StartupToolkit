"use client";

import { useEffect, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { api } from "@/lib/api";

/**
 * One-click auto-fill. Renders nothing unless the backend reports AI is enabled
 * (ANTHROPIC_API_KEY set), so the copy / paste flow stays the default.
 */
export function AiAutofillButton({
  prompt,
  onResult,
}: {
  prompt: string;
  onResult: (text: string) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .aiStatus()
      .then((s) => !cancelled && setEnabled(s.enabled))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) return null;

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.aiAutofill(prompt);
      onResult(res.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auto-fill failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
        {loading ? "Filling…" : "Auto-fill now"}
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </>
  );
}
