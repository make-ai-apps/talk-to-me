"use client"

import { signup } from "@/actions/Auth/login"
import { Button } from "@/components/ui/button"
import image from '@/public/images/donna.jpeg'
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
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import * as z from "zod"
import Link from "next/link"

// Zod Schema
const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type IRegister = z.infer<typeof registerSchema>

const inputStyle = "!bg-[#2e3339] !mt-0 border-[#2e3339] h-auto shadow-none rounded-[14px] py-[10px] px-[15px] text-[16px] text-white  placeholder:text-[16px] placeholder:text-[#6D7072]";
export default function Page() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<IRegister>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(values: IRegister) {
        setIsLoading(true);
        try {

            const response = await signup(values);

            if (response?.error) {
                toast.error(response.error);
            } else if (response?.success) {
                toast.success(`Sign Up successful!`);
                setTimeout(() => router.push('/sign-in'), 1000)
            }
        } catch (err) {
            console.error(err)
            toast.error(GENERIC_ERR_MESG);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold text-white mb-[10px]">Hey!</h1>
                        <p className="text-balance text-white text-[14px]">
                            Welcome to Ultimate AI
                        </p>
                    </div>
                    {/* Name Field */}
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[14px] font-medium text-white mb-[10px] inline-block">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Carter" {...field} className={inputStyle} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Email Field */}
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[14px] font-medium text-white mb-[10px] inline-block">Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="example@mail.com" {...field}
                                            className={inputStyle} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Password Field */}
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[14px] font-medium text-white mb-[10px] inline-block">Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} className={inputStyle} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Confirm Password Field */}
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[14px] font-medium text-white mb-[10px] inline-block">Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} className={inputStyle} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-red-500 rounded-[16px] text-[16px] font-bold text-white shadow-none h-auto py-[12px] px-[10px]" disabled={isLoading} >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Continue"}
                    </Button>

                    <div className="text-center text-sm text-white">
                        You have an account?{" "}
                        <a href="/sign-in" className="underline underline-offset-4">
                            Sign In
                        </a>
                    </div>

                    <div className="text-[12px] text-[#6D7072] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                        By continuing, I agree to receive email/text messages from UltimateAI for service notifications.
                        I acknowledge that I am 18 years or older and agree to the Terms of Service, which is available <Link href="/terms-of-service" className="text-white underline underline-offset-4">here</Link>.
                    </div>
                </div>
            </form>

            {/* Side Image */}
            <div className="relative hidden bg-muted md:block">
                <Image
                    height={1000}
                    width={1000}
                    quality={100}
                    src={image}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </Form>
    )
}
