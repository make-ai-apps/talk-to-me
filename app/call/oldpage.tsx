
import { Tables } from "@/database.types";
import { getProducts, getSubscription, getUser } from '@/integrations/supabase/queries';
import { createClient } from "@/integrations/supabase/server";
import { App_Name } from "@/lib/config";
import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import AIActions from "./_components/AIActions";
import image from '@/public/images/donna.jpeg'
import LogoutButton from "./_components/LogoutButton";


type Product = Tables<"products">
type Price = Tables<"prices">

interface ProductWithPrices extends Product {
    prices: Price[]
}


export default async function CallPage() {
    const supabase = await createClient();

    const [user, products, subscriptions] = await Promise.all([
        getUser(supabase), // gets the currently authenticated user
        getProducts(supabase), // get all the active products with their prices
        getSubscription(supabase)
    ]);

    const packageDetails: ProductWithPrices = products && products?.filter(item => item.active == true)[0];
    const price = packageDetails && packageDetails?.prices[0]
    const priceString = new Intl.NumberFormat(
        "en-Us", {
        style: "currency",
        currency: price?.currency || "usd",
        minimumFractionDigits: 0
    }
    ).format((price?.unit_amount || 0) / 100)



    return (
        <>
            <LogoutButton />
            <div className="max-w-md text-center space-y-8">
                <Image
                    height={1000}
                    width={1000}
                    quality={100}
                    src={packageDetails?.image ?? image}
                    alt={`${App_Name} illustration`}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-taylor-gold"
                />
                <h1 className="text-2xl font-bold text-gray-800 !mt-0">Talk with {App_Name}</h1>

                <AIActions  
                    handleManageSubscription={() => { }}
                    minutes={0}
                    subscriptions={subscriptions}
                    user={user}
                    price={price}
                />
                {
                    packageDetails && <div className="!mt-[10px] text-gray-600">

                        <p className="text-[14px]">
                            {packageDetails?.description}
                        </p>
                        <div className="bg-white/50 p-4 rounded-lg">
                            <h2 className="font-semibold text-gray-800 mb-2">   {packageDetails?.name}{priceString}{price?.interval}</h2>
                            <ul className="text-left space-y-2">
                                {
                                    packageDetails?.metadata && Object.values(packageDetails?.metadata).map((item, index) =>
                                        <li key={index} className="flex items-center gap-2 text-[14px]" ><CircleCheckBig
                                            color="green"
                                            size={16} className="text-primary font-bold" /> {item}</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                }

            </div>

        </ >
    );
};
