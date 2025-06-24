import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { redirect, useSearchParams } from "next/navigation";

type Props = {
  user?: any;
};

export function useCheckoutAnalytics({ user }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkoutSuccess");
    if (checkoutSuccess === "false") {
      track("checkout_abandoned", {
        user_id: user?.id,
      });
      redirect("/call");
    }
  }, [searchParams]);
}
