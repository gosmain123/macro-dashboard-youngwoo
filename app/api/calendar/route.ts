import { NextResponse } from "next/server";

import { getCalendarPayload } from "@/lib/dashboard";

export async function GET() {
  const events = await getCalendarPayload();
  return NextResponse.json({ events });
}
