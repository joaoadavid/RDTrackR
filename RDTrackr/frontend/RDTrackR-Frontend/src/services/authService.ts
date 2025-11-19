import {
  RequestLoginJson,
  RequestRegisterUserJson,
  RequestNewTokenJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";

export const authService = {
  login: async (email: string, password: string) => {
    const request = new RequestLoginJson({ email, password });

    const response = await api.login(request);

    saveAuthTokens(response);

    return response;
  },

  register: async (name: string, email: string, password: string) => {
    const request = new RequestRegisterUserJson({
      name,
      email,
      password,
    });

    const response = await api.userPOST(request); // POST /user

    saveAuthTokens(response);

    return response;
  },

  logout: async () => {
    const refresh = localStorage.getItem("refreshToken");

    if (refresh) {
      await api.logout(refresh);
    }

    clearAuthTokens();
    window.location.href = "/login";
  },

  refresh: async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return null;

    const request = new RequestNewTokenJson({
      refreshToken: refresh,
    });

    const tokens = await api.refreshToken(request);

    localStorage.setItem("token", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    return tokens;
  },
};

function saveAuthTokens(response: any) {
  localStorage.setItem("token", response.tokens?.accessToken ?? "");
  localStorage.setItem("refreshToken", response.tokens?.refreshToken ?? "");
  localStorage.setItem("tokenId", response.tokens?.tokenId ?? "");
  localStorage.setItem("name", response.name ?? "");
}

function clearAuthTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenId");
  localStorage.removeItem("name");
}
