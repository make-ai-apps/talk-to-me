import { deductMinute } from "./deduct-minute";

export async function POST(req: Request) {
  const { call_start, call_end } = await req.json();
  const callStart = call_start ? new Date(call_start) : new Date();
  const callEnd = call_end ? new Date(call_end) : new Date();

  return await deductMinute(callStart, callEnd);
}
