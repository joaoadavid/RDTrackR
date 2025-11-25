import { createContext, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { api } from "@/lib/api";

import {
  RequestLoginJson,
  RequestRegisterOrganizationJson,
  RequestNewTokenJson,
} from "@/generated/apiClient";

interface AuthUser {
  name: string;
  email: string;
  role: string;
  organizationId: number;
  organizationName: string; // ✅ novo
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  registerOrganization: (
    orgName: string,
    adminName: string,
    adminEmail: string,
    adminPassword: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // ============================================
  // RESTAURAR SESSÃO
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setUser(null);
      setIsRestoringSession(false);
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64));
        const exp = payload?.exp;

        if (typeof exp === "number") {
          if (Date.now() > exp * 1000) {
            clearSession();
            setIsRestoringSession(false);
            return;
          }
        }
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    } finally {
      setIsRestoringSession(false);
    }
  }, []);

  // ============================================
  // INTERCEPTOR DO REFRESH
  // ============================================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (!originalRequest) return Promise.reject(error);

        const status = error.response?.status;
        const url = originalRequest.url ?? "";

        if (
          url.includes("/login") ||
          url.includes("/register") ||
          url.includes("/refresh-token")
        ) {
          return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) return Promise.reject(error);

          try {
            const tokens = await api.refreshToken(
              new RequestNewTokenJson({ refreshToken })
            );

            localStorage.setItem("accessToken", tokens.accessToken ?? "");
            localStorage.setItem("refreshToken", tokens.refreshToken ?? "");

            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${tokens.accessToken}`;

            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${tokens.accessToken}`;

            return axios(originalRequest);
          } catch (err: any) {
            if (err?.response?.status === 401) clearSession();
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email: string, password: string) => {
    const result = await api.login(new RequestLoginJson({ email, password }));

    const userPayload: AuthUser = {
      name: result.name!,
      email: result.email!,
      role: result.role!,
      organizationId: result.organizationId!,
      organizationName: result.organizationName!, // ✅ aqui!
    };

    localStorage.setItem("user", JSON.stringify(userPayload));
    localStorage.setItem("accessToken", result.tokens?.accessToken ?? "");
    localStorage.setItem("refreshToken", result.tokens?.refreshToken ?? "");

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${result.tokens?.accessToken}`;

    setUser(userPayload);
  };

  // ============================================
  // REGISTRO DE ORGANIZAÇÃO
  // ============================================
  const registerOrganization = async (
    orgName,
    adminName,
    adminEmail,
    adminPassword
  ) => {
    const result = await api.register(
      new RequestRegisterOrganizationJson({
        name: orgName,
        adminName,
        adminEmail,
        adminPassword,
      })
    );

    const admin = result.adminUser;

    const userPayload: AuthUser = {
      name: admin.name!,
      email: admin.email!,
      role: admin.role!,
      organizationId: admin.organizationId!,
      organizationName: admin.organizationName!, // ✅
    };

    localStorage.setItem("user", JSON.stringify(userPayload));
    localStorage.setItem("accessToken", admin.tokens?.accessToken ?? "");
    localStorage.setItem("refreshToken", admin.tokens?.refreshToken ?? "");

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${admin.tokens?.accessToken}`;

    setUser(userPayload);
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const logout = () => clearSession();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !isRestoringSession,
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
