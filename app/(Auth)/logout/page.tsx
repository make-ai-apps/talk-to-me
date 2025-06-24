"use client"

import { useRouter } from "next/navigation"
import React, { useEffect } from "react";

export default function LogoutPage() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => router.push("/"), 2000)
    }, [router])

    return <div>You  have logged out... redirecting in a sec.</div>
}