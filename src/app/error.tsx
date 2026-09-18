"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-[#f0f8ff] text-slate-800">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-slate-600 mb-2 text-sm whitespace-pre-wrap">{error.message}</p>
          {error.digest && (
            <p className="text-slate-400 text-xs mb-4">Error ID: {error.digest}</p>
          )}
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
