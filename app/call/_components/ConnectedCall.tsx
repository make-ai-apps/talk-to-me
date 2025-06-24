import React, { useState } from 'react'
import CallControls from './CallAction'
import CallHeader from './CallHeader'
import CallCenter from './CallCenter'
import image from '@/public/images/lovable-uploads/2ce2cced1b32adf4c1ed362ed1c547ed.png';

interface Props {
    handleModal: () => void
    handleEndCall: () => void
    handleMuteToggle: () => void,
    isSpeaking: boolean,
    isMuted: boolean,
}
const ConnectedCall = ({ handleEndCall, handleMuteToggle, isMuted, isSpeaking, handleModal }: Props) => {
    const [callDuration, setCallDuration] = useState(0);
    // Event listener for VIP modal
    React.useEffect(() => {

        // Start call duration timer
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);
    return (
        <>
            <div className="h-[100dvh] w-full text-white overflow-hidden relative">
                <img
                    src={image.src}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    alt="Call background"
                />

                {/* <ChatDrawer messages={messages} /> */}

                <div className="relative z-10 flex flex-col items-start h-full w-full p-[30px] bg-black/20">
                    <CallHeader
                        setModal={handleModal}
                        callDuration={callDuration}
                    />

                    <CallCenter
                        isSpeaking={isSpeaking}
                        processing={false}
                        isMuted={isMuted}
                        recognizedText=""
                        stream={null}
                        audioLevel={0}
                    />

                    <CallControls
                        isMuted={isMuted}
                        onMuteToggle={handleMuteToggle}
                        onEndCall={handleEndCall}
                    />
                </div>

                {/* AI Conversation component */}
                {/* {callStatus === "active" && <ConversationalAI />} */}

                {/* <VIPModal isOpen={showVIPModal} onClose={() => setShowVIPModal(false)} /> */}
            </div>
        </>
    )
}

export default ConnectedCall