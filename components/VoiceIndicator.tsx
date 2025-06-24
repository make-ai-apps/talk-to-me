interface VoiceIndicatorProps {
    isActive: boolean;
}

export const VoiceIndicator = ({ isActive }: VoiceIndicatorProps) => {
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-300 transform ${isActive
                            ? "bg-taylor-gold scale-100 animate-pulse"
                            : "bg-gray-400 scale-75"
                        }`}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        transform: isActive ? `scaleY(${1 + (i % 2) * 0.5})` : undefined,
                    }}
                />
            ))}
        </div>
    );
};