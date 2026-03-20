import { loadEnvConfig } from "@next/env";

import { refreshIndicators } from "@/lib/server/refresh";
import type { RefreshScope } from "@/types/macro";

loadEnvConfig(process.cwd());

const scope = (process.argv[2] as RefreshScope | undefined) ?? "all";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

async function main() {
  const envState = {
    supabase_url: hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabase_publishable_default_key: hasValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
    supabase_anon_key: hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabase_service_role_key: hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
    fred_api_key: hasValue(process.env.FRED_API_KEY)
  };

  console.info(
    JSON.stringify({
      event: "sync_live_data_start",
      scope,
      message: "Starting Supabase sync."
    })
  );
  console.info(
    JSON.stringify({
      event: "sync_live_data_secrets",
      message: "Secrets loaded.",
      secrets: envState
    })
  );

  if (!envState.supabase_url || !envState.supabase_service_role_key) {
    throw new Error("Supabase write secrets are not fully loaded.");
  }

  const result = await refreshIndicators(scope);

  console.info(
    JSON.stringify({
      event: "sync_live_data_rows_written",
      message: "Rows written.",
      scope,
      latest_rows_written: result.latestRowsWritten,
      sync_status_rows_written: result.syncStatusRowsWritten,
      refresh_run_rows_written: result.refreshRunRowsWritten,
      total_rows_written: result.rowsWritten,
      refreshed: result.refreshed.length,
      skipped: result.skipped.length
    })
  );

  if (result.latestRowsWritten === 0) {
    throw new Error(`Supabase sync wrote zero indicator_latest rows for scope ${scope}.`);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Live data sync failed.";
  console.error(
    JSON.stringify({
      event: "sync_live_data_error",
      scope,
      message
    })
  );
  process.exitCode = 1;
});
