
import { SubscriptionsWithProduct } from "@/app/call/_components/AIActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/database.types";
import { formatPrice } from "@/lib/formatPrice";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";

type Product = Tables<"products">
type Price = Tables<"prices">

interface ProductWithPrices extends Product {
    prices: Price[]
}
export interface PlanSummeryProps {
    subscriptions: SubscriptionsWithProduct | null,
    user: User | null,
    products: ProductWithPrices[] | null,
    activeProduct?: string
}
const BillingSummery = async ({ subscriptions }: PlanSummeryProps) => {

    if (!subscriptions || subscriptions.status !== 'active') {
        return <Card className="max-w-5xl" >
            <CardContent className="px-5 py-4">
                <h3 className="pb-4 text-base font-semibold flex flex-wrap items-center">
                    <span>Plan Summery</span>
                    <Badge variant={'secondary'} className="bg-primary/10" >No Plans</Badge>
                </h3>

            </CardContent>

        </Card>
    }
    const { unit_amount, currency, interval } = subscriptions?.prices as any
    const priceString = formatPrice(currency, unit_amount)
    return (
        < >
            <  >
                <h3 className="pb-4 text-base font-semibold flex flex-wrap items-center">
                    <span>Plan Summery</span>
                    <Badge variant={'secondary'} className="bg-primary/10" >Yes Plans</Badge>

                </h3>
                <div className="col-span-3 flex flex-row justify-between flex-wrap">
                    <div className="flex flex-col pb-0">
                        <div className="text-sm font-notmal">
                            Price/{interval}
                        </div>
                        <div className="flex-1 pt-1 text-sm font-medium">
                            {priceString}
                        </div>
                    </div>
                    <div className="flex flex-col pb-0">
                        <div className="text-sm font-notmal">
                            Included Minutes
                        </div>
                        <div className="flex-1 pt-1 text-sm font-medium">
                            Unlimited
                        </div>
                    </div>
                    <div className="flex flex-col pb-0">
                        <div className="text-sm font-notmal">
                            Renewal Date
                        </div>
                        <div className="flex-1 pt-1 text-sm font-medium">
                            {format(new Date(subscriptions.current_period_end), 'MMM d, yyyy')}
                        </div>
                    </div>
                </div>
            </  >

        </>
    )
}

export default BillingSummery