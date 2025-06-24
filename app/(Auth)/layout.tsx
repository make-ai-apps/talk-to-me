import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

import { PropsWithChildren } from "react"

export default function Layout({ children }: PropsWithChildren) {
    return <div className="flex h-[100dvh]
    flex-col items-center justify-center px-[20px] md:p-10   overflow-hidden relative">

        <div className="w-full max-w-sm    rounded-[20px] py-[20px] px-[20px]">
            <div className={cn("flex flex-col")} >
                <Card className="overflow-hidden border-0 rounded-[20px]   shadow-none p-[30px] bg-[#242424]">
                    <CardContent className="grid p-0">
                        {children}
                    </CardContent>
                </Card>
                {/*<div className="text-center text-[14px] text-[#161A1CCC] */}
                {/*[&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">*/}
                {/*    By clicking continue, you agree to our <a href="#" className="font-bold text-[#161A1C]">Terms of Service</a>{" "}*/}
                {/*    and <a href="#" className="font-bold text-[#161A1C]">Privacy Policy</a>.*/}
                {/*</div>*/}
            </div>
        </div>
    </div>


}