"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export function DetailOverlayModal({
  open,
  onClose,
  title,
  subtitle,
  kicker = "Detail",
  closeLabel = "Close detail",
  widthClassName = "max-w-[64rem]",
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  kicker?: string;
  closeLabel?: string;
  widthClassName?: string;
  children: ReactNode;
}) {
  const [portalReady, setPortalReady] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!portalReady) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[120] transition",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[color:var(--overlay)] backdrop-blur-sm transition",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "surface-strong relative z-10 flex max-h-[min(90vh,58rem)] w-full min-w-0 flex-col overflow-hidden rounded-[30px] transition duration-200",
            widthClassName,
            open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.985]"
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border-soft)] px-6 py-5 sm:px-7">
            <div className="min-w-0">
              <p className="section-kicker">{kicker}</p>
              <h3 id={titleId} className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                {title}
              </h3>
              {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{subtitle}</p> : null}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(90vh-5.5rem)] overflow-y-auto px-6 py-6 sm:px-7">{children}</div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
