"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ExternalLink, GitBranch, PanelRightOpen, Waypoints, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  macroFlowDetails,
  mistakeNodes,
  nextStepMaps,
  regimeDecisionTree,
  scenarioFlowMaps,
  startHereFlow,
  type FlowNode,
  type FlowTone
} from "@/lib/macro-flow";
import { cn } from "@/lib/utils";
import type { DashboardPayload } from "@/types/macro";

const desktopQuery = "(min-width: 1280px)";

function getNextCatalyst(payload: DashboardPayload) {
  const today = new Date().toISOString().slice(0, 10);

  return payload.calendarEvents
    .filter((event) => event.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))[0];
}

function clampLabel(value: string, maxLength = 42) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

function toneStyles(tone: FlowTone, selected: boolean) {
  const selectedClass = selected ? "ring-1 ring-offset-0 shadow-[0_10px_24px_rgba(15,23,42,0.06)]" : "shadow-sm";

  if (tone === "emerald") {
    return cn(
      "border-emerald-200/75 bg-emerald-500/8 text-emerald-950 ring-emerald-300/65 hover:border-emerald-300 hover:bg-emerald-500/12",
      selectedClass
    );
  }

  if (tone === "amber") {
    return cn(
      "border-amber-200/75 bg-amber-500/8 text-amber-950 ring-amber-300/65 hover:border-amber-300 hover:bg-amber-500/12",
      selectedClass
    );
  }

  if (tone === "rose") {
    return cn(
      "border-rose-200/75 bg-rose-500/8 text-rose-950 ring-rose-300/65 hover:border-rose-300 hover:bg-rose-500/12",
      selectedClass
    );
  }

  if (tone === "cyan") {
    return cn(
      "border-cyan-200/75 bg-cyan-500/8 text-cyan-950 ring-cyan-300/65 hover:border-cyan-300 hover:bg-cyan-500/12",
      selectedClass
    );
  }

  return cn(
    "border-slate-200/90 bg-slate-500/8 text-slate-900 ring-slate-300/65 hover:border-slate-300 hover:bg-slate-500/10",
    selectedClass
  );
}

function toneChipStyles(tone: FlowTone) {
  if (tone === "emerald") {
    return "bg-emerald-500/14 text-emerald-700";
  }

  if (tone === "amber") {
    return "bg-amber-500/14 text-amber-700";
  }

  if (tone === "rose") {
    return "bg-rose-500/14 text-rose-700";
  }

  if (tone === "cyan") {
    return "bg-cyan-500/14 text-cyan-700";
  }

  return "bg-slate-500/8 text-slate-700";
}

function nodeDotStyles(tone: FlowTone) {
  if (tone === "emerald") {
    return "bg-emerald-500";
  }

  if (tone === "amber") {
    return "bg-amber-500";
  }

  if (tone === "rose") {
    return "bg-rose-500";
  }

  if (tone === "cyan") {
    return "bg-cyan-500";
  }

  return "bg-slate-500";
}

