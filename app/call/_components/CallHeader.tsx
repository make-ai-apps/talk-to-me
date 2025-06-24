
import { App_Name } from '@/lib/config';
import React from 'react';

interface CallHeaderProps {
    callDuration: number;
    setModal: () => void
}

const CallHeader: React.FC<CallHeaderProps> = ({
    callDuration,
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full flex items-center justify-center flex-col">
            <div className="w-full text-center mb-6">

                {/* <span className="inline-block text-[#C2C2C280] text-[15px] leading-[15px]">Try a video chat with </span>  */}

            </div>

            <h1 className="text-[32px] leading-[32px] font-normal text-white mt-1">{App_Name}</h1>
            <div className="flex items-center justify-center">
                <div className="text-[#FFFFFFA8] text-[21px] font-light">
                    {formatTime(callDuration)}
                </div>
            </div>

        </div>
    );
};

export default CallHeader;
