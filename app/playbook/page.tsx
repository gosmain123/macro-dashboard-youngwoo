import { PlaybookBoard } from "@/components/playbook-board";
import { getDashboardPayload } from "@/lib/dashboard";

export const revalidate = 60;

export const metadata = {
  title: "Playbook | Macro Signal Deck",
  description: "A guided macro reading order, logic-chain map, regime builder, and view builder."
};

export default async function PlaybookPage() {
  const payload = await getDashboardPayload();
  return <PlaybookBoard payload={payload} />;
}
