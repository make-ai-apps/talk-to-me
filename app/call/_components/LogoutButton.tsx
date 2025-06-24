"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/Auth/login";
import { LogOut } from 'lucide-react';
const LogoutButton = () => {
    const [loading, setLoading] = useState(false)
    const handleSignOut = async () => {
        setLoading(true)
        await logout()

    };
    return (
        <div className="flex justify-end absolute top-[20px] right-[20px]">
            <Button disabled={loading} onClick={() => handleSignOut()} className='bg-white/40 bg-opacity-60 shadow-none p-0 w-[50px] h-[50px]
             rounded-[16px] border border-white group focus:outline-none focus:shadow-none hover:bg-[#161A1C]'>
                <LogOut className='text-[#161A1C] group-hover:text-white group-hover:border-[#161A1C]' />
            </Button>
        </div>
    )
}

export default LogoutButton