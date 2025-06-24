import Stripe from "stripe";
import { stripe } from "@/integrations/stripe/config";
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
} from "@/integrations/supabase/admin";
import { addMinutesToUser } from "@/integrations/supabase/addMinutesToUser";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
]);

export async function GET() {
  return new Response(JSON.stringify({ 
    status: "Webhook endpoint is working",
    timestamp: new Date().toISOString()
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(req: Request) {
  console.log("🔔 Webhook endpoint hit");
  
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  console.log(`📝 Request body length: ${body.length}`);
  console.log(`🔑 Signature header present: ${!!sig}`);
  console.log(`🔐 Webhook secret present: ${!!webhookSecret}`);
  
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error("❌ Webhook secret not found");
      return new Response("Webhook secret not found.", { status: 400 });
    }
    
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    console.log(`❌ Request body length: ${body.length}`);
    console.log(`❌ Signature header: ${sig}`);
    console.log(`❌ Webhook secret length: ${webhookSecret?.length || 0}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "price.deleted":
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case "product.deleted":
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const payloadMinutes = invoice.lines?.data?.[0]?.price?.metadata?.minutes;
          const minutes = parseInt(payloadMinutes ?? "0", 10);
          if (isNaN(minutes) || minutes <= 0) {
            console.error("⚠️ No minutes metadata found in checkout session.");
            return;
          }

          await addMinutesToUser(
            invoice.customer as string,
            minutes
          );
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
          // ✅ Fetch plan minutes from metadata & Add Minutes to User
          const minutesToAdd =
            subscription.items.data[0]?.price?.metadata?.minutes || "0";
          const minutes = parseInt(minutesToAdd, 10);
          if (!isNaN(minutes) && minutes > 0) {
            if (event.type === "customer.subscription.created") {
              console.log(
                `✅ Adding ${minutes} minutes for customer ${subscription.customer}`
              );
              await addMinutesToUser(subscription.customer as string, minutes);
            }
          } else {
            console.warn("⚠️ No minutes metadata found in subscription.");
          }
          break;
        case "checkout.session.completed": {
          const webhookCheckoutSession = event.data.object as Stripe.Checkout.Session;
          const checkoutSession = await stripe.checkout.sessions.retrieve(webhookCheckoutSession.id, {
            expand: ["line_items"]
          })
          
          const minutes = parseInt(checkoutSession.line_items?.data?.[0]?.price?.metadata?.minutes ?? "0", 10);
          if (isNaN(minutes) || minutes <= 0) {
            console.error("⚠️ No minutes metadata found in checkout session.");
            return;
          }

          const subscriptionId = checkoutSession.subscription;
          if (checkoutSession.mode === "subscription") {
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );

            await addMinutesToUser(
              checkoutSession.customer as string,
              minutes
            );
          } else if (checkoutSession.mode === "payment") {
              await addMinutesToUser(
                checkoutSession.customer as string,
                minutes
              );
          }
        }
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      return new Response(
        "Webhook handler failed. View your Next.js function logs.",
        {
          status: 400,
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
