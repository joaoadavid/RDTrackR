import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/react";
import { vi } from "vitest";

import PurchaseOrders from "@/pages/inventory/PurchaseOrders";

import {
  ResponsePurchaseOrderJson,
  ResponsePurchaseOrderItemJson,
  ResponsePurchaseOrderJsonPagedResponse,
} from "@/generated/apiClient";

// ===== MOCK DO MÓDULO API =====
vi.mock("@/lib/api", () => ({
  api: {
    purchaseorderGET: vi.fn(),
  },
}));

import { api } from "@/lib/api";
const mockedPurchaseOrderGET = vi.mocked(api.purchaseorderGET);

// ===============================================================
// UTIL — LISTA COMPLETA DE PEDIDOS MOCKADOS
// ===============================================================
const ALL_ORDERS = [
  new ResponsePurchaseOrderJson({
    id: 3,
    number: "PO-2025-003",
    supplierName: "GlobalTech Solutions",
    status: "RECEIVED",
    createdAt: new Date("2025-01-01"),
    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Notebook Dell Inspiron 15",
        quantity: 1,
        unitPrice: 45780,
      }),
    ],
  }),

  new ResponsePurchaseOrderJson({
    id: 1,
    number: "PO-2025-001",
    supplierName: "TechSupply Ltd.",
    status: "APPROVED",
    createdAt: new Date("2025-01-02"),
    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Mouse Gamer",
        quantity: 5,
        unitPrice: 2050,
      }),
    ],
  }),

  new ResponsePurchaseOrderJson({
    id: 2,
    number: "PO-2025-002",
    supplierName: "PrimeSource Import",
    status: "PENDING",
    createdAt: new Date("2025-01-03"),
    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Headset Bluetooth",
        quantity: 9,
        unitPrice: 2000,
      }),
    ],
  }),
];

// ===============================================================
// BEFORE EACH — CONFIGURA MOCK DINÂMICO
// ===============================================================
beforeEach(() => {
  vi.clearAllMocks();

  mockedPurchaseOrderGET.mockImplementation(
    async (page, pageSize, statusFilter, search) => {
      let filtered = [...ALL_ORDERS];

      // FILTRAR POR STATUS
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }

      // FILTRAR POR SEARCH
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.number?.toLowerCase().includes(s) ||
            o.supplierName?.toLowerCase().includes(s)
        );
      }

      // RETORNO PAGINADO
      return new ResponsePurchaseOrderJsonPagedResponse({
        items: filtered,
        total: filtered.length,
        page: 1,
      });
    }
  );
});

// ===============================================================
// TESTE 1 — Renderizar tabela com dados iniciais
// ===============================================================
it("deve exibir o pedido PO-2025-003 com o valor formatado corretamente", async () => {
  render(<PurchaseOrders />);

  // Aguarda carregamento das requisições
  expect(await screen.findByText("PO-2025-003")).toBeInTheDocument();
  expect(screen.getByText("GlobalTech Solutions")).toBeInTheDocument();
  expect(screen.getByText(/recebido/i)).toBeInTheDocument();

  // Total: 45.780,00
  expect(
    screen.getByText((txt) => txt.includes("45.780,00"))
  ).toBeInTheDocument();
});

it("deve filtrar pedidos com status 'Aprovado'", async () => {
  const user = userEvent.setup();
  render(<PurchaseOrders />);

  // garante que dados já foram carregados
  await screen.findByText("PO-2025-003");

  // abrir o select
  const trigger = await screen.findByTestId("status-filter-trigger");
  await user.click(trigger);

  // menu dentro do portal
  const menu = await screen.findByTestId("status-filter-menu");

  // selecionar "Aprovado"
  await user.click(within(menu).getByText(/Aprovado/i));

  // aguarda o re-render com os resultados filtrados
  await screen.findByText("PO-2025-001");

  // deve remover os demais
  expect(screen.queryByText("PO-2025-002")).not.toBeInTheDocument();
  expect(screen.queryByText("PO-2025-003")).not.toBeInTheDocument();
});
