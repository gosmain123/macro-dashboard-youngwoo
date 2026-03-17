import { NextRequest, NextResponse } from "next/server";

import { getDashboardPayload, searchIndicators } from "@/lib/dashboard";
import { macroModules } from "@/lib/data/modules";
import type { MacroModuleSlug } from "@/types/macro";

function isModuleSlug(value: string): value is MacroModuleSlug {
  return macroModules.some((module) => module.slug === value);
}

export async function GET(request: NextRequest) {
  const payload = await getDashboardPayload();
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const moduleParam = request.nextUrl.searchParams.get("module");
  const moduleFilter: MacroModuleSlug | "all" =
    moduleParam && isModuleSlug(moduleParam) ? moduleParam : "all";
  const indicators =
    search.trim().length > 0 || moduleFilter !== "all"
      ? await searchIndicators(search, moduleFilter)
      : payload.indicators;

  return NextResponse.json({
    dataMode: payload.dataMode,
    indicators,
    modules: payload.modules
  });
}
