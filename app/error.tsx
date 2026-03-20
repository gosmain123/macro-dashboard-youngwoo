"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalRouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route render error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface-card rounded-[32px] p-6 md:p-8">
        <p className="section-kicker">Load error</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)]">
          The page hit a client error.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
          The app stayed mounted, but this route failed to finish rendering. Try a safe reload of the view.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="soft-button-accent rounded-full px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition"
          >
            Retry route
          </button>
          <Link href="/" className="soft-button rounded-full px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
