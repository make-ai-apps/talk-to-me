import { getUser } from "@/integrations/supabase/queries";
import { createClient } from "@/integrations/supabase/server";
import { NextResponse } from "next/server";

export const deductMinute = async (callStart: Date, callEnd: Date) => {
  console.log("🔹 [API] Received call usage update request...");
  const supabase = await createClient();

  console.log("🔹 [API] Fetching authenticated user...");
  const user = await getUser(supabase);
  console.log("user", user);

  if (!user) {
    console.error("❌ [API] User not authenticated.");
    return NextResponse.json(
      { error: "User not authenticated." },
      { status: 401 }
    );
  }

  try {
    const user_id = user.id;
    console.log(`✅ [API] Authenticated user: ${user_id}`);

    const durationMinutes = 1
    console.log(
      `🕒 [API] Calculated Call Duration: ${durationMinutes} minutes`
    );

    const { data: userData, error: fetchError } = await supabase
      .from("user_calls")
      .select("id, total_minutes, used_minutes")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !userData) {
      console.error("❌ [API] User call record not found.", fetchError);
      return NextResponse.json(
        { error: "User call record not found." },
        { status: 404 }
      );
    }

    console.log(`✅ [API] User Call Record: ${JSON.stringify(userData)}`);

    const remainingMinutes = userData.total_minutes - userData.used_minutes;
    console.log(
      `⏳ [API] Remaining Minutes BEFORE Deduction: ${remainingMinutes}`
    );

    if (remainingMinutes <= 0) {
      console.warn("⚠️ [API] No call credits remaining.");
      return NextResponse.json(
        { error: "No call credits remaining." },
        { status: 400 }
      );
    }

    // Cap deduction to avoid over-deducting
    const actualDeduction = Math.min(durationMinutes, remainingMinutes);
    const newUsedMinutes = userData.used_minutes + actualDeduction;

    console.log(`🔹 [API] Deducting ${actualDeduction} minute(s)...`);
    const { data: updateResult, error: updateError } = await supabase
      .from("user_calls")
      .update({ used_minutes: newUsedMinutes })
      .eq("user_id", user_id)
      .select();

    if (updateError) {
      console.error(
        "❌ [API] Failed to update user call minutes.",
        updateError
      );
      return NextResponse.json(
        { error: "Failed to update user call minutes." },
        { status: 500 }
      );
    }

    if (!updateResult || updateResult.length === 0) {
      console.error("❌ [API] No rows affected in `user_calls`.");
      return NextResponse.json(
        { error: "Failed to update user call minutes." },
        { status: 500 }
      );
    }

    console.log(
      `✅ [API] Call minutes deducted. Updated Data: ${JSON.stringify(
        updateResult[0]
      )}`
    );

    console.log("🔹 [API] Storing call usage details...");
    const { data: usageInsertResult, error: usageError } = await supabase
      .from("call_usage")
      .insert([
        {
          user_id,
          call_start: callStart.toISOString(),
          call_end: callEnd.toISOString(),
          deducted_minutes: actualDeduction, // Store actual deducted
        },
      ])
      .select();

    if (usageError) {
      console.error("❌ [API] Failed to store call usage data.", usageError);
      return NextResponse.json(
        { error: "Failed to store call usage data." },
        { status: 500 }
      );
    }

    if (!usageInsertResult || usageInsertResult.length === 0) {
      console.error("❌ [API] No rows inserted into `call_usage`.");
      return NextResponse.json(
        { error: "Failed to store call usage data." },
        { status: 500 }
      );
    }

    console.log(
      `✅ [API] Call usage stored. Data: ${JSON.stringify(
        usageInsertResult[0]
      )}`
    );
    return NextResponse.json({
      success: "Call minutes deducted and usage recorded.",
    });
  } catch (error) {
    console.error("❌ [API] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }

}