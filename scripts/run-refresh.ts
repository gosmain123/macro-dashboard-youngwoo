import { refreshIndicators } from "@/lib/server/refresh";
import type { RefreshScope } from "@/types/macro";

const scope = (process.argv[2] as RefreshScope | undefined) ?? "all";

refreshIndicators(scope)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
