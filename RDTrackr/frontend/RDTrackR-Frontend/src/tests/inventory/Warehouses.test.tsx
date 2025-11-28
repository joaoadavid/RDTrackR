/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Warehouses from "@/pages/inventory/Warehouses";
import { api } from "@/lib/api";

import {
  ResponseWarehouseJson,
  ResponseWarehouseJsonPagedResponse,
} from "@/generated/apiClient";

// ====================================================
// 🔥 MOCK DA API
// ====================================================
vi.mock("@/lib/api", () => ({
  api: {
    warehouseGET: vi.fn(),
    warehousePOST: vi.fn(),
    warehousePUT: vi.fn(),
    warehouseDELETE: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.warehouseGET);

// Debounce helper
function waitDebounce() {
  return new Promise((r) => setTimeout(r, 400));
}

// ====================================================
// MOCK DATA
// ====================================================
const MOCK_WAREHOUSES = [
  new ResponseWarehouseJson({
    id: 1,
    name: "Depósito Central",
    location: "Centro",
    capacity: 100,
    items: 60,
    utilization: 60,
    createdAt: new Date("2025-02-10T12:00:00Z"),
  }),
  new ResponseWarehouseJson({
    id: 2,
    name: "Depósito Norte",
    location: "Zona Norte",
    capacity: 200,
    items: 120,
    utilization: 80,
    createdAt: new Date("2025-02-11T12:00:00Z"),
  }),
];

beforeEach(() => {
  vi.clearAllMocks();

  mockGet.mockImplementation(async (page, pageSize, search) => {
    let filtered = [...MOCK_WAREHOUSES];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name?.toLowerCase().includes(s) ||
          w.location?.toLowerCase().includes(s)
      );
    }

    return new ResponseWarehouseJsonPagedResponse({
      items: filtered,
      total: filtered.length,
      page,
    });
  });
});

it("carrega e exibe depósitos iniciais", async () => {
  render(<Warehouses />);

  await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

  expect(await screen.findByText("Depósito Central")).toBeInTheDocument();
  expect(screen.getByText("Depósito Norte")).toBeInTheDocument();
});

it("filtra ao digitar no campo de busca", async () => {
  const user = userEvent.setup();
  render(<Warehouses />);

  await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
  mockGet.mockClear();

  const search = screen.getByPlaceholderText(/buscar/i);

  await user.type(search, "norte");

  await waitDebounce();

  await waitFor(() => expect(mockGet).toHaveBeenCalledWith(1, 10, "norte"));

  expect(screen.queryByText("Depósito Central")).not.toBeInTheDocument();
  expect(await screen.findByText("Depósito Norte")).toBeInTheDocument();
});

it("exibe mensagem quando não há depósitos", async () => {
  mockGet.mockResolvedValueOnce(
    new ResponseWarehouseJsonPagedResponse({
      items: [],
      total: 0,
      page: 1,
    })
  );

  render(<Warehouses />);

  expect(
    await screen.findByText(/nenhum depósito encontrado/i)
  ).toBeInTheDocument();
});

it("abre o dropdown de ações", async () => {
  const user = userEvent.setup();
  render(<Warehouses />);

  await screen.findByText("Depósito Central");

  const btn = screen.getAllByRole("button", { name: "" })[1]; // Ícone "..."
  await user.click(btn);

  const menu = await screen.findByRole("menu");

  expect(within(menu).getByText(/detalhes/i)).toBeInTheDocument();
  expect(within(menu).getByText(/editar/i)).toBeInTheDocument();
  expect(within(menu).getByText(/excluir/i)).toBeInTheDocument();
});
