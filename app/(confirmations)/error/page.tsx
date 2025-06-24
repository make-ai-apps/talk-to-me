"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

function ErrorCode() {
    const searchParams = useSearchParams();
    const [error, setError] = useState("Unknown Error");
    const [errorDescription, setErrorDescription] = useState("An unknown error occurred.");

    useEffect(() => {
        const errorCode = searchParams?.get("error_code");
        const errorDesc = searchParams?.get("error_description");
        if (errorCode) setError(errorCode);
        if (errorDesc) setErrorDescription(errorDesc);
    }, [searchParams]);

    return (
        <>
            <div className="flex min-h-[100vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <div className="text-center">
                        {/* Error Code */}
                        <h1 className="text-6xl font-bold text-primary mb-4">
                            {error === "otp_expired" ? "OTP Expired" : error}
                        </h1>

                        {/* Error Description */}
                        <h2 className="text-2xl font-semibold mb-4">{errorDescription}</h2>

                        <p className="text-muted-foreground mb-8 max-w-md">
                            Don&apos;t worry, even the best data sometimes gets lost in the internet.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Main
                            </Link>
                        </div>
                    </div>

                    <footer className="mt-12 text-center text-sm text-muted-foreground">
                        If you believe this is an error, please contact the support team.
                    </footer>
                </div>
            </div>
        </>

    );
}
export default function HomePage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorCode />
            </Suspense>
        </>

    );
}
