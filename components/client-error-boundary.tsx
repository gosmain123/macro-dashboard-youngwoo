"use client";

import type { ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error) {
    console.error("Client boundary caught an error", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="surface-card rounded-[32px] p-6 md:p-8">
            <p className="section-kicker">Client boundary</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              The page hit a client render error.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              The layout stayed mounted. Retry the page without losing the whole shell.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={this.handleRetry}
                className="soft-button-accent rounded-full px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition"
              >
                Retry render
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
