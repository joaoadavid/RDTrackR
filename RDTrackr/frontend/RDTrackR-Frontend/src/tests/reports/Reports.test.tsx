/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import Reports from "@/pages/Reports";
import { api } from "@/lib/api";

// =======================
// MOCK do useToast
// =======================
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

import { useToast } from "@/hooks/use-toast";

// =======================
// MOCK da API
// =======================
vi.mock("@/lib/api", () => ({
  api: {
    reports: vi.fn(),
  },
}));

describe("Reports Page", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  const mockData = {
    totalPurchaseOrders: 12,
    totalValuePurchased: 5400,
    pendingPurchaseOrders: 3,
    cancelPurchaseOrders: 2,
    recentOrders: [
      {
        supplierName: "Fornecedor XP",
        status: "PAID",
        total: 1200.5,
        createdAt: "2025-02-10T00:00:00Z",
      },
    ],
  };

  // ======================================================
  it("renderiza os KPIs corretamente", async () => {
    (api.reports as any).mockResolvedValue(mockData);

    render(<Reports />);

    // aguarda load
    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText(/R\$ 5\.400,00/)).toBeInTheDocument();
  });

  it("renderiza pedidos recentes corretamente", async () => {
    (api.reports as any).mockResolvedValue(mockData);

    render(<Reports />);

    expect(await screen.findByText("Fornecedor XP")).toBeInTheDocument();

    expect(screen.getByText("Pago")).toBeInTheDocument();

    expect(screen.getByText(/R\$ 1\.200,50/)).toBeInTheDocument();

    expect(
      screen.getByText((text) => text.includes("2025") || text.includes("25"))
    ).toBeInTheDocument();
  });

  it("exibe 'Nenhum registro encontrado' quando não há pedidos", async () => {
    (api.reports as any).mockResolvedValue({
      ...mockData,
      recentOrders: [],
    });

    render(<Reports />);

    expect(
      await screen.findByText("Nenhum registro encontrado.")
    ).toBeInTheDocument();
  });

  it("exibe 'Carregando...' enquanto busca dados", async () => {
    let resolveCall: any;

    (api.reports as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCall = resolve;
        })
    );

    render(<Reports />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();

    resolveCall(mockData);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });
  });

  it("chama toast em caso de erro", async () => {
    (api.reports as any).mockRejectedValue(new Error("fail"));

    render(<Reports />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao carregar relatórios",
        })
      );
    });
  });
});
