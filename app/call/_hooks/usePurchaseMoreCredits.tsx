import { toast } from "sonner"
import { getErrorRedirect } from "../../../integrations/helper"
import { GENERIC_ERR_MESG } from "../../../lib/config"
import { getStripe } from "../../../integrations/stripe/client"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { checkoutWithStripe } from "../../../integrations/stripe/server"
import { DbPrice } from "../../../lib/db.sub-types"
import { track } from "@vercel/analytics"

type Props = {
    user?: any
    moreMinutesProduct: DbPrice | null
}

export const usePurchaseMoreCredits = ({ moreMinutesProduct, user }: Props) => {
    const currentPath = usePathname()
    const router = useRouter()

    const purchaseMoreMinutes = async () => {
        toast.info("Redirecting to checkout....")

        const { sessionId, errorRedirect } = await checkoutWithStripe(moreMinutesProduct!, currentPath)
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
        track('recharge_checkout_started', {
            user_id: user?.id ?? '',
            product_id: moreMinutesProduct?.product_id ?? '',
            price_id: moreMinutesProduct?.id ?? '',
        })
        stripe?.redirectToCheckout({ sessionId })
    }

    return { purchaseMoreMinutes }
}