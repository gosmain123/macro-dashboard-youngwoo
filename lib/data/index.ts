import { calendarEvents } from "@/lib/data/calendar";
import { flowIndicators } from "@/lib/data/flows-positioning";
import { globalIndicators } from "@/lib/data/global";
import { growthIndicators } from "@/lib/data/growth";
import { inflationIndicators } from "@/lib/data/inflation";
import { laborIndicators } from "@/lib/data/labor";
import { marketInternalIndicators } from "@/lib/data/market-internals";
import { macroModules } from "@/lib/data/modules";
import { playbooks } from "@/lib/data/playbooks";
import { policyLiquidityIndicators } from "@/lib/data/policy-liquidity";
import { ratesCreditIndicators } from "@/lib/data/rates-credit";
import type { MacroIndicator } from "@/types/macro";

export const macroIndicators: MacroIndicator[] = [
  ...inflationIndicators,
  ...growthIndicators,
  ...laborIndicators,
  ...policyLiquidityIndicators,
  ...ratesCreditIndicators,
  ...marketInternalIndicators,
  ...flowIndicators,
  ...globalIndicators
];

export { calendarEvents, macroModules, playbooks };
