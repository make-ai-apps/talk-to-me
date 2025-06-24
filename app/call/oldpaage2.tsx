import { Tables } from "@/database.types";
import { getProducts, getSubscription, getUser } from '@/integrations/supabase/queries';
import { createClient } from "@/integrations/supabase/server";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import PaymentCard from "./_components/Subscription/PaymentCard";

import LogoutButton from "./_components/LogoutButton";
type Product = Tables<"products">
type Price = Tables<"prices">

export interface ProductWithPrices extends Product {
    prices: Price[]
}

const Sub = async () => {
    const supabase = await createClient();

    const [user, products, subscriptions] = await Promise.all([
        getUser(supabase), // gets the currently authenticated user
        getProducts(supabase), // get all the active products with their prices
        getSubscription(supabase)
    ]);

    const packageDetails: ProductWithPrices[] | null = products && products?.filter(item => item.active == true);

    return (
        <div className="min-h-screen  text-black py-6 px-4 md:py-12">
            {
                user && <LogoutButton />
            }
            <div className="max-w-md mx-auto md:max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 leading-tight max-xsm:w-[70%] max-xsm:mx-auto max-xsm:text-[24px]">Choose Your Experience with AI Donna</h1>

                </div>

                {/* Plans Section */}
                {/* ScrollArea className="h-72 w-48 rounded-md border" */}
                <ScrollArea className="overflow-auto max-h-[80vh] p-2 md:p-4 mb-8 md:mb-12 ">
                    <div className="space-y-6 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
                        {
                            packageDetails &&
                            packageDetails.reverse().map((item, i) =>
                                <PaymentCard
                                    key={i}
                                    subscriptions={subscriptions}
                                    user={user}
                                    data={item}
                                />
                            )
                        }
                    </div>
                </ScrollArea>


            </div>
        </div>
    );
};

export default Sub;
