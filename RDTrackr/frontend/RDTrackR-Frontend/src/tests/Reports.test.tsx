/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";

import Reports from "@/pages/Reports";
import {
  ResponseReportsJson,
  ResponseRecentPurchaseOrderJson,
} from "@/generated/apiClient";

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    reports: vi.fn(),
  },
}));

import { api } from "@/lib/api";
const mockedReports = vi.mocked(api.reports);

const MOCK_REPORTS = new ResponseReportsJson({
  totalPurchaseOrders: 10,
  totalValuePurchased: 12345.67,
  pendingPurchaseOrders: 3,
  cancelPurchaseOrders: 2,
  recentOrders: [
    new ResponseRecentPurchaseOrderJson({
      supplierName: "Fornecedor A",
      status: "PAID",
      total: 1000.5,
      createdAt: new Date(2025, 1, 1), // 01/02/2025
    }),
    new ResponseRecentPurchaseOrderJson({
      supplierName: "Fornecedor B",
      status: "PENDING",
      total: 250,
      createdAt: new Date(2025, 1, 10), // 10/02/2025
    }),
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedReports.mockResolvedValue(MOCK_REPORTS);
});

const setup = () => {
  render(<Reports />);
};

it("deve exibir 'Carregando...' enquanto busca os relatórios", async () => {
  mockedReports.mockImplementationOnce(
    () => new Promise(() => {}) as any // promise pendente
  );

  setup();

  expect(await screen.findByText(/carregando\.\.\./i)).toBeInTheDocument();
});

it("deve renderizar os KPIs com os valores retornados pela API", async () => {
  setup();

  await waitFor(() => {
    expect(mockedReports).toHaveBeenCalledTimes(1);
  });

  expect(screen.getByText("10")).toBeInTheDocument();

  expect(screen.getByText(/12\.345,67/)).toBeInTheDocument();

  expect(screen.getByText("3")).toBeInTheDocument();

  expect(screen.getByText("2")).toBeInTheDocument();
});

it("deve renderizar tabela com pedidos recentes", async () => {
  setup();

  const rowSupplierA = await screen.findByText(/fornecedor a/i);
  expect(rowSupplierA).toBeInTheDocument();

  expect(screen.getByText(/1\.000,50/)).toBeInTheDocument();

  expect(screen.getByText("01/02/2025")).toBeInTheDocument();
  expect(screen.getByText("10/02/2025")).toBeInTheDocument();

  const rowA = rowSupplierA.closest("tr") as HTMLTableRowElement;
  expect(within(rowA).getByText(/pago/i)).toBeInTheDocument();

  const cellSupplierB = await screen.findByText(/fornecedor b/i);
  const rowB = cellSupplierB.closest("tr") as HTMLTableRowElement;
  expect(within(rowB).getByText(/pendente/i)).toBeInTheDocument();
});

it("deve exibir mensagem de nenhum registro quando não houver pedidos recentes", async () => {
  mockedReports.mockResolvedValueOnce(
    new ResponseReportsJson({
      totalPurchaseOrders: 0,
      totalValuePurchased: 0,
      pendingPurchaseOrders: 0,
      cancelPurchaseOrders: 0,
      recentOrders: [],
    })
  );

  setup();

  expect(
    await screen.findByText(/nenhum registro encontrado\./i)
  ).toBeInTheDocument();
});

it("deve exibir toast de erro quando a API falhar", async () => {
  mockedReports.mockRejectedValueOnce(new Error("Erro ao buscar relatórios"));

  setup();

  await waitFor(() => {
    expect(mockedReports).toHaveBeenCalledTimes(1);
  });

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro ao carregar relatórios",
      description: "Não foi possível carregar os dados.",
      variant: "destructive",
    })
  );
});
