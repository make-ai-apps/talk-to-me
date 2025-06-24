"use client"
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import { getErrorRedirect } from "@/integrations/helper";
import { getStripe } from "@/integrations/stripe/client";
import { checkoutWithStripe } from "@/integrations/stripe/server";
import { GENERIC_ERR_MESG } from "@/lib/config";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type Product = Tables<"products">;
type Price = Tables<"prices">;
type Subscriptions = Tables<"subscriptions">;


export interface PriceWithProduct extends Price {
    products: Product | null;
}
export interface SubscriptionsWithProduct extends Subscriptions {
    prices: PriceWithProduct | null;
}

const AIActions = ({
    subscriptions,
    user,
    price,
    minutes,
    handleManageSubscription
}: {
    subscriptions: SubscriptionsWithProduct | null;
    user: User | null;
    price: Price | null;
    minutes: number,
    handleManageSubscription: () => void
}) => {
    const router = useRouter()
    const currentPath = usePathname()


    const handleStripeCheckout = async (price: Price) => {
        console.log("Price", price)
        toast.info("Redirecting to checkout....")

        if (!user) {
            return router.push('/sign-in')
        }
        const { sessionId, errorRedirect } = await checkoutWithStripe(price, currentPath)
        if (!sessionId) {
            return router.push(getErrorRedirect(
                currentPath,
                "An unknown error occured",
                GENERIC_ERR_MESG
            ))
        }
        if (errorRedirect) {
            return router.push('/error')
        }
        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId })
    };
    const handleStartTalking = () => {
        router.push("/call")
    }

    if (!user) {
        return (
            <Button variant="default" className="w-full bg-custom-gradient-btn text-white text-[16px] rounded-[16px] !mt-[10px] !h-auto py-[10px] shadow-none
            "
                onClick={() => router.push("/sign-in")}>
                Sign In & Subscribe
            </Button>
        );
    }
    if (user && !subscriptions) {
        return (
            <Button variant="default" className="w-full bg-gradient-to-b from-[#ff7aac] to-[#eb5c5c] text-white rounded-[16px] text-[16px] !mt-[10px] h-auto py-[6px]" onClick={() => handleStripeCheckout(price!)}>
                Subscribe
            </Button>
        );
    }
    if (user && subscriptions) {
        return (
            <Button variant="default" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-6"
                onClick={minutes > 0 ? handleStartTalking : handleManageSubscription}>
                {minutes > 0 ? 'Start Talking' : 'Purchase More Credits'}
            </Button>
        );
    }

    return null;
};


export default AIActions


