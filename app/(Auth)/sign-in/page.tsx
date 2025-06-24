"use client"
import { login } from "@/actions/Auth/login"
import { Button } from "@/components/ui/button"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { GENERIC_ERR_MESG } from "@/lib/config"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ILogin, loginSchema } from "../_components/types"



export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()
    // 1. Define your form.
    const form = useForm<ILogin>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: undefined,
            password: undefined,
        },
    })
    // 2. Define a submit handler.
    async function onSubmit(values: ILogin) {
        setIsLoading(true);
        try {
            const response = await login(values);

            if (response?.error) {
                toast.error(response.error); // Show error toast
            } else if (response?.success) {
                toast.success("Login successful! Redirecting...");
                router.push("/call");
            }
        } catch (err) {
            console.log(err)
            toast.error(GENERIC_ERR_MESG);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <Form {...form}>
            <form className="border-0  shadow-none" onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex flex-col">
                    <div className="">
                        {/*<span className="text-white text-[14px] leading-[14px] mb-[6px] font-semibold">Unlock &apos;s World</span>*/}
                        <h1 className="text-[22px] text-white font-bold mb-[14px]">Log in</h1>
                    </div>
                    <div className="grid mb-[14px]">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[14px] leading-[14px] font-medium text-white mb-[10px] inline-block">Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder=" " {...field} className="!bg-[#2e3339] !mt-0
                                        border-[#2e3339] h-auto shadow-none rounded-[14px] py-[10px] px-[15px] text-[16px] text-white  placeholder:text-[16px] placeholder:text-[#6D7072]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid mb-[14px]">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center">
                                        <FormLabel className="text-[14px] leading-[14px] font-medium text-white mb-[10px] inline-block">Password</FormLabel>
                                        {/* <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-2 hover:underline"
                                        >
                                            Forgot your password?
                                        </a> */}
                                    </div>

                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} className="!bg-[#2e3339] !mt-0
                                        border-[#2e3339] h-auto shadow-none rounded-[14px] py-[10px] px-[15px] text-[16px] text-white  placeholder:text-[16px] placeholder:text-[#6D7072]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-custom-gradient-btn
                    rounded-[16px] text-[16px] font-bold text-white shadow-none h-auto py-[12px] px-[10px] bg-red-500" disabled={isLoading} >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Log In"}
                    </Button>


                    <div className="text-center text-[16px] mt-[18px] text-white">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="underline underline-offset-4 font-bold">
                            Sign up
                        </Link>
                    </div>
                </div>
            </form>
            {/* <div className="relative hidden bg-muted md:block">
                <Image
                    height={1000}
                    width={1000}
                    quality={100} src={image}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div> */}
        </Form>
    )
}
