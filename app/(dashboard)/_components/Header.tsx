import { ToggleTheme } from "@/components/toogle-theme"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ProfileDropdown } from './ProfileDropdown'
import { IAuthUser } from "@/components/nav-user"

export const Header = ({ user }: IAuthUser) => {


    return (
        <header className=" justify-between flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
            <div className="flex items-center   gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {/* <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                        </BreadcrumbItem> */}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center   gap-2 px-4">
                <Separator orientation='vertical' className='h-6' />
                <ToggleTheme />
                <ProfileDropdown user={user} />
            </div>
        </header>
    )
}

Header.displayName = 'Header'