"use client";

import type { ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
};

type State = {
  hasError: boolean;
};

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error) {
    console.error("Widget boundary caught an error", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className={
          this.props.compact
            ? "surface-inset rounded-[22px] p-4"
            : "surface-card min-w-0 overflow-hidden rounded-[24px] p-5"
        }
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Widget fallback
        </p>
        <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">
          {this.props.title ?? "This widget could not render."}
        </p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
          {this.props.description ?? "The rest of the page is still available."}
        </p>
      </div>
    );
  }
}
