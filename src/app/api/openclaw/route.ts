import { getOpenClawStatus } from "@/lib/mission-control-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getOpenClawStatus();
  return Response.json(status);
}
