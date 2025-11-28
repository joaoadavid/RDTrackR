/// <reference types="@testing-library/jest-dom" />

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

vi.mock("@/lib/api", () => ({
  api: {
    purchaseorderGET: vi.fn(),
    status2: vi.fn(),
    purchaseorderDELETE: vi.fn(),
  },
}));

import { api } from "@/lib/api";
const mockedApi = vi.mocked(api);

const ALL_ORDERS = [
  new ResponsePurchaseOrderJson({
    id: 3,
    number: "PO-2025-003",
    supplierName: "GlobalTech Solutions",
    status: "RECEIVED",
    createdOn: new Date("2025-01-01"),
    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Notebook Dell",
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
    createdOn: new Date("2025-01-02"),
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
    createdOn: new Date("2025-01-03"),
    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Headset Bluetooth",
        quantity: 9,
        unitPrice: 2000,
      }),
    ],
  }),
];

beforeEach(() => {
  vi.clearAllMocks();

  mockedApi.purchaseorderGET.mockImplementation(
    async (page, pageSize, statusFilter, search) => {
      let filtered = [...ALL_ORDERS];

      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.number?.toLowerCase().includes(s) ||
            o.supplierName?.toLowerCase().includes(s)
        );
      }

      return new ResponsePurchaseOrderJsonPagedResponse({
        items: filtered,
        total: filtered.length,
        page: 1,
      });
    }
  );
});

it("deve exibir o pedido PO-2025-003 com valor formatado corretamente", async () => {
  render(<PurchaseOrders />);

  expect(await screen.findByText("PO-2025-003")).toBeInTheDocument();
  expect(screen.getByText("GlobalTech Solutions")).toBeInTheDocument();
  expect(screen.getByText(/recebido/i)).toBeInTheDocument();

  expect(
    screen.getByText((txt) => txt.includes("45.780,00"))
  ).toBeInTheDocument();
});
