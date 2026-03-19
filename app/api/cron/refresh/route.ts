import { NextRequest, NextResponse } from "next/server";

import { refreshIndicators } from "@/lib/server/refresh";
import type { RefreshScope } from "@/types/macro";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected) {
    return true;
  }

  const querySecret = request.nextUrl.searchParams.get("secret")?.trim() ?? "";

  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const cronHeader = request.headers.get("x-cron-secret")?.trim() ?? "";

  return (
    querySecret === expected ||
    bearerToken === expected ||
    cronHeader === expected
  );
}

async function handleRefresh(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope =
    (request.nextUrl.searchParams.get("scope") as RefreshScope | null) ?? "all";

  try {
    const result = await refreshIndicators(scope);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed.";
    console.error(JSON.stringify({ event: "refresh_job_failed", scope, error: message }));
    return NextResponse.json({ error: message, scope }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}
