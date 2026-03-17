import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[34px] border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Not found</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">That module does not exist</h1>
      <p className="mt-4 max-w-xl text-lg leading-7 text-slate-300">
        The dashboard route you requested is not part of the current module map.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        Return to dashboard
      </Link>
    </div>
  );
}
