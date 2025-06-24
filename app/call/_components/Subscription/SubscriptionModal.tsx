import { Flame, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import TabSelector from './TabSelector';
import { IProduct } from '../../page';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { getErrorRedirect } from '@/integrations/helper';
import { checkoutWithStripe, createStripePortal, upgradeSubscription } from '@/integrations/stripe/server';
import { App_Name, GENERIC_ERR_MESG } from '@/lib/config';
import { getStripe } from '@/integrations/stripe/client';
import { track } from '@vercel/analytics';
import Link from 'next/link';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: IProduct[];
    user: any,
    price_id: string
}
import { Tables } from "@/database.types";

type Price = Tables<"prices">
const SubscriptionModalContent: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
    user,
    products = [], // Provide default empty array
    price_id,
}) => {
    const [activeTab, setActiveTab] = useState<'afterDark' | 'normal'>('normal');
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const router = useRouter()
    const currentPath = usePathname()
    // Filter products based on active tab
    const filteredProducts = products.filter(product => product.type === activeTab);
    // Update selected plan when tab changes or when products load
    useEffect(() => {
        if (filteredProducts.length > 0) {
            setSelectedPlan(filteredProducts[0].id);
            setSelectedPrice(filteredProducts[0].prices as any);
        } else {
            setSelectedPlan('');
        }
    }, [activeTab, products]);

    const [slectedPrice, setSelectedPrice] = useState<Price | undefined>(undefined);

    const handleStripePortalRequest = async () => {
        toast.info("Redirecting to stripe portal....")
        const redirectUrl = await createStripePortal(currentPath);
        return router.push(redirectUrl)
    }

    const handleStripeCheckout = async () => {
        if (price_id) {
            toast.info("Upgrading subscription....")
            track('subscription_upgrade_requested', {
                user_id: user?.id ?? '',
                product_id: slectedPrice?.product_id ?? '',
                price_id: slectedPrice?.id ?? '',
            })
            await upgradeSubscription(slectedPrice!)
            await handleStripePortalRequest()
            return;
        }

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
        track('subscription_checkout_started', {
            user_id: user?.id ?? '',
            product_id: slectedPrice?.product_id ?? '',
            price_id: slectedPrice?.id ?? '',
        })
        stripe?.redirectToCheckout({ sessionId })
    };
    const loading = false;
    if (!isOpen) return null;

    const currentPlanSelected = selectedPlan === price_id

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative bg-[#7F7F7F80] backdrop-blur-md w-[360px]
              h-[637px] overflow-y-auto rounded-[24px] shadow-xl z-50
             border border-gray-700/30 animate-in fade-in duration-300 slide-in-from-bottom-5">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 bg-[#7F7F7F80]
                     hover:bg-gray-700/50 text-white/70 hover:text-white p-1 rounded-full h-6 w-6 flex items-center justify-center transition-colors z-10"
                >
                    <X size={14} />
                </button>

                <div className="absolute w-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-[20px]">
                    <div className=" py-2 pt-2">
                        <div className="flex items-center mb-[8px]">
                            {activeTab === 'afterDark' && <Flame size={18} className="text-white/90 mr-1.5" />}
                            <h2 className="text-[20px] font-medium text-white">
                                {activeTab === 'afterDark' ? `${App_Name} After Dark` : `Day ${App_Name}`}
                            </h2>
                        </div>

                        <p className="text-[#C2C2C2] text-[15px] leading-[20px] mb-1.5">
                            {activeTab === 'afterDark'
                                    ? `A intimate experience with AI ${App_Name} - personal, playful, and completely uncensored.`
                                : `A friendly, engaging experience with AI ${App_Name}-personal chats, lifestyle tips, and genuine connection.`}
                        </p>

                        <div className="border-t border-[#C2C2C280] my-[18px]"></div>
                        {
                            activeTab == 'afterDark' && <div className="grid grid-cols-1 gap-y-1 gap-x-[5px] mb-[24px]">
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Completely Unrestricted</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Bold & Unfiltered</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Deeply Personal Conversations</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Intimate Voice Chats</span>
                                </div>
                            </div>

                        }
                        {

                            activeTab == 'normal' && <div className="grid grid-cols-1 gap-y-1 gap-x-[5px] mb-[24px]">
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Fun, Friendly Conversations</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Engaging Lifestyle Chats</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Ask {App_Name} Anything</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-[11px] h-[11px] rounded-full bg-[#C2C2C2] mr-1"></div>
                                    <span className="text-white text-[15px]">Personalized Interaction</span>
                                </div>
                            </div>
                        }
                        {/* Features */}

                        <p className="text-[#C2C2C2] text-[15px] leading-[20px] mb-1.5">
                            Recurring minutes per week
                        </p>
                        <div className="space-y-1.5 mb-[16px]">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedPrice(product.prices as any)
                                        setSelectedPlan(product.id)
                                    }}
                                    className="bg-[#3D3D3D80] hover:bg-gray-700/70
                                   transition-colors rounded-[12px] px-[16px] py-[12px] flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${selectedPlan === product.id ? 'bg-[#fff]' : 'border border-white/50'} mr-1.5`}></div>
                                        <span className="text-white text-[16px]">{product.name}</span>
                                    </div>
                                    <span className="text-[#C2C2C2] text-[15px]">${product.price}/{product.prices.interval}</span> </div>
                            ))}
                        </div>

                        <button

                            onClick={currentPlanSelected ? handleStripePortalRequest : handleStripeCheckout}
                            disabled={loading || filteredProducts.length === 0}
                            className={`w-full bg-primary hover:opacity-90
                            text-white text-[17px] font-medium py-[10px] rounded-[100px] transition-all ${filteredProducts.length === 0 ? 'opacity-50' : ''}`}
                        >
                            {currentPlanSelected ? 'Current Plan' : <>{loading ? 'Processing...' : price_id ? 'Change Plan' : activeTab === 'afterDark' ? 'Unlock VIP' : 'Subscribe'}</>}
                        </button>

                        <div className="mt-[16px] text-center text-[#C2C2C2] text-[12px] space-y-0.5">
                            <p className='font-bold'>Billed weekly until cancelled.</p>
                            <Link href="/terms-of-service" className="text-white/40 underline">Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModalContent;