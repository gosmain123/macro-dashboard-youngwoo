import { PolicyExpectationsBoard } from "@/components/policy-expectations-board";
import { getDashboardPayload } from "@/lib/dashboard";
import { getPolicyExpectationsPayload } from "@/lib/policy-expectations";

export const revalidate = 60;

export const metadata = {
  title: "Policy Expectations | Macro Signal Deck",
  description: "Separate Fed repricing from growth fear and inflation pressure across the curve."
};

export default async function PolicyExpectationsPage() {
  const payload = await getDashboardPayload();
  const policyPayload = getPolicyExpectationsPayload(payload);

  return <PolicyExpectationsBoard payload={policyPayload} dataMode={payload.dataMode} />;
}
