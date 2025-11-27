import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-muted-foreground">
        Restaurando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
