/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ResetPassword from "@/pages/ResetPassword";
import { api } from "@/lib/api";

// mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

import { useToast } from "@/hooks/use-toast";

// mock navigate + useLocation
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    search: "?email=test@test.com&code=123456",
  }),
}));

// mock API
vi.mock("@/lib/api", () => ({
  api: {
    resetPassword: vi.fn(),
  },
}));

describe("ResetPassword Page", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it("renderiza email no título", () => {
    render(<ResetPassword />);
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });

  it("valida campos vazios", async () => {
    render(<ResetPassword />);

    fireEvent.click(screen.getByRole("button", { name: /Redefinir/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Campos obrigatórios" })
    );
  });

  it("valida senha curta", async () => {
    render(<ResetPassword />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByTestId("confirm"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Redefinir/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Senha muito curta" })
    );
  });

  it("valida senhas diferentes", async () => {
    render(<ResetPassword />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByTestId("confirm"), {
      target: { value: "abcdef" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Redefinir/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Senhas diferentes" })
    );
  });

  it("redefine senha com sucesso e navega", async () => {
    (api.resetPassword as any).mockResolvedValue({});

    render(<ResetPassword />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "abcdef" },
    });
    fireEvent.change(screen.getByTestId("confirm"), {
      target: { value: "abcdef" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Redefinir/i }));

    await waitFor(() => {
      expect(api.resetPassword).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Senha redefinida!" })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("exibe erro da API", async () => {
    (api.resetPassword as any).mockRejectedValue({
      body: { message: "Código inválido" },
    });

    render(<ResetPassword />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "abcdef" },
    });
    fireEvent.change(screen.getByTestId("confirm"), {
      target: { value: "abcdef" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Redefinir/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Erro ao redefinir senha" })
      );
    });
  });
});
