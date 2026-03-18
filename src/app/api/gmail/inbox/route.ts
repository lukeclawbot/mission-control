import { getGmailInbox } from "@/lib/mission-control-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const inbox = await getGmailInbox();
  return Response.json(inbox);
}
