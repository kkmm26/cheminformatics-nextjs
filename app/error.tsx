"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <p className="text-sm font-medium text-destructive">Something went wrong</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Unable to load this page
        </h1>
        <p className="text-muted-foreground">
          An unexpected error occurred while rendering this route.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
