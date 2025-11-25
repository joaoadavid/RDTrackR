import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

// Páginas
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Register from "./pages/Register";
import ForgotPassword from "@/pages/forgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Login from "./pages/Login";
import NotificationsPage from "./pages/Notifications";

import Replenishment from "./pages/inventory/Replenishment";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuditLog from "./pages/AuditLog";
import InventoryOverview from "./pages/inventory/Overview";
import InventoryItems from "./pages/inventory/Items";
import Warehouses from "./pages/inventory/Warehouses";
import Movements from "./pages/inventory/Movements";
import Suppliers from "./pages/inventory/Suppliers";
import PurchaseOrders from "./pages/inventory/PurchaseOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🔥 Layout que envolve rotas autenticadas
function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <Topbar />

          <main className="flex-1 p-6">
            <div className="mb-4">
              <Breadcrumbs />
            </div>

            {/* Renderiza rotas dentro do layout */}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* ROTAS PÚBLICAS */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 🔐 ROTAS PROTEGIDAS */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Páginas dentro do Layout */}
                  <Route path="/users" element={<Users />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/audit-log" element={<AuditLog />} />

                  {/* Notifications */}
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />

                  {/* Módulo Inventory */}
                  <Route path="/inventory" element={<InventoryOverview />} />
                  <Route path="/inventory/items" element={<InventoryItems />} />
                  <Route
                    path="/inventory/warehouses"
                    element={<Warehouses />}
                  />
                  <Route
                    path="/inventory/replenishment"
                    element={<Replenishment />}
                  />
                  <Route path="/inventory/movements" element={<Movements />} />
                  <Route path="/inventory/suppliers" element={<Suppliers />} />
                  <Route
                    path="/inventory/purchase-orders"
                    element={<PurchaseOrders />}
                  />
                </Route>
              </Route>

              {/* NOT FOUND */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
