/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { WarehouseDetailsDialog } from "@/components/warehouses/WarehouseDetailsDialog";
import { api } from "@/lib/api";
import { ResponseWarehouseStockItemJson } from "@/generated/apiClient";

// MOCK API
vi.mock("@/lib/api", () => ({
  api: {
    itemsAll: vi.fn(),
    itemsDELETE: vi.fn(),
  },
}));

// MOCK TOAST
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockItemsAll = vi.mocked(api.itemsAll);
const mockItemsDelete = vi.mocked(api.itemsDELETE);

// MOCK FIXO PARA TESTES
mockItemsAll.mockResolvedValue([]);
mockItemsDelete.mockResolvedValue(undefined);

const MOCK_ITEMS = [
  new ResponseWarehouseStockItemJson({
    id: 10,
    productId: 1,
    productName: "Notebook Dell",
    sku: "NT-001",
    quantity: 8,
    reorderPoint: 2,
    lastPurchasePrice: 2500,
  }),
];

beforeEach(() => {
  vi.clearAllMocks();

  // mock default seguro
  mockItemsAll.mockResolvedValue([]);
  mockItemsDelete.mockResolvedValue(undefined);
});

//
// 1) TÍTULO COM NOME DO DEPÓSITO
//
it("renderiza o título com o nome do depósito", () => {
  mockItemsAll.mockResolvedValue([]); // garante estado seguro

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD São Paulo"
    />
  );

  expect(
    screen.getByText(/itens do depósito • cd são paulo/i)
  ).toBeInTheDocument();
});

//
// 2) CHAMA API ITEMSALL AO ABRIR
//
it("carrega os itens ao abrir", async () => {
  mockItemsAll.mockResolvedValue([]);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  expect(mockItemsAll).toHaveBeenCalledWith(1);
});

//
// 3) MOSTRA CARREGANDO
//
it("exibe 'Carregando...' enquanto busca os dados", () => {
  mockItemsAll.mockReturnValue(new Promise(() => {})); // nunca resolve

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  expect(screen.getByText(/carregando/i)).toBeInTheDocument();
});

//
// 4) MOSTRA MENSAGEM DE LISTA VAZIA
//
it("exibe mensagem quando não há itens", async () => {
  mockItemsAll.mockResolvedValue([]);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  expect(await screen.findByText(/não possui itens/i)).toBeInTheDocument();
});

//
// 5) MOSTRA A TABELA COM OS ITENS
//
it("exibe a tabela com os itens retornados", async () => {
  mockItemsAll.mockResolvedValue(MOCK_ITEMS);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  expect(await screen.findByText(/notebook dell/i)).toBeInTheDocument();
  expect(screen.getByText(/nt-001/i)).toBeInTheDocument();
});

//
// 6) ABRIR MODAL DE DELETE AO CLICAR NO TRASH
//
it("abre o dialog de exclusão quando clicar no botão de excluir", async () => {
  const user = userEvent.setup();

  mockItemsAll.mockResolvedValue(MOCK_ITEMS);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  const trashBtn = await screen.findByRole("button", { name: "" }); // ícone não tem label
  await user.click(trashBtn);

  expect(
    screen.getByText(/tem certeza que deseja excluir este item/i)
  ).toBeInTheDocument();
});

//
// 7) CONFIRMAR EXCLUSÃO → CHAMA API DELETE
//
it("chama itemsDELETE ao confirmar exclusão", async () => {
  const user = userEvent.setup();

  mockItemsAll.mockResolvedValue(MOCK_ITEMS);
  mockItemsDelete.mockResolvedValue(undefined);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  const btnDelete = await screen.findByRole("button", { name: "" });
  await user.click(btnDelete);

  const confirmBtn = screen.getByRole("button", { name: /excluir/i });
  await user.click(confirmBtn);

  expect(mockItemsDelete).toHaveBeenCalledWith(10);
});

//
// 8) RECARREGA LISTA APÓS EXCLUIR
//
it("recarrega os itens após excluir", async () => {
  const user = userEvent.setup();

  mockItemsAll
    .mockResolvedValueOnce(MOCK_ITEMS) // load inicial
    .mockResolvedValueOnce([]); // load pós delete

  mockItemsDelete.mockResolvedValue(undefined);

  render(
    <WarehouseDetailsDialog
      open={true}
      onOpenChange={() => {}}
      warehouseId={1}
      warehouseName="CD SP"
    />
  );

  const btnDelete = await screen.findByRole("button", { name: "" });
  await user.click(btnDelete);

  const confirmBtn = screen.getByRole("button", { name: /excluir/i });
  await user.click(confirmBtn);

  await waitFor(() => {
    expect(mockItemsAll).toHaveBeenCalledTimes(2); // carregou de novo
  });
});
