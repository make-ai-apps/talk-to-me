import type { Metadata } from "next";
import { Navbar } from "./_components/Navbar";
import { App_Name } from "@/lib/config";
export const metadata: Metadata = {
    title: `${App_Name} AI`,
    description: `${App_Name} AI`,
    openGraph: {
        type: "website", 
        title: `${App_Name} AI`,
        description: `${App_Name} AI`,
        images: [
            {
                url: "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/Wicky AI-vue.jpg",
                width: 1200,
                height: 630,
                alt: `${App_Name} AI`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image", 
        title: `${App_Name} AI`,
        description: `${App_Name} AI`,
        images: [
            "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/shadcn-vue.jpg",
        ],
    },
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
