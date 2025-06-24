
import { Loader2 } from 'lucide-react';

type CallButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    label: string,
    loading?: boolean
};

const CallButton = ({ onClick, disabled = false, label, loading = false }: CallButtonProps) => {
    return (
        <button
            onClick={(onClick)}
            disabled={disabled}
            className={`
        w-full px-10 pt-[16px] pb-[15px] bg-[#F43030]/90 hover:bg-[#F43030]/80 
        text-white font-medium rounded-full flex items-center justify-center 
        gap-3 transition-all duration-200 shadow-lg text-[17px]
        ${disabled ? 'opacity-70 cursor-not-allowed' : 'opacity-100'}
      `}
        >
            {
                loading ? <Loader2 className='animate-spin' /> : <>
                    <span >{label}</span></>
            }

        </button>
    );
};

export default CallButton;
