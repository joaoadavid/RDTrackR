import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ThemeProvider } from "@/hooks/use-theme";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Register from "./pages/Register";
import Replenishment from "./pages/inventory/Replenishment";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";
import InventoryOverview from "./pages/inventory/Overview";
import InventoryItems from "./pages/inventory/Items";
import Warehouses from "./pages/inventory/Warehouses";
import Movements from "./pages/inventory/Movements";
import Suppliers from "./pages/inventory/Suppliers";
import PurchaseOrders from "./pages/inventory/PurchaseOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
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
            {children}
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

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ROTAS PROTEGIDAS */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Products />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Orders />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AuditLog />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <InventoryOverview />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/items"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <InventoryItems />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/warehouses"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Warehouses />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/replenishment"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Replenishment />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/movements"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Movements />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/suppliers"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Suppliers />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/purchase-orders"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PurchaseOrders />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

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
