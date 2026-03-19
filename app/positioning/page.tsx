import { LayerDashboard } from "@/components/layer-dashboard";
import { getDashboardPayload } from "@/lib/dashboard";
import { getLayerPagePayload } from "@/lib/layer-pages";

export const revalidate = 60;

export const metadata = {
  title: "Positioning | Macro Signal Deck",
  description: "Use breadth, volatility, credit, and crowding to judge whether risk appetite is healthy or fragile."
};

export default async function PositioningPage() {
  const payload = await getDashboardPayload();
  const page = getLayerPagePayload(payload, "positioning");

  return <LayerDashboard page={page} dataMode={payload.dataMode} />;
}
