import AppProvider from "@/components/providers/AppProvider";
import type { Metadata } from "next";

import { Toaster } from "sonner";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from 'nextjs-toploader';

import bgImg from '@/public/images/vicky.jpeg';
import { AgeGateModal } from "@/components/age-gate-modal";
import { App_Name } from "@/lib/config";

export const metadata: Metadata = {
  title: `Talk with ${App_Name}`,
    description: `Experience the future of celebrity interaction! Have real voice conversations with an Ai version of ${App_Name } that captures her authentic personality, wit, and charm. Using advanced AI technology, you can now make natural, engaging voice calls to ${App_Name}. She'll share stories, answer questions, and interact with you like a real phone call!`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body suppressHydrationWarning={true}
        className={`antialiased`}
      >
        <AppProvider>
          <NextTopLoader
            color="#F43030" // Indigo color that matches your theme
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #F43030,0 0 5px #F43030"
          />
          <main className="bg-background">
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
            {children}
          </main>
          <Toaster />
        </AppProvider>
        <AgeGateModal />
        <Analytics />
      </body>
    </html>
  );
}
