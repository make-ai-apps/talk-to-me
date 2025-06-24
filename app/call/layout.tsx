import { App_Name } from '@/lib/config';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
        title: `Talk with ${App_Name}`,
    description: `Experience the future of celebrity interaction! Have real voice conversations with an AI version of ${App_Name} that captures her authentic personality, wit, and charm. Using advanced AI technology, you can now make natural, engaging voice calls to ${App_Name}. She'll share stories, answer questions, and interact with you like a real phone call!`,
};

const layout = async ({ children }: PropsWithChildren) => {
    return (
        <>
            {children}
        </>
    )
}

export default layout