import { Building2, LayoutDashboard, Users, UserCog, ArrowLeftRight, History, Search, BarChart3 } from "lucide-react";
import { NavLink } from "./NavLink";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Hospitals", url: "/hospitals", icon: Building2 },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Doctors", url: "/doctors", icon: UserCog },
  { title: "Transfer Patient", url: "/transfer", icon: ArrowLeftRight },
  { title: "Transfer History", url: "/transfers", icon: History },
  { title: "Search Records", url: "/search", icon: Search },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export const Sidebar = () => {
  const { open } = useSidebar();

  return (
    <SidebarUI className="border-r border-border">
      <SidebarContent>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            {open && (
              <div>
                <h2 className="text-lg font-bold text-foreground">CareBridge</h2>
                <p className="text-xs text-muted-foreground">Health Exchange</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
};
