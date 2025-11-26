/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Movements from "@/pages/inventory/Movements";

import {
  ResponseMovementJsonPagedResponse,
  ResponseMovementJson,
} from "@/generated/apiClient";

// MOCK API
vi.mock("@/lib/api", () => ({
  api: {
    movementGET: vi.fn(),
    productGET: vi.fn().mockResolvedValue({
      items: [{ id: 1, name: "Monitor Samsung", sku: "MON-001" }],
    }),
    warehouseGET: vi
      .fn()
      .mockResolvedValue({ items: [{ id: 1, name: "CD São Paulo" }] }),
    movementPOST: vi.fn(),
  },
}));

import { api } from "@/lib/api";
const mockedMovementGET = vi.mocked(api.movementGET);

const MOCK_MOVEMENTS = [
  new ResponseMovementJson({
    id: 1,
    type: "INBOUND",
    reference: "REF-001",
    product: "Notebook Dell",
    warehouse: "CD São Paulo",
    quantity: 10,
    createdAt: new Date("2025-01-01"),
    createdByName: "João",
  }),
];

beforeEach(() => {
  vi.clearAllMocks();

  mockedMovementGET.mockResolvedValue(
    new ResponseMovementJsonPagedResponse({
      items: MOCK_MOVEMENTS,
      total: MOCK_MOVEMENTS.length,
      page: 1,
    })
  );
});

// ===========================================
it("deve renderizar as movimentações mockadas", async () => {
  render(<Movements />);

  expect(await screen.findByText(/notebook dell/i)).toBeInTheDocument();
});
