import { NextResponse } from "next/server";

import {
  buildDataHealthPayload,
  loadLiveRuntimeSnapshot,
  mergeIndicatorsFromRuntime
} from "@/lib/server/runtime-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await loadLiveRuntimeSnapshot();
  const indicators = mergeIndicatorsFromRuntime(snapshot);
  const payload = buildDataHealthPayload(snapshot, indicators);

  return NextResponse.json(payload, {
    status: snapshot.readable ? 200 : 503
  });
}
