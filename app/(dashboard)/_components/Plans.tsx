import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { PlanSummeryProps } from "./BillingSummery";
import ManageSubscriptions from "./ManageSubscription";



export default function PricingSectionCards({ subscriptions, user, products, activeProduct }: PlanSummeryProps) {

    return (
        <>
            {/* Pricing */}
            <div className="container ">
                {/* Title */}

                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:items-center">
                    {/* Card */}
                    {
                        products?.map(item => {
                            // Safely check if prices exist and get the first price
                            const firstPrice = item?.prices?.[0];
                            if (!firstPrice) {
                                console.warn("Missing price for item:", item);
                                return null; // Skip rendering this item if no prices are available
                            }

                            // Destructure the price properties with a fallback for undefined values
                            const { unit_amount = 0, currency = "USD" } = firstPrice;

                            // Check if the product is the active one
                            const active = activeProduct === item.name?.toLocaleLowerCase();

                            // Format the price 
                            const priceString = formatPrice(currency!, unit_amount!)
                            return <Card key={item.id} className={cn(active ? 'border-primary' : '')}>
                                <CardHeader className="text-center pb-2">
                                    {
                                        active && <Badge className="uppercase w-max self-center mb-3">
                                            Activated
                                        </Badge>
                                    }

                                    <CardTitle className="!mb-7">{item.name}</CardTitle>
                                    <span className="font-bold text-5xl">{priceString}</span>
                                </CardHeader>
                                <CardDescription className="text-center w-11/12 mx-auto">
                                    {item.description}
                                </CardDescription>
                                <CardContent>
                                    <ul className="mt-7 space-y-2.5 text-sm">
                                        {
                                            item.metadata && Object.values(item.metadata).map((item, index) =>
                                                <li className="flex space-x-2" key={index}>
                                                    <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                                    <span className="text-muted-foreground">{item}</span>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <ManageSubscriptions
                                        subscriptions={subscriptions!}
                                        user={user}
                                        price={item.prices[0]}
                                        product={item}
                                    />
                                    {/* <Button className="w-full">Sign up</Button> */}
                                </CardFooter>
                            </Card>
                        })
                    }

                </div>
                {/* End Grid */}

            </div>
            {/* End Pricing */}
        </>
    );
}
