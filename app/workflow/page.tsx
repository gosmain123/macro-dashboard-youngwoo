import { WorkflowBoard } from "@/components/workflow-board";
import { getWorkflowPayload } from "@/lib/workflow";

export const revalidate = 60;

export const metadata = {
  title: "Workflow | Macro Signal Deck",
  description: "Release radar, surprises, curated headlines, and daily change tracking for macro investors."
};

export default async function WorkflowPage() {
  const payload = await getWorkflowPayload();

  return <WorkflowBoard payload={payload} />;
}

