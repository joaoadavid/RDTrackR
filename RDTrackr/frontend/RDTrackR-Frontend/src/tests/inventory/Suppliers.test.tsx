/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Suppliers from "@/pages/inventory/Suppliers";

import {
  ResponseSupplierJson,
  ResponseSupplierJsonPagedResponse,
} from "@/generated/apiClient";

vi.mock("@/lib/api", () => ({
  api: {
    supplierGET: vi.fn(),
    supplierDELETE: vi.fn(),
    supplierPOST: vi.fn(),
    supplierPUT: vi.fn(),
  },
}));

import { api } from "@/lib/api";
const mockGet = vi.mocked(api.supplierGET);
const mockDelete = vi.mocked(api.supplierDELETE);

const MOCK_SUPPLIERS = [
  new ResponseSupplierJson({
    id: 1,
    name: "Fornecedor A",
    contact: "João",
    email: "a@mail.com",
    phone: "1111",
    address: "Rua 1",
  }),

  new ResponseSupplierJson({
    id: 2,
    name: "Fornecedor B",
    contact: "Maria",
    email: "b@mail.com",
    phone: "2222",
    address: "Rua 2",
  }),
];

mockGet.mockResolvedValue(
  new ResponseSupplierJsonPagedResponse({
    items: MOCK_SUPPLIERS,
    total: 2,
    page: 1,
  })
);

function renderPage() {
  return render(<Suppliers />);
}

it("renderiza a lista inicial de fornecedores", async () => {
  renderPage();

  expect(await screen.findByText("Fornecedor A")).toBeInTheDocument();
  expect(screen.getByText("Fornecedor B")).toBeInTheDocument();
});

it("filtra fornecedores ao digitar no campo de busca", async () => {
  const user = userEvent.setup();

  renderPage();

  await screen.findByText("Fornecedor A");
  mockGet.mockClear();

  const searchInput = screen.getByPlaceholderText(/buscar fornecedores/i);
  await user.type(searchInput, "for");

  await waitFor(() => expect(mockGet).toHaveBeenCalledWith(1, 10, "for"));
});
