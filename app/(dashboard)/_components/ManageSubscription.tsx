"use client"
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import { getErrorRedirect } from "@/integrations/helper";
import { getStripe } from "@/integrations/stripe/client";
import { checkoutWithStripe, createStripePortal } from "@/integrations/stripe/server";
import { GENERIC_ERR_MESG } from "@/lib/config";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type Product = Tables<"products">;
type Price = Tables<"prices">;
type Subscriptions = Tables<"subscriptions">;


interface PriceWithProduct extends Price {
    products: Product | null;
}
export interface SubscriptionsWithProduct extends Subscriptions {
    prices: PriceWithProduct | null;
}

const ManageSubscriptions = ({
    subscriptions,
    user,
    price,
    product
}: {
    subscriptions: SubscriptionsWithProduct | null;
    user: User | null;
    price: Price | null;
    product: any | null
}) => {
    const router = useRouter()
    const currentPath = usePathname()
    const handleStripePortalRequest = async () => {
        toast.info("Redirecting to stripe portal....");
        const redirectUrl = await createStripePortal(currentPath);
        return router.push(redirectUrl)
    }

    const handleStripeCheckout = async (price: Price) => {
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

    if (user && subscriptions && subscriptions.prices?.products?.name?.toLocaleLowerCase() === product?.name?.toLocaleLowerCase()) {
        return (
            <Button variant="default" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-6" onClick={handleStripePortalRequest}>
                Manage Subscription
            </Button>
        );
    }
    // Case 2: User is logged in and has an active subsc for a different plan
    if (user && subscriptions) {
        return (
            <Button variant="outline" className="w-full  text-lg py-6" onClick={handleStripePortalRequest}>
                Switch
            </Button>
        );
    }
    if (user && !subscriptions) {
        return (
            <Button variant="default" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-6" onClick={() => handleStripeCheckout(price!)}>
                Change Plan
            </Button>
        );
    }
    return null
};


export default ManageSubscriptions


