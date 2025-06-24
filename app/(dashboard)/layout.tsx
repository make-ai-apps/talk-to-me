import {
    SidebarProvider
} from "@/components/ui/sidebar"
import { createClient } from '@/integrations/supabase/server'
import { PropsWithChildren } from 'react'
import { Header } from './_components/Header'
const layout = async ({ children }: PropsWithChildren) => {

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()
    const user = {
        name: data.user?.user_metadata.full_name,
        email: data.user?.email ?? ""
    }
    return (
        <>
            <SidebarProvider>
                {/* <AppSidebar user={user} /> */}
                {/* <SidebarInset> */}
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0" >
                    <Header user={user} />
                    {children}
                </main>
                {/* </SidebarInset> */}
            </SidebarProvider>
        </>
    )
}

export default layout