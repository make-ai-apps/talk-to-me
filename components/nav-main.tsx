"use client"

import { CreditCard, SquareTerminal, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems: {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean

}[] = [

    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: SquareTerminal
    },
    {
      title: 'Billing',
      url: '/billing',
      icon: CreditCard
    },

  ]
export function NavMain() {
  const pathname = usePathname()
  const activeRoute = navItems.find(route => route.url.length > 0 && pathname.includes(route.url)) || navItems[0]
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Link href={item.url} key={item.url} className={cn("rounded-none", activeRoute.url === item.url ? 'text-primary bg-primary/5' : 'text-muted-foreground')}>
            <SidebarMenuItem
              key={item.title}
              // defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
