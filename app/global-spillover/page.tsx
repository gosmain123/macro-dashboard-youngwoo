import { LayerDashboard } from "@/components/layer-dashboard";
import { getDashboardPayload } from "@/lib/dashboard";
import { getLayerPagePayload } from "@/lib/layer-pages";

export const revalidate = 60;

export const metadata = {
  title: "FX & Commodities | Macro Signal Deck",
  description: "Connect dollar moves, commodities, and offshore growth back to the US macro view."
};

export default async function GlobalSpilloverPage() {
  const payload = await getDashboardPayload();
  const page = getLayerPagePayload(payload, "global-spillover");

  return <LayerDashboard page={page} dataMode={payload.dataMode} />;
}
