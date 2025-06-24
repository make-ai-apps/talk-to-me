import { getMoreMinutesProduct, getProducts, getSubscription, getUser, getUserMinutes } from '@/integrations/supabase/queries';
import { createClient } from '@/integrations/supabase/server';
import AiCallStart from './_components/AICallStart';

export interface IProduct {
    id: string;
    name: string;
    minutes: number;
    price: number;
    type: 'normal' | 'afterDark';
    prices: StripePrice;

}

interface StripePrice {
    id: string;
    type: string;
    active: boolean;
    currency: string;
    interval: string;
    metadata: {
        minutes: string;
    };
    product_id: string;
    description: string;
    unit_amount: number;
    interval_count: number;
    trial_period_days: number;
}

const Call = async () => {
    const supabase = await createClient()

    const [user, subscriptions, userMinutes, stripeProducts, moreMinutesProduct] = await Promise.all([
        getUser(supabase),
        getSubscription(supabase),
        getUserMinutes(supabase),
        getProducts(supabase), // This now returns the full Stripe product structure
        getMoreMinutesProduct(supabase)
    ]);
    const remainingMinutes = userMinutes?.total_minutes - userMinutes?.used_minutes;
    const formattedProducts: IProduct[] = [];
   
    stripeProducts?.forEach(product => {
        if (product.active) {
            if(product.metadata?.project !== 'vicky') {
                return;
            }
            // Get product type from metadata (normal or afterDark)
            const productType = product.metadata?.type as 'normal' | 'afterDark';

            product.prices.forEach((price: any) => {
                if (price.active) {
                    formattedProducts.push({
                        id: price.id,
                        name: price.description,
                        minutes: parseInt(price.metadata.minutes) || 0,
                        price: price.unit_amount / 100, // Convert cents to dollars
                        type: productType, // Add the product type for filtering
                        prices: price
                    });
                }
            });
        }
    }); 
    return (
        <>
            {/* {(user && subscriptions) && <>{remainingMinutes <= 0 ? (
                <p className="text-red-500">⚠️ You have no call credits left!</p>
            ) : <><b>Credits:</b> {userMinutes?.used_minutes + " / " + userMinutes?.total_minutes}</>}</>} */}

            <AiCallStart
                remainingMinutes={remainingMinutes}
                user={user}
                subscription={subscriptions}
                products={formattedProducts}
                moreMinutesProduct={moreMinutesProduct} />
        </>
    )
}

export default Call