import { ApiError } from "./apiError";

export async function customFetch(input: RequestInfo, init?: RequestInit) {
  const accessToken = localStorage.getItem("accessToken");

  // Headers iniciais (não sobrescreve os existentes)
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(input, {
    ...init,
    headers,
  });

  //
  // ============================
  //   TENTAR REFRESH TOKEN
  // ============================
  //
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        // CHAMADA DIRETA (sem o ApiClient/NSwag)
        const refreshResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/token/refresh-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!refreshResponse.ok) {
          throw new Error("Refresh token inválido.");
        }

        const newTokens = await refreshResponse.json();

        // Salvar novos tokens
        localStorage.setItem("accessToken", newTokens.accessToken);
        localStorage.setItem("refreshToken", newTokens.refreshToken);

        // Refazer request original com token atualizado
        const retryHeaders: any = {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${newTokens.accessToken}`,
        };

        response = await fetch(input, {
          ...init,
          headers: retryHeaders,
        });
      } catch (err) {
        // Refresh falhou → derruba sessão completamente
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        throw err;
      }
    }
  }

  //
  // ============================
  //  ERRO APÓS REFRESH
  // ============================
  //
  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: response.statusText };
    }

    throw new ApiError(json.message, response.status, json);
  }

  return response;
}
