import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  RequestLoginJson,
  RequestRegisterOrganizationJson,
} from "@/generated/apiClient";

interface AuthContextProps {
  isAuthenticated: boolean;
  user: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerOrganization: (
    orgName: string,
    adminName: string,
    adminEmail: string,
    adminPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  // Verifica token salvo
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiration = payload.exp * 1000;

      if (Date.now() > expiration) {
        logout();
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(storedUser);
    } catch {
      logout();
    }
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    const body = new RequestLoginJson();
    body.email = email;
    body.password = password;

    const result = await api.login(body);

    localStorage.setItem("accessToken", result.tokens?.accessToken ?? "");
    localStorage.setItem("refreshToken", result.tokens?.refreshToken ?? "");
    localStorage.setItem("user", result.name ?? "");

    setUser(result.name ?? "");
  };

  // REGISTER ORGANIZATION + ADMIN USER
  const registerOrganization = async (
    orgName: string,
    adminName: string,
    adminEmail: string,
    adminPassword: string
  ) => {
    const body = new RequestRegisterOrganizationJson();
    body.name = orgName;
    body.adminName = adminName;
    body.adminEmail = adminEmail;
    body.adminPassword = adminPassword;

    const result = await api.register(body);

    localStorage.setItem(
      "accessToken",
      result.adminUser.tokens?.accessToken ?? ""
    );
    localStorage.setItem(
      "refreshToken",
      result.adminUser.tokens?.refreshToken ?? ""
    );
    localStorage.setItem("user", result.adminUser.name ?? "");

    setUser(result.adminUser.name ?? "");
  };

  // LOGOUT
  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        registerOrganization,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
