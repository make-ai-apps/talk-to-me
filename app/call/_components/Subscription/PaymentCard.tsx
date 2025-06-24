"use client"
import { SubscriptionsWithProduct } from "@/app/(dashboard)/_components/ManageSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tables } from "@/database.types";
import { getErrorRedirect } from "@/integrations/helper";
import { getStripe } from "@/integrations/stripe/client";
import { checkoutWithStripe } from "@/integrations/stripe/server";
import { GENERIC_ERR_MESG } from "@/lib/config";
import { formatPrice } from "@/lib/formatPrice";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ProductWithPrices } from "../../oldpaage2";
type Price = Tables<"prices">;
interface Props {
    data: ProductWithPrices | null,
    subscriptions: SubscriptionsWithProduct | null;
    user: User | null;

}
const PaymentCard = ({ data, user, subscriptions }: Props) => {
    const [slectedPrice, setSelectedPrice] = useState<Price | undefined>(undefined);
    const [selectedNightPlan, setSelectedNightPlan] = useState<string>("");
    const router = useRouter()
    const currentPath = usePathname()
    console.log(data)

    const handleStripeCheckout = async () => {
        toast.info("Redirecting to checkout....")

        if (!user) {
            return router.push('/sign-in')
        }
        const { sessionId, errorRedirect } = await checkoutWithStripe(slectedPrice!, currentPath)
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

    return (
        <div  >
            <Card className="border-[#FF4D8D] bg-white text-black shadow-lg overflow-hidden">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-xl md:text-2xl leading-tight">{data?.name}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm md:text-base">
                        {data?.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={selectedNightPlan}
                        onValueChange={setSelectedNightPlan}
                        className="space-y-3"
                    >
                        {data?.prices?.map((option) => (
                            <div onClick={() => setSelectedPrice(option)} key={`night-${option.description}`} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-pink-50 transition-colors">
                                <RadioGroupItem
                                    value={`${option.description}`}
                                    id={`night-${option.description}`}
                                    className="border-[#FF4D8D]"
                                />
                                <Label htmlFor={`night-${option.description}`} className="flex-1 text-sm md:text-base">
                                    {option.description}
                                </Label>
                                <span className="text-[#FF4D8D] font-semibold text-sm md:text-base">
                                    {formatPrice(option?.currency ?? "usd", option?.unit_amount ?? 0)}/{option.interval}
                                </span>
                            </div>
                        ))}
                    </RadioGroup>
                    {
                        !user && <Button variant="default" className="w-full bg-custom-gradient-btn text-white text-[16px] rounded-[16px] !mt-[10px] !h-auto py-[10px] shadow-none
                       "
                            onClick={() => router.push("/sign-in")}>
                            Sign In & Subscribe
                        </Button>
                    }
                    {
                        (user && !subscriptions) &&
                        <Button variant="default" disabled={!selectedNightPlan} className="w-full bg-gradient-to-b from-[#ff7aac] to-[#eb5c5c] text-white rounded-[16px] text-[16px] !mt-[10px] h-auto py-[6px]" onClick={() => handleStripeCheckout()}>
                            Subscribe
                        </Button>
                    }
                    {(user && subscriptions) &&
                        <Button variant="default" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-6"
                            onClick={handleStartTalking}
                        >
                            Start Talking
                        </Button>
                    }

                </CardContent>
            </Card>
        </div>
    )
}

export default PaymentCard