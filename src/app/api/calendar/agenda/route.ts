import { getAgendaEvents } from "@/lib/mission-control-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getAgendaEvents();
  return Response.json({ events, rangeDays: 7 });
}
