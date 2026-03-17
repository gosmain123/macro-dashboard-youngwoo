import { CalendarBoard } from "@/components/calendar-board";
import { getCalendarPayload } from "@/lib/dashboard";

export const metadata = {
  title: "Economic Calendar | Macro Signal Deck",
  description: "Upcoming macro releases, central bank events, auctions, and filing dates with market context."
};

export default async function CalendarPage() {
  const events = await getCalendarPayload();
  return <CalendarBoard events={events} />;
}
