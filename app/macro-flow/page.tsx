import { MacroFlowBoard } from "@/components/macro-flow-board";
import { getDashboardPayload } from "@/lib/dashboard";

export const revalidate = 60;

export const metadata = {
  title: "Macro Flow | Macro Signal Deck",
  description: "A market-logic manual for connecting macro releases to rates, USD, spreads, volatility, and asset views."
};

export default async function MacroFlowPage() {
  const payload = await getDashboardPayload();
  return <MacroFlowBoard payload={payload} />;
}
