import { NavLink } from "react-router-dom";
import {
  Users,
  Package,
  BarChart3,
  Settings,
  FileText,
  Warehouse,
  TrendingUp,
  ArrowLeftRight,
  Building2,
  ShoppingBag,
  Replace,
  UserCog,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/context/AuthContext";

const adminItems = [
  { title: "Usuários", icon: Users, href: "/users" },
  { title: "Relatórios", icon: BarChart3, href: "/reports" },
  { title: "Auditoria", icon: FileText, href: "/audit-log" },
];

const inventoryItems = [
  { title: "Visão Geral", icon: TrendingUp, href: "/inventory" },
  { title: "Itens", icon: Package, href: "/inventory/items" },
  { title: "Depósitos", icon: Warehouse, href: "/inventory/warehouses" },
  { title: "Reposição", icon: Replace, href: "/inventory/replenishment" },
  {
    title: "Movimentações",
    icon: ArrowLeftRight,
    href: "/inventory/movements",
  },
  { title: "Fornecedores", icon: Building2, href: "/inventory/suppliers" },
  {
    title: "Compras (PO)",
    icon: ShoppingBag,
    href: "/inventory/purchase-orders",
  },
];

const profileItems = [
  { title: "Configurações", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* ADMIN */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-primary">
              Administrador
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : ""
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* INVENTORY */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary">
            Estoque
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {inventoryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PROFILE - NOVA SEÇÃO */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary">
            Perfil
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
