"use client"
import { PropsWithChildren } from 'react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { ThemeProvider as NextThemesProvider } from "next-themes";

const AppProvider = ({ children }: PropsWithChildren) => {
    return (
        <NextThemesProvider attribute="class"
            defaultTheme="light"
            // enableSystem
            disableTransitionOnChange >
            {children}
            <ProgressBar />
        </NextThemesProvider>

    )
}

export default AppProvider