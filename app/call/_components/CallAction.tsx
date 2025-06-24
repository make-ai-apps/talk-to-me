
import React from 'react';
import { Mic, Phone, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallControlsProps {
    isMuted: boolean;
    onMuteToggle: () => void;
    onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
    isMuted,
    onMuteToggle,
    onEndCall
}) => {
    return (
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
            <div className="flex justify-center items-center gap-[80px]">
                <button
                    className="flex flex-col items-center"
                    onClick={onMuteToggle}
                    aria-label="Mute"
                >
                    <div className={cn("w-14 h-14 rounded-full  flex items-center justify-center", isMuted ? "bg-red-500" : "bg-[#3D3D3D]")}>

                        {
                            isMuted ? <MicOff /> : <Mic />
                        }
                    </div>
                    <span className="mt-2 text-[16px]">Mute</span>
                </button>

                <button
                    className="flex flex-col items-center"
                    onClick={onEndCall}
                    aria-label="End call"
                >
                    <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                        <Phone className="rotate-[135deg]" />
                    </div>
                    <span className="mt-2 text-[16px]">End</span>
                </button>
            </div>
        </div>
    );
};

export default CallControls;
