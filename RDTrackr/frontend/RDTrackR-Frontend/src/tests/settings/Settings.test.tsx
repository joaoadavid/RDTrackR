/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import Settings from "@/pages/Settings";
import { api } from "@/lib/api";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

import { useToast } from "@/hooks/use-toast";

vi.mock("@/lib/api", () => ({
  api: {
    userPOST: vi.fn(),
    userPUT: vi.fn(),
    changePassword: vi.fn(),
  },
}));

describe("Settings Page", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  it("carrega o perfil inicial", async () => {
    (api.userPOST as any).mockResolvedValue({
      name: "João",
      email: "joao@test.com",
    });

    render(<Settings />);

    // os valores entram nos inputs → getByDisplayValue funciona
    expect(await screen.findByDisplayValue("João")).toBeInTheDocument();
    expect(screen.getByDisplayValue("joao@test.com")).toBeInTheDocument();
  });

  it("atualiza o perfil com sucesso", async () => {
    (api.userPOST as any).mockResolvedValue({
      name: "Maria",
      email: "maria@test.com",
    });

    (api.userPUT as any).mockResolvedValue({});

    render(<Settings />);

    await screen.findByDisplayValue("Maria");

    fireEvent.change(screen.getByDisplayValue("Maria"), {
      target: { value: "Maria Silva" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

    await waitFor(() => {
      expect(api.userPUT).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Perfil atualizado" })
      );
    });
  });

  it("erro ao atualizar perfil", async () => {
    (api.userPOST as any).mockResolvedValue({
      name: "Pedro",
      email: "pedro@test.com",
    });

    (api.userPUT as any).mockRejectedValue(new Error("fail"));

    render(<Settings />);

    await screen.findByDisplayValue("Pedro");

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Erro ao atualizar" })
      );
    });
  });

  it("valida campos obrigatórios ao trocar senha", async () => {
    (api.userPOST as any).mockResolvedValue({ name: "", email: "" });

    render(<Settings />);

    fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Campos obrigatórios" })
    );
  });

  it("valida senhas diferentes", async () => {
    (api.userPOST as any).mockResolvedValue({});

    render(<Settings />);

    fireEvent.change(screen.getByPlaceholderText("Digite sua senha atual"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite a nova senha"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita a nova senha"), {
      target: { value: "xyz" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Senhas não coincidem" })
    );
  });

  it("troca senha com sucesso", async () => {
    (api.userPOST as any).mockResolvedValue({});
    (api.changePassword as any).mockResolvedValue({});

    render(<Settings />);

    fireEvent.change(screen.getByPlaceholderText("Digite sua senha atual"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite a nova senha"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita a nova senha"), {
      target: { value: "abc" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Senha alterada!" })
      );
    });
  });

  it("erro ao trocar senha", async () => {
    (api.userPOST as any).mockResolvedValue({});
    (api.changePassword as any).mockRejectedValue(new Error("incorrect"));

    render(<Settings />);

    fireEvent.change(screen.getByPlaceholderText("Digite sua senha atual"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite a nova senha"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita a nova senha"), {
      target: { value: "abc" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Erro ao alterar senha" })
      );
    });
  });
});
