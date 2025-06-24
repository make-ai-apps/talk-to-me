"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import { getUser } from "./queries";

export const updateCallUsage = async (call_start: Date, call_end: Date) => {
  console.log("🔹 updateCallUsage triggered");
  console.log(
    `🕒 Call Start: ${call_start.toISOString()}, Call End: ${call_end.toISOString()}`
  );

  const supabase: any = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!supabase || !call_start || !call_end) {
    console.error("❌ Error: Missing required parameters.");
    return { error: "Missing required parameters." };
  }

  try {
    // ✅ Fetch the authenticated user securely
    console.log("🔹 Fetching authenticated user...");
    const user = await getUser(supabase);
    if (!user) {
      console.error("❌ Error: User not authenticated.");
      return { error: "User not authenticated." };
    }

    const user_id = user.id; // ✅ Extract user_id from authentication
    console.log(`✅ Authenticated user: ${user_id}`);

    // ✅ Calculate duration in minutes (minimum 1 minute)
    const durationMinutes = Math.max(
      1,
      Math.ceil((call_end.getTime() - call_start.getTime()) / 60000)
    );
    console.log(`🕒 Calculated Call Duration: ${durationMinutes} minutes`);

    // ✅ Fetch user's call balance
    console.log("🔹 Fetching user call balance...");
    const { data: userData, error: fetchError } = await supabase
      .from("user_calls")
      .select("id, total_minutes, used_minutes")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !userData) {
      console.error("❌ Error: User call record not found.", fetchError);
      return { error: "User call record not found." };
    }

    console.log(`✅ User Call Record: ${JSON.stringify(userData)}`);

    const remainingMinutes = userData.total_minutes - userData.used_minutes;
    console.log(`⏳ Remaining Minutes: ${remainingMinutes}`);

    if (remainingMinutes < durationMinutes) {
      console.warn("⚠️ Warning: Not enough call credits.");
      return { error: "Not enough call credits." };
    }

    // ✅ Deduct minutes in `user_calls`
    console.log("🔹 Deducting call minutes...");
    const { data: updateResult, error: updateError } = await supabase
      .from("user_calls")
      .update({ used_minutes: userData.used_minutes + durationMinutes })
      .eq("user_id", user_id)
      .select(); // Fetch updated row for confirmation

    if (updateError) {
      console.error(
        "❌ Error: Failed to update user call minutes.",
        updateError
      );
      return { error: "Failed to update user call minutes." };
    }

    if (!updateResult || updateResult.length === 0) {
      console.error("❌ Error: No rows affected in `user_calls`.");
      return { error: "Failed to update user call minutes." };
    }

    console.log(
      `✅ Call minutes deducted successfully! New Data: ${JSON.stringify(
        updateResult[0]
      )}`
    );

    // ✅ Store call details in `call_usage`
    console.log("🔹 Storing call usage details...");
    const { data: usageInsertResult, error: usageError } = await supabase
      .from("call_usage")
      .insert([
        {
          user_id,
          call_start: call_start.toISOString(),
          call_end: call_end.toISOString(),
          deducted_minutes: durationMinutes,
        },
      ])
      .select(); // Fetch inserted row for confirmation

    if (usageError) {
      console.error("❌ Error: Failed to store call usage data.", usageError);
      return { error: "Failed to store call usage data." };
    }

    if (!usageInsertResult || usageInsertResult.length === 0) {
      console.error("❌ Error: No rows inserted into `call_usage`.");
      return { error: "Failed to store call usage data." };
    }

    console.log(
      `✅ Call usage stored successfully! Inserted Data: ${JSON.stringify(
        usageInsertResult[0]
      )}`
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return { error: "An unexpected error occurred." };
  }
};
