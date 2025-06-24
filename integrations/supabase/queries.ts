import { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { isProd } from "../../lib/env.utils";
import { DbSubscription } from "../../lib/db.sub-types";
import { DbPrice } from "../../lib/db.sub-types";

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
export const getUserMinutes = cache(async (supabase: SupabaseClient) => {
  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { total_minutes: 0, used_minutes: 0 };
  // Fetch user call minutes
  const { data, error } = await supabase
    .from("user_calls")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user call credits:", error);
    return { total_minutes: 0, used_minutes: 0 };
  }

  return {
    total_minutes: data?.total_minutes || 0,
    used_minutes: data?.used_minutes || 0,
  };
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  try {
    // Make sure we're querying for the current user's subscriptions
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.user) {
      console.log("No authenticated user found");
      return null;
    }

    const userId = user.user.id;
    const { data: subscription, error } = await supabase
      .from(isProd ? "subscriptions" : "subscriptions_local")
      .select(isProd ? "*, prices(*, products(*))" : "*, prices:prices_local(*, products:products_local(*))")
      .eq("user_id", userId) // Add this line to filter by the current user
      .in("status", ["trialing", "active"]);
    // No longer using maybeSingle() since we might have multiple subscriptions

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    // If we have multiple subscriptions, we can either return all of them or
    // select the most relevant one (e.g., the most recent one)
    if (subscription && subscription.length > 0) {
      console.log(`Found ${subscription.length} active subscriptions`);

      // Option 1: Return all subscriptions as an array
      // return subscription;

      // // Option 2: Return the most recent subscription (uncomment if preferred)
      // Sort by created_at in descending order and return the first one
      return subscription.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Sort in descending order (newest first)
      })[0];
    }

    return null;
  } catch (error) {
    console.error("Exception in getSubscription:", error);
    return null;
  }
});

export const getMoreMinutesProduct = async (supabase: SupabaseClient): Promise<DbPrice | null> => {
  const currentPrice = await getCurrentPrice(supabase)
  if (!currentPrice || !currentPrice.metadata?.minutes) return null

  const { data: minutesProducts, error } = await supabase
    .from(isProd ? "prices" : "prices_local")
    .select("*")
    .eq("type", 'one_time')
    .eq("product_id", currentPrice.product_id)
    .eq("active", true)

  if (error) {
    console.error("Error fetching minutes products:", error)
    return null
  }

  const matchingMinutesProduct = minutesProducts?.find(product => product.metadata?.minutes === currentPrice.metadata.minutes)
  return matchingMinutesProduct
}

const getCurrentPrice = async (supabase: SupabaseClient): Promise<DbPrice | null> => {
  const subscription = await getSubscription(supabase)
  if (!subscription || !subscription.price_id) return null

  const { data: price, error } = await supabase
    .from(isProd ? "prices" : "prices_local")
    .select("*")
    .eq("id", subscription.price_id)
    .maybeSingle()

  return price
}

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from(isProd ? "products" : "products_local")
    .select(isProd ? "*, prices(*)" : "*, prices:prices_local(*)")
    .eq("prices.type", 'recurring')
    .eq("active", true)
    .eq(isProd ? "prices.active" : "prices_local.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: isProd ? "prices" : "prices_local" });

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .single();
  return userDetails;
});
