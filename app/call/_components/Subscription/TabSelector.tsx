
import React from 'react';
import { Flame } from 'lucide-react';

interface TabSelectorProps {
    activeTab: 'afterDark' | 'normal';
    onTabChange: (tab: 'afterDark' | 'normal') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex rounded-full bg-[#3D3D3D80] mb-2 p-0.5 ">
            <button
                onClick={() => onTabChange('afterDark')}
                className={`${activeTab === 'afterDark'
                        ? 'bg-primary text-white'
                        : 'text-gray-200 hover:text-white'
                    } text-[15px] font-medium rounded-full py-[5px] flex-1 flex items-center justify-center transition-all duration-200`}
            >
                <Flame size={12} className="mr-0.5" />
                VIP
            </button>
            <button
                onClick={() => onTabChange('normal')}
                className={`${activeTab === 'normal'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-200 hover:text-white'
                    } text-[15px] font-medium rounded-full py-[5px] flex-1 flex items-center justify-center transition-all duration-200`}
            >
                Normal
            </button>
        </div>
    );
};

export default TabSelector;