function MapNodeButton({
  node,
  selected,
  onSelect,
  anchorId,
  compact = false
}: {
  node: FlowNode;
  selected: boolean;
  onSelect: (detailId: string) => void;
  anchorId?: string;
  compact?: boolean;
}) {
  return (
    <button
      id={anchorId}
      type="button"
      onClick={() => onSelect(node.detailId)}
      aria-pressed={selected}
      className={cn(
        "w-full max-w-full overflow-hidden rounded-[22px] border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-border)]",
        compact ? "min-h-[5rem]" : "min-h-[5.8rem]",
        toneStyles(node.tone, selected)
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", nodeDotStyles(node.tone))} />
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{node.label}</p>
          {node.sublabel ? <p className="mt-1 break-words text-xs leading-5 text-current/75 [overflow-wrap:anywhere]">{node.sublabel}</p> : null}
        </div>
      </div>
    </button>
  );
}

function FlowArrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <div className="surface-inset flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[color:var(--text-muted)]">
      {direction === "right" ? <ArrowRight className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
    </div>
  );
}

function DetailPanel({
  detailId,
  onClear
}: {
  detailId: string | null;
  onClear: () => void;
}) {
  const detail = detailId ? macroFlowDetails[detailId] : null;

  return (
    <aside className="surface-strong sticky top-24 hidden min-h-[32rem] w-full min-w-0 max-w-full self-start overflow-hidden rounded-[30px] border border-[color:var(--border-soft)] xl:flex xl:max-h-[calc(100vh-7rem)] xl:flex-col">
      {!detail ? (
        <div className="flex h-full flex-col items-start justify-center gap-5 px-7 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--surface-muted)] text-[color:var(--accent-strong)]">
            <PanelRightOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">Detail Panel</p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">Click any box</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[color:var(--text-secondary)]">
              The main map stays clean. Deeper explanation opens here only when you want it.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-[color:var(--border-soft)] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    toneChipStyles(detail.tone)
                  )}
                >
                  {detail.title}
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">{detail.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClear}
                aria-label="Close detail panel"
                className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              <section className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Why this matters</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{detail.whyItMatters}</p>
              </section>

              <section className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">What it can mean</p>
                <div className="mt-4 space-y-3">
                  {detail.cases.map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-4 py-3">
                      <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">What to check next</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.checkNext.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-3 py-2 text-xs font-medium text-[color:var(--text-primary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Common mistakes</p>
                <ul className="mt-4 space-y-3">
                  {detail.commonMistakes.map((item) => (
                    <li key={item} className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Market view</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{detail.marketView}</p>
              </section>

              {detail.href ? (
                <Link
                  href={detail.href}
                  className="soft-button-accent inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition"
                >
                  {detail.hrefLabel ?? "Open related page"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

export function MacroFlowBoard({ payload }: { payload: DashboardPayload }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);

  const detailIds = useMemo(() => new Set(Object.keys(macroFlowDetails)), []);
  const nextCatalyst = useMemo(() => getNextCatalyst(payload), [payload]);
  const topStrip = useMemo(
    () => [
      { label: "Regime", value: clampLabel(payload.regimeSnapshot.title) },
      { label: "Today", value: clampLabel(nextCatalyst?.title ?? "Open calendar") },
      {
        label: "Focus",
        value: clampLabel(payload.homepage.watchlist.slice(0, 2).map((indicator) => indicator.shortName).join(" / ") || "Core watchlist")
      }
    ],
    [nextCatalyst, payload]
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopQuery);
    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
      setViewportReady(true);
    };

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  useEffect(() => {
    if (!viewportReady || typeof window === "undefined") {
      return;
    }

    const syncFromHash = () => {
      let hash = window.location.hash.replace(/^#/, "");

      try {
        hash = decodeURIComponent(hash);
      } catch {
        setSelectedId(null);
        setDrawerOpen(false);
        updateHash(null);
        return;
      }

      if (!hash || !detailIds.has(hash)) {
        setSelectedId(null);
        setDrawerOpen(false);
        return;
      }

      setSelectedId(hash);
      setDrawerOpen(!window.matchMedia(desktopQuery).matches);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [detailIds, viewportReady]);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!drawerOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        setDrawerOpen(false);

        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  function updateHash(detailId: string | null) {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = detailId
      ? `${window.location.pathname}${window.location.search}#${encodeURIComponent(detailId)}`
      : `${window.location.pathname}${window.location.search}`;

    window.history.replaceState(null, "", nextUrl);
  }

  function handleSelect(detailId: string) {
    setSelectedId(detailId);
    updateHash(detailId);

    if (!isDesktop) {
      setDrawerOpen(true);
    }
  }

  function clearSelection() {
    setSelectedId(null);
    setDrawerOpen(false);
    updateHash(null);
  }

  const selectedDetail = selectedId ? macroFlowDetails[selectedId] : null;

  return (
    <>
      <div className="min-w-0 space-y-8">
        <section className="surface-card overflow-hidden rounded-[30px] p-6 md:p-7">
          <div className="flex flex-col gap-5">
            <div>
              <p className="section-kicker">Macro Flow</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[color:var(--text-primary)]">See the path first</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">
                Click any box for detail. The main map stays visual on purpose.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {topStrip.map((item) => (
                <div key={item.label} className="surface-inset min-w-0 overflow-hidden rounded-[20px] px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="min-w-0 xl:grid xl:grid-cols-[minmax(0,1.08fr)_minmax(21.5rem,23rem)] xl:items-start xl:gap-8">
          <div className="min-w-0 space-y-8">
            <section className="space-y-4">
              <div>
                <p className="section-kicker">Start Here</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Default reading order</h2>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch xl:gap-2">
                {startHereFlow.map((node, index) => (
                  <div key={node.detailId} className="flex min-w-0 flex-col gap-3 xl:flex-1 xl:flex-row xl:items-stretch xl:gap-2">
                    <div className="min-w-0 xl:flex-1">
                      <MapNodeButton
                        node={node}
                        selected={selectedId === node.detailId}
                        onSelect={handleSelect}
                        anchorId={node.detailId}
                      />
                    </div>
                    {index < startHereFlow.length - 1 ? (
                      <>
                        <div className="xl:hidden">
                          <FlowArrow direction="down" />
                        </div>
                        <div className="hidden xl:flex xl:items-center">
                          <FlowArrow direction="right" />
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="section-kicker">Key Scenario Flows</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">The main logic chains</h2>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {scenarioFlowMaps.map((lane) => (
                  <article key={lane.id} id={lane.id} className="surface-card scroll-mt-28 overflow-hidden rounded-[26px] p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">{lane.title}</h3>
                      <button
                        type="button"
                        onClick={() => handleSelect(lane.nodes[0].detailId)}
                        className="soft-button rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
                      >
                        Open detail
                      </button>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3">
                      {lane.nodes.map((node, index) => (
                        <div key={`${lane.id}-${index}`} className="flex min-w-0 flex-col gap-3">
                          <div className="min-w-0">
                            <MapNodeButton
                              node={node}
                              selected={selectedId === node.detailId}
                              onSelect={handleSelect}
                              compact
                            />
                          </div>
                          {index < lane.nodes.length - 1 ? (
                            <>
                              <div className="flex justify-center">
                                <FlowArrow direction="down" />
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="section-kicker">What To Check Next</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Fast handoffs across the dashboard</h2>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {nextStepMaps.map((lane) => (
                  <article key={lane.id} className="surface-card overflow-hidden rounded-[26px] p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">{lane.title}</h3>
                    <div className="mt-4 flex min-w-0 flex-col gap-3">
                      {lane.nodes.map((node, index) => (
                        <div key={`${lane.id}-${index}`} className="flex min-w-0 flex-col gap-3">
                          <div className="min-w-0">
                            <MapNodeButton
                              node={node}
                              selected={selectedId === node.detailId}
                              onSelect={handleSelect}
                              compact
                            />
                          </div>
                          {index < lane.nodes.length - 1 ? (
                            <>
                              <div className="flex justify-center">
                                <FlowArrow direction="down" />
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="section-kicker">Regime Decision Tree</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Frame the tentative macro view</h2>
              </div>

              <div className="surface-card overflow-hidden rounded-[28px] p-5 md:p-6">
                <div className="mx-auto max-w-sm">
                  <MapNodeButton
                    node={regimeDecisionTree.root}
                    selected={selectedId === regimeDecisionTree.root.detailId}
                    onSelect={handleSelect}
                    anchorId={regimeDecisionTree.root.detailId}
                  />
                </div>

                <div className="mt-4 flex justify-center">
                  <FlowArrow direction="down" />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {regimeDecisionTree.branches.map((branch) => (
                    <div key={branch.branch} className="surface-inset min-w-0 overflow-hidden rounded-[22px] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-strong)]">
                        <GitBranch className="h-4 w-4" />
                        {branch.branch}
                      </div>

                      <div className="mt-4">
                        <MapNodeButton
                          node={branch.question}
                          selected={selectedId === branch.question.detailId}
                          onSelect={handleSelect}
                          anchorId={branch.branch === "Yes" ? branch.question.detailId : undefined}
                          compact
                        />
                      </div>

                      <div className="mt-3 flex justify-center">
                        <FlowArrow direction="down" />
                      </div>

                      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
                        {branch.outcomes.map((outcome) => (
                          <MapNodeButton
                            key={outcome.detailId}
                            node={outcome}
                            selected={selectedId === outcome.detailId}
                            onSelect={handleSelect}
                            anchorId={outcome.detailId}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="section-kicker">Common Mistakes</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Common traps and the cleaner path</h2>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {mistakeNodes.map((item) => (
                  <article key={item.mistake.detailId} id={item.mistake.detailId} className="surface-card overflow-hidden rounded-[24px] p-5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                      <MapNodeButton
                        node={item.mistake}
                        selected={selectedId === item.mistake.detailId}
                        onSelect={handleSelect}
                        compact
                      />
                      <div className="flex justify-center text-[color:var(--text-muted)]">
                        <ArrowRight className="hidden h-4 w-4 lg:block" />
                        <ArrowDown className="h-4 w-4 lg:hidden" />
                      </div>
                      <MapNodeButton
                        node={item.better}
                        selected={selectedId === item.better.detailId}
                        onSelect={handleSelect}
                        compact
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <DetailPanel detailId={selectedId} onClear={clearSelection} />
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition xl:hidden",
          drawerOpen && selectedDetail ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!drawerOpen || !selectedDetail}
      >
        <button
          type="button"
          aria-label="Close detail drawer"
          onClick={clearSelection}
          className={cn(
            "absolute inset-0 bg-[color:var(--overlay)] backdrop-blur-md transition",
            drawerOpen && selectedDetail ? "opacity-100" : "opacity-0"
          )}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="macro-flow-drawer-title"
          className={cn(
            "surface-strong absolute right-0 top-0 z-10 flex h-full w-[min(100vw,24rem)] max-w-full min-w-0 flex-col overflow-hidden border-l border-[color:var(--border-soft)] transition duration-200",
            drawerOpen && selectedDetail ? "translate-x-0" : "translate-x-full"
          )}
        >
          {selectedDetail ? (
            <>
              <div className="border-b border-[color:var(--border-soft)] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        toneChipStyles(selectedDetail.tone)
                      )}
                    >
                      {selectedDetail.title}
                    </span>
                    <h2 id="macro-flow-drawer-title" className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">
                      {selectedDetail.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    aria-label="Close detail drawer"
                    className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] focus-visible:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-4">
                  <section className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Why this matters</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{selectedDetail.whyItMatters}</p>
                  </section>

                  <section className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Different cases</p>
                    <div className="mt-4 space-y-3">
                      {selectedDetail.cases.map((item) => (
                        <div key={item.label} className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-4 py-3">
                          <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.label}</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">What to check next</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedDetail.checkNext.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-3 py-2 text-xs font-medium text-[color:var(--text-primary)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Common mistakes</p>
                    <ul className="mt-4 space-y-3">
                      {selectedDetail.commonMistakes.map((item) => (
                        <li key={item} className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Market view</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{selectedDetail.marketView}</p>
                  </section>

                  {selectedDetail.href ? (
                    <Link
                      href={selectedDetail.href}
                      className="soft-button-accent inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] transition"
                    >
                      {selectedDetail.hrefLabel ?? "Open related page"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <div className="text-center">
                <Waypoints className="mx-auto h-6 w-6 text-[color:var(--accent-strong)]" />
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">Select a node to open detail.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
