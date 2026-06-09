"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  UsersIcon,
} from "lucide-react";
import { useGetUserProfile } from "@/hooks/queries";

const data = {
  user: {
    name: "Marcos",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Inventario",
      url: "/inventory",
      icon: <ListIcon />,
    },
    {
      title: "Historial",
      url: "/history",
      icon: <ChartBarIcon />,
    },
    {
      title: "Usuarios",
      url: "/users",
      icon: <UsersIcon />,
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userProfile } = useGetUserProfile();
  const navMain =
    userProfile?.role === "STAFF"
      ? data.navMain.filter((item) => item.title !== "Usuarios")
      : data.navMain;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <span className="text-base font-semibold">Inventario Demo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
