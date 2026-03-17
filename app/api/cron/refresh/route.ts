import { NextRequest, NextResponse } from "next/server";

import { refreshIndicators } from "@/lib/server/refresh";
import type { RefreshScope } from "@/types/macro";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = (request.nextUrl.searchParams.get("scope") as RefreshScope | null) ?? "all";
  const result = await refreshIndicators(scope);

  return NextResponse.json(result);
}
