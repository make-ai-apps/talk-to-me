
import { cn } from "@/lib/utils";
import boxerIcon from '@/public/images/boxer-icon.png';
import brainIcon from '@/public/images/brain-icon.png';
import dollorIcon from '@/public/images/dollor-icon.png';
import kingIcon from '@/public/images/king-icon.png';
import { StaticImageData } from 'next/image';
import React from 'react';
export const reviews = [
    {
        name: 'The Rise and Fall of Wealth: ',
        body: 'Lessons from Losing It All',
        img: kingIcon,
    },
    {
        name: 'The Rise and Fall of Wealth: ',
        body: 'Lessons from Losing It All',
        img: brainIcon,
    },
    {
        name: 'The Rise and Fall of Wealth: ',
        body: 'Lessons from Losing It All',
        img: dollorIcon,
    },
    {
        name: 'Things I do at night',
        body: 'Naughty stories and stuff',
        img: boxerIcon,
    },
    {
        name: 'Naking',
        body: 'Lessons from Losing It All',
        img: kingIcon,
    },
]

// const firstRow = reviews.slice(0, reviews.length / 2);
// const secondRow = reviews.slice(reviews.length / 2);
export const ReviewCard = ({
    img,
    name,
    body,
}: {
    img: StaticImageData;
    name: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative h-full w-74 cursor-pointer overflow-hidden rounded-[16px] px-4 py-[10px] bg-[#3D3D3D80]"
            )}
        >
            <div className="flex flex-row gap-2">
                <div><img alt="" src={img.src} /></div>
                <div className="flex flex-col">
                    <figcaption className="text-[16px] font-medium dark:text-white">
                        {name}
                    </figcaption>
                    {/*<p className="text-xs font-medium dark:text-white/40">{"username"}</p>*/}
                    <blockquote className="text-[16px] text-[#C2C2C2]">{body}</blockquote>
                </div>
            </div>
        </figure>
    );
};
interface CallCenterProps {
    isSpeaking: boolean;
    processing: boolean;
    isMuted: boolean;
    recognizedText: string;
    stream: MediaStream | null;
    audioLevel: number;
}

const CallCenter: React.FC<CallCenterProps> = ({
}) => {
    return (
        <div className="w-full flex-1 flex items-center justify-end flex-col">
            <div className="relative flex flex-col items-center justify-end overflow-hidden w-[calc(100%+60px)] mb-[60px]">
                {/* <Marquee pauseOnHover className="[--duration:20s] p-0">
                    {firstRow.map((review) => (
                        <ReviewCard key={review.name} {...review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]">
                    {secondRow.map((review) => (
                        <ReviewCard key={review.name} {...review} />
                    ))}
                </Marquee> */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4"></div>
            </div>
        </div>
    );
};

export default CallCenter;
