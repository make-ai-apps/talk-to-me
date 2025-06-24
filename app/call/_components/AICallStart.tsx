"use client"
import { logout } from "@/actions/Auth/login";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { createStripePortal } from "@/integrations/stripe/server";
import bgImg from '@/public/images/vicky.jpeg';
import { useConversation } from "@11labs/react";
import { ChevronRight, Ellipsis } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IProduct } from "../page";
import ConnectedCall from "./ConnectedCall";
import NotConnectedCall from "./NotConnectedCall";
import SubscriptionModal from "./Subscription/SubscriptionModal";
import { DbPrice } from "@/lib/db.sub-types";
import { usePurchaseMoreCredits } from "../_hooks/usePurchaseMoreCredits";
import { App_Name } from "@/lib/config";

const AiCallStart = ({ remainingMinutes, user, subscription, products, moreMinutesProduct }: { remainingMinutes: number, user: any | undefined, subscription: any, products: IProduct[], moreMinutesProduct: DbPrice | null }) => {
    const [isConnected, setIsConnected] = useState(false);
    const callStartTimeRef = useRef<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const currentPath = usePathname()
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const router = useRouter();
    const [, setSlug] = useState<undefined | string>(undefined);
    const [remainingSeconds, setRemainingSeconds] = useState(remainingMinutes * 60);
    const deductLock = useRef(false)
    const { purchaseMoreMinutes } = usePurchaseMoreCredits({ moreMinutesProduct, user })

    useEffect(() => {
        const randomSlug = Math.random().toString(36).substring(2, 10); // generates a random 8-char string
        setSlug(randomSlug)
    }, []);

    // Effect to handle the call timer
    useEffect(() => {
        // Only start the timer when connected
        if (isConnected && remainingSeconds > 0) {
            timerRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    // When time is up, end the call
                    if (prev <= 1) {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                        // End the call
                        handleEndCall();
                        toast.info("Call ended: You've reached your time limit.");
                        purchaseMoreMinutes()
                        return 0;
                    }
                    const newRemainingSeconds = prev - 1;
                    if (newRemainingSeconds % 60 === 0) {
                        deductMinute()
                    }

                    return newRemainingSeconds;
                });
            }, 1000);
        }

        // Clear timer on disconnect or unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isConnected, remainingSeconds]);

    const deductMinute = async () => {
        if (deductLock.current) return
        deductLock.current = true
        try {
          const callStartTime = callStartTimeRef.current ?? new Date();
          const callEndTime = new Date();
          const response = await fetch("/api/call-usage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  call_start: callStartTime,
                  call_end: callEndTime,
              }),
          });

          const result = await response.json();

          if (result.error) {
              toast.error(result.error);
          } else {
              toast.success(result.success);
          }
        } catch (err) {
            console.log(err)
            toast.error("Failed to update call usage.");
        } finally {
            deductLock.current = false
        }
    }


    const conversation = useConversation({
        onConnect: () => {
            console.log("Connection established successfully");
            callStartTimeRef.current = new Date();
            setIsConnected(true);
            setRemainingSeconds(remainingMinutes * 60);
        },
        onDisconnect: async () => {
            setIsConnected(false);
            // Clear the timer when call ends
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            toast.info("Call ended.")

            setTimeout(() => {
                window.location.reload();
            }, 600);
        },
        onError: (error: Error | string) => {
            console.error("Conversation error:", error);
            const errorMessage = error instanceof Error ? error.message : error;
            toast.error(errorMessage || "An unexpected error occurred")

        },
    });

    useEffect(() => {
        const checkSpeaking = () => {
            if (conversation.isSpeaking !== undefined) {
                setIsSpeaking(conversation.isSpeaking);
                console.log("Speaking state changed:", conversation.isSpeaking);
            }
        };
        checkSpeaking();
    }, [conversation.isSpeaking]);
    const [isLoading, setIsLoading] = useState(false)

    const handleStripePortalRequest = async () => {
        toast.info("Redirecting to stripe portal....")
        const redirectUrl = await createStripePortal(currentPath);
        return router.push(redirectUrl)
    }
    const handleStartCall = async () => {
        const load = toast.loading(`📞 Dialing ${App_Name}... Please wait ⏳`)

        if (user && subscription)
            if (remainingMinutes <= 0) {
                toast.error("You have no call credits left.");
                return;
            }
        setIsLoading(true)
        try {
            console.log("Requesting microphone permissions...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted:", stream.active);

            console.log("Starting conversation session...");
            // Convert remaining minutes to seconds for inactivity timeout
            const inactivityTimeout = remainingMinutes * 60;
            const response = await fetch('/api/signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            if (data.error) return toast(data.error)
            await conversation.startSession({
                signedUrl: data.apiKey,
                inactivityTimeout: inactivityTimeout,

            });
            toast.success(`✅ Connected to ${App_Name}!`, { id: load });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(errorMessage || `❌ Unable to connect to ${App_Name}.Please ensure microphone access is granted.`, { id: load });
        } finally {
            setIsLoading(false)
        }
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        conversation.setVolume({ volume: isMuted ? 1 : 0 });
        console.log("Mute toggled:", !isMuted);
            toast.info(`${isMuted ? "Unmuted" : "Muted"} : ${isMuted ? `${App_Name} can hear you now` : `${App_Name} can't hear you`}`)
    };

    const handleEndCall = async () => {
        console.log("Ending call...");
        conversation.endSession();
    };

    const handleSignOut = async () => {
        await logout()
    };

    // Format remaining time for display
    const formatRemainingTime = () => {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
                <div className="absolute top-7 right-4 z-20">
                    {user ? (
                        <button
                            className="text-white text-sm font-medium transition-colors hover:text-white/80"

                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#443931] border-0 text-white">
                                    <DropdownMenuItem onClick={handleStripePortalRequest}>Billing</DropdownMenuItem>
                                    <DropdownMenuItem><a href="mailto:support@ultimate-ai-app.com">Contact Support</a></DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push("/sign-in")}
                            className="px-4 py-2 text-white text-[17px] font-medium transition-colors hover:text-white/80"

                        >
                            Login
                        </button>
                    )}
                </div>
                {user && subscription && (
                  <div className="absolute top-7 z-20">
                    <button
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="text-white/80 text-xs font-medium rounded-full w-full flex items-center justify-center"
                    >
                      Current Plan: {subscription.prices.products.name}
                      <ChevronRight />
                    </button>
                  </div>
                )}
                {isConnected && (
                    <div className="absolute top-8 left-4 z-20">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-white/70 text-xs">Remaining: {formatRemainingTime()}</span>
                        </div>
                    </div>
                )}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${bgImg.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(15px) brightness(0.6)',
                        opacity: 0.8,
                    }}
                />
                {
                    !isConnected &&
                    <NotConnectedCall moreMinutesProduct={moreMinutesProduct} router={router} handleStartCall={handleStartCall} isLoading={isLoading} setIsSubscriptionModalOpen={setIsSubscriptionModalOpen} user={user} subscription={subscription} remainingMinutes={remainingMinutes > 0 ? remainingMinutes : 0} />
                }
                {
                    isConnected && <ConnectedCall
                        handleModal={() => setIsSubscriptionModalOpen(true)}
                        isSpeaking={isSpeaking} isMuted={isMuted} handleEndCall={handleEndCall} handleMuteToggle={handleMuteToggle} />
                }
                <SubscriptionModal
                    price_id={subscription?.price_id}
                    user={user}
                    products={products}
                    isOpen={isSubscriptionModalOpen}
                    onClose={() => setIsSubscriptionModalOpen(false)}
                />

            </div>


        </>
    );
};

export default AiCallStart;