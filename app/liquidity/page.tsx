import { LayerDashboard } from "@/components/layer-dashboard";
import { getDashboardPayload } from "@/lib/dashboard";
import { getLayerPagePayload } from "@/lib/layer-pages";

export const revalidate = 60;

export const metadata = {
  title: "Liquidity | Macro Signal Deck",
  description: "Track Fed liquidity, Treasury cash, reserve buffers, and credit transmission in one workflow."
};

export default async function LiquidityPage() {
  const payload = await getDashboardPayload();
  const page = getLayerPagePayload(payload, "liquidity");

  return <LayerDashboard page={page} dataMode={payload.dataMode} />;
}
