"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal">
      <h2 className="font-display text-lg font-bold text-cream">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-amber px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-amber/80"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-cream transition-colors hover:bg-white/[0.04]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
