import { MacroFlowBoard } from "@/components/macro-flow-board";
import { getDashboardPayload } from "@/lib/dashboard";

export const revalidate = 60;

export const metadata = {
  title: "Macro Flow | Macro Signal Deck",
  description: "A visual decision map for reading macro, connecting indicators, and building a tentative view."
};

export default async function MacroFlowPage() {
  const payload = await getDashboardPayload();
  return <MacroFlowBoard payload={payload} />;
}
