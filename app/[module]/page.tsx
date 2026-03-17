import { notFound } from "next/navigation";

import { ModuleDashboard } from "@/components/module-dashboard";
import { macroModules } from "@/lib/data/modules";
import { getModulePayload } from "@/lib/dashboard";
import type { MacroModuleSlug } from "@/types/macro";

export function generateStaticParams() {
  return macroModules.map((module) => ({ module: module.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const entry = macroModules.find((item) => item.slug === module);

  if (!entry) {
    return {};
  }

  return {
    title: `${entry.title} | Macro Signal Deck`,
    description: entry.description
  };
}

export default async function ModulePage({
  params
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const payload = await getModulePayload(module as MacroModuleSlug);

  if (!payload) {
    notFound();
  }

  return <ModuleDashboard module={payload.module} indicators={payload.indicators} dataMode={payload.dataMode} />;
}
