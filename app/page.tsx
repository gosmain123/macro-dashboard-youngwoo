import { DashboardHome } from "@/components/dashboard-home";
import { getDashboardPayload } from "@/lib/dashboard";
import { LiveGoldQuote } from "@/components/live-gold-quote";

export const revalidate = 60;

export default async function HomePage() {
  const payload = await getDashboardPayload();

  return (
    <>
      <LiveGoldQuote />
      <DashboardHome payload={payload} />
    </>
  );
}
