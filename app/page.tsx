import { DashboardHome } from "@/components/dashboard-home";
import { getDashboardPayload } from "@/lib/dashboard";

export const revalidate = 60;

export default async function HomePage() {
  const payload = await getDashboardPayload();

  return <DashboardHome payload={payload} />;
}
