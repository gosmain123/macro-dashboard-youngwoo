import { cn } from "@/lib/utils";

type MetaChipTone = "slate" | "cyan" | "emerald" | "amber" | "rose";

function toneStyles(tone: MetaChipTone) {
  if (tone === "cyan") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (tone === "emerald") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "amber") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (tone === "rose") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

export function MetaChip({
  label,
  value,
  tone = "slate",
  className
}: {
  label: string;
  value: string;
  tone?: MetaChipTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
        toneStyles(tone),
        className
      )}
    >
      <span className="text-slate-400">{label}</span>
      <span className="text-current">{value}</span>
    </span>
  );
}
