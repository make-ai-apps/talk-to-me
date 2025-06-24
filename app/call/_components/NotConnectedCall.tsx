import image from '@/public/mobile.png';
import CallButton from "./CallButton";
import { DbPrice } from '../../../lib/db.sub-types';
import { usePurchaseMoreCredits } from '../_hooks/usePurchaseMoreCredits';
import Link from 'next/link';
import { useCheckoutAnalytics } from '../_hooks/useCheckoutAnalytics';
import { App_Name, CALL_LABEL } from '@/lib/config';

interface Props {
    remainingMinutes: number,
    user: any | undefined,
    subscription: any,
    isLoading: boolean,
    setIsSubscriptionModalOpen: (v: boolean) => void,
    handleStartCall: () => void,
    router: any,
    moreMinutesProduct: DbPrice | null
}

const NotConnectedCall = ({ remainingMinutes, user, subscription, isLoading, setIsSubscriptionModalOpen, handleStartCall, router, moreMinutesProduct }: Props) => {
    const isVisible = true
    const { purchaseMoreMinutes } = usePurchaseMoreCredits({ moreMinutesProduct, user })
    useCheckoutAnalytics({ user })

    return (
        <div className="w-full h-[100dvh] max-h-[100dvh] mx-auto flex flex-col items-center justify-center px-4 overflow-hidden relative z-10">
            <div className={`transition-all duration-1000 ease-out grid place-items-center ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
                <div className="mx-auto relative flex justify-center">
                    <div className=" h-auto overflow-hidden flex items-center justify-center">
                        <img
                            src={image.src}
                            alt={`${App_Name} contact`}
                            className="w-full object-contain"
                            style={{
                                filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
                            }}
                        />
                    </div>
                </div>

                <h1 className="text-white text-3xl md:text-[32px] font-normal text-center mb-[10px] tracking-wide mt-[-20px]">{CALL_LABEL}</h1>

                <div className={`text-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
                    <p className="text-[15px] leading-[20px] font-medium text-white/50 max-w-md mx-auto mb-[8px] tracking-[1px]">
                        Get up close and personal with {App_Name} through <br /> interactive voice calls
                        that feel real.
                    </p>

                    <div className="text-xs text-white/40 mb-[20px] underline">Powered by AI</div>

                    <div className="w-[350px] mx-auto">

                        {
                            user && subscription && <CallButton
                                label={remainingMinutes > 0 ? CALL_LABEL : 'Purchase More Credits'}
                                onClick={() => remainingMinutes > 0 ? handleStartCall() : purchaseMoreMinutes()}
                                disabled={isLoading}
                            />
                        }
                        {
                            !user &&
                            <CallButton
                                label={CALL_LABEL}
                                onClick={() => router.push("/sign-in")}
                            />
                        }

                        {user && !subscription && <CallButton
                            label={CALL_LABEL}
                            onClick={() => setIsSubscriptionModalOpen(true)}
                        />

                        }
                        {subscription && (
                            <div className="mt-2 text-xs text-white/70">
                                {subscription.plan === 'unlimited'
                                    ? 'Unlimited minutes available'
                                    : `${remainingMinutes} minutes remaining this week`}
                            </div>
                        )}
                    </div>

                    <Link href="/terms-of-service" className="text-xs text-white/40 underline">Terms of Service</Link>
                </div>
            </div>
        </div>
    )
}

export default NotConnectedCall