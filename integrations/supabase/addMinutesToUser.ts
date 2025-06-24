import type { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

export async function addMinutesToUser(
  customerId: string,
  minutesToAdd: number
) {
  const supabase: any = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // Fetch the user ID from the customers table
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id") // Ensure the "id" here is the user ID, not the Stripe ID
    .eq("stripe_customer_id", customerId)
    .single();

  if (customerError || !customer) {
    console.error("Customer not found in Supabase for Stripe ID:", customerId);
    return;
  }

  const userId = customer.id; // This should be the correct user ID

  // Add minutes to `user_calls` table
  const { error: updateError } = await supabase.from("user_calls").upsert(
    [
      {
        user_id: userId,
        used_minutes: 0,
        total_minutes: minutesToAdd,
      },
    ],
    { onConflict: ["user_id"] }
  );

  if (updateError) {
    console.error("Error adding minutes to user:", updateError);
  } else {
    console.log(`✅ Added ${minutesToAdd} minutes for user ${userId}`);
  }
}
