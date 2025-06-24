export const runtime = "edge";

export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

import {
  getSubscription,
  getUser,
  getUserMinutes,
} from "@/integrations/supabase/queries";
import { createClient } from "@/integrations/supabase/server";
import { agentKeys } from "@/lib/config";
import { NextResponse } from "next/server";
import { deductMinute } from "../call-usage/deduct-minute";

export async function POST() {
  console.log("🔹 [API] Received call request...");
  // ✅ Fetch authenticated user
  // Initialize Supabase client
  const supabase = await createClient();
  console.log("🔹 [API] Fetching authenticated user...");
  const user = await getUser(supabase);
  if (!user) {
    console.error("❌ [API] User not authenticated.");
    return NextResponse.json(
      { error: "User not authenticated." },
      { status: 401 }
    );
  }
  const subscriptions = await getSubscription(supabase);
  const remainingMinutesData = await getUserMinutes(supabase);
  const remainingMinutes =
    remainingMinutesData?.total_minutes - remainingMinutesData?.used_minutes;

  // Extract the subscription type for assigning agent
  const productType =
    (subscriptions?.prices?.products?.metadata?.type as
      | "normal"
      | "afterDark") ?? "normal";
  console.log(
    "User subscription type is " +
      productType +
      "remainingMinutes" +
      remainingMinutes
  );

  if (remainingMinutes <= 0) {
    return NextResponse.json({ error: "You have no remaining minutes." }, { status: 403 });
  }

  // Assign Agent on the bases of type
  const agentId =
    productType == "afterDark" ? agentKeys.AFTER_DARK_AGENT : agentKeys.NORNAL_AGENT;

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId) throw Error("AGENT_ID is not set or received.");
  if (!apiKey) throw Error("XI_API_KEY is not set or received.");

  try {
    const apiUrl = new URL(
      "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url"
    );
    apiUrl.searchParams.set("agent_id", agentId);
    const response = await fetch(apiUrl.toString(), {
      headers: { "xi-api-key": apiKey },
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();

    await deductMinute(new Date(), new Date());

    return NextResponse.json({ apiKey: data.signed_url });
  } catch (error) {
    const message =
      ((error as { message: string })?.message as string) || error?.toString();
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
