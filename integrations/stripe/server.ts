"use server";

import Stripe from "stripe";
import { stripe } from "./config";
import { createOrRetrieveCustomer } from "@/integrations/supabase/admin";

import { Tables } from "@/database.types";
import { createClient } from "@/integrations/supabase/server";
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from "../helper";
import { getSubscription } from "../supabase/queries";

type Price = Tables<"prices">;

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function upgradeSubscription(price: Price) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Could not get user session.");
  }

  const subscription = await getSubscription(supabase)
  if (!subscription) {
    throw new Error("Could not get subscription.");
  }

  if (subscription.price_id === price.id) {
    throw new Error("You are already on this plan.");
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id)
  if (!stripeSubscription) {
    throw new Error("Could not get stripe subscription.");
  }

  await stripe.subscriptions.update(subscription.id, {
    items: [{ id: stripeSubscription.items.data[0].id, price: price.id }],
    proration_behavior: 'none',
  });
}

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = "/call"
): Promise<CheckoutResponse> {
  try {
    if (!price || !price.id) {
      throw new Error("Invalid price object.");
    }

    // Get the user from Supabase auth
    const supabase = await createClient();
    const response = await supabase?.auth?.getUser();

    if (!response || !response.data || !response.data.user) {
      console.error("Error retrieving user session:", response?.error);
      throw new Error("Could not retrieve user session.");
    }

    const { user } = response.data;

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || "",
        email: user?.email || "",
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }
    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer,
      customer_update: {
        address: "auto",
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      cancel_url: `${getURL(redirectPath)}?checkoutSuccess=false`,
      success_url: `${getURL(redirectPath)}?checkoutSuccess=true`,
    };
    console.log(
      "Trial end:",
      calculateTrialEndUnixTimestamp(price.trial_period_days)
    );
    if (price.type === "recurring") {
      params = {
        ...params,
        mode: "subscription",
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else if (price.type === "one_time") {
      params = {
        ...params,
        mode: "payment",
      };
    }

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to create checkout session.");
    }
    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id };
    } else {
      throw new Error("Unable to create checkout session.");
    }
  } catch (error) {
    console.log("Error", error);
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          "Please try again later or contact a system administrator."
        ),
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        ),
      };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = await createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error("Could not get user session.");
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || "",
        email: user.email || "",
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    if (!customer) {
      throw new Error("Could not get customer.");
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL("/call"),
      });
      if (!url) {
        throw new Error("Could not create billing portal");
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error("Could not create billing portal");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        "Please try again later or contact a system administrator."
      );
    } else {
      return getErrorRedirect(
        currentPath,
        "An unknown error occurred.",
        "Please try again later or contact a system administrator."
      );
    }
  }
}
