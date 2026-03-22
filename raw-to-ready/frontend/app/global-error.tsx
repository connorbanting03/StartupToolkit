"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h2 className="font-sans text-lg font-bold text-[#f5f0e8]">
            Something went wrong
          </h2>
          <button
            onClick={() => reset()}
            className="mt-4 rounded-lg bg-[#d47c2f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d47c2f]/80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
