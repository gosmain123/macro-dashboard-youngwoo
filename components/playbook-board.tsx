import type { PlaybookScenario } from "@/types/macro";

export function PlaybookBoard({ playbooks }: { playbooks: PlaybookScenario[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Playbook</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">How different regimes usually trade</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">
          Use these playbooks as a decision framework, not a script. The dashboard helps you confirm when the regime is actually changing.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        {playbooks.map((playbook) => (
          <article
            key={playbook.slug}
            className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
          >
            <h2 className="text-2xl font-semibold text-white">{playbook.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{playbook.summary}</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Typical market playbook</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{playbook.marketPlaybook}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Risk watch</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{playbook.riskWatch}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {playbook.dashboardFocus.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
