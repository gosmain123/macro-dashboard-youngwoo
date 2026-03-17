import { PlaybookBoard } from "@/components/playbook-board";
import { getPlaybookPayload } from "@/lib/dashboard";

export const metadata = {
  title: "Regime Playbook | Macro Signal Deck",
  description: "How disinflation, re-acceleration, growth scares, stagflation, and liquidity squeezes usually trade."
};

export default async function PlaybookPage() {
  const playbooks = await getPlaybookPayload();
  return <PlaybookBoard playbooks={playbooks} />;
}
