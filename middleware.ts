import { updateSession } from "@/integrations/supabase/middleware";
import ip from "@arcjet/ip";
import arcjet, { shield, slidingWindow } from "@arcjet/next";
import { type NextRequest, NextResponse } from "next/server";

// Initialize Arcjet with rules directly inside the configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: "LIVE", // Block SQL injection, XSS, and other attacks
    }),
    // slidingWindow({
    //   mode: "LIVE",
    //   interval: 60, // 60-second window
    //   max: 10, // Allow max 10 requests per window
    // }),
    // detectBot({
    //   mode: "LIVE", // Block all bots
    //   allow: [], // Empty array = no bots allowed
    // }),
  ],
});

export async function middleware(request: NextRequest) {
  // Skip middleware for Stripe webhooks to preserve raw body
  if (request.nextUrl.pathname === "/api/webhooks/stripe") {
    return NextResponse.next();
  }

  // Extract user IP (Next.js 15 doesn't provide IP natively)
  const userIp =
    process.env.NODE_ENV === "development" ? "127.0.0.1" : ip(request);

  // Run Arcjet security checks
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: decision.reason.isRateLimit()
          ? "Too Many Requests"
          : "Forbidden",
      },
      {
        status: decision.reason.isRateLimit() ? 429 : 403,
      }
    );
  }

  // If request passes security, proceed with Supabase session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Image assets (svg, png, jpg, etc.)
     * - Stripe webhooks (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
