/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { SupplierProductsDialog } from "@/components/suppliersProduct/SupplierProductsDialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseSupplierProductJson } from "@/generated/apiClient";

vi.mock("@radix-ui/react-dialog", async () => {
  const actual = await vi.importActual<any>("@radix-ui/react-dialog");
  return {
    ...actual,
    Overlay: (props: any) => <div {...props} />,
  };
});

vi.mock("@radix-ui/react-portal", () => ({
  Portal: ({ children }: any) => children,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/components/suppliersProduct/NewSupplierProductDialog", () => ({
  NewSupplierProductDialog: ({ open, onOpenChange, onAdded }: any) => (
    <div data-testid="mock-add-dialog">
      {open && (
        <button
          data-testid="mock-add-confirm"
          style={{ pointerEvents: "auto" }}
          onClick={() => {
            onAdded(
              new ResponseSupplierProductJson({
                productId: 99,
                productName: "Produto Novo",
                sku: "NEW-99",
                unitPrice: 123.45,
              })
            );
            onOpenChange(false);
          }}
        >
          confirmar add
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/suppliersProduct/EditSupplierProductDialog", () => ({
  EditSupplierProductDialog: ({
    open,
    product,
    onOpenChange,
    onUpdated,
  }: any) => (
    <div data-testid="mock-edit-dialog">
      {open && (
        <>
          <p data-testid="mock-edit-name">{product.productName}</p>

          <button
            data-testid="mock-edit-confirm"
            style={{ pointerEvents: "auto" }}
            onClick={() => {
              onUpdated(
                new ResponseSupplierProductJson({
                  ...product,
                  unitPrice: 777,
                })
              );
              onOpenChange(false);
            }}
          >
            confirmar edit
          </button>
        </>
      )}
    </div>
  ),
}));

vi.mock("@/lib/api", () => ({
  api: {
    productsAll: vi.fn(),
    productsDELETE: vi.fn(),
    productsPUT: vi.fn(),
  },
}));

const mockAll = vi.mocked(api.productsAll);
const mockDel = vi.mocked(api.productsDELETE);
const mockToast = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  (useToast as any).mockReturnValue({
    toast: mockToast,
  });

  mockAll.mockResolvedValue([]);
});

it("carrega produtos ao abrir", async () => {
  mockAll.mockResolvedValue([
    new ResponseSupplierProductJson({
      productId: 1,
      sku: "SKU-1",
      productName: "Produto A",
      unitPrice: 10,
    }),
  ]);

  render(
    <SupplierProductsDialog open supplierId={99} onOpenChange={() => {}} />
  );

  expect(mockAll).toHaveBeenCalledWith(99);
  expect(await screen.findByText("Produto A")).toBeInTheDocument();
});

it("permite adicionar produto via modal mockado", async () => {
  const user = userEvent.setup();

  mockAll.mockResolvedValue([]);

  render(
    <SupplierProductsDialog open supplierId={1} onOpenChange={() => {}} />
  );

  const addBtn = screen.getByRole("button", { name: /adicionar produto/i });
  await user.click(addBtn);

  await user.click(screen.getByTestId("mock-add-confirm"));

  expect(await screen.findByText("Produto Novo")).toBeInTheDocument();
});

it("abre modal de edição e atualiza produto", async () => {
  const user = userEvent.setup();

  mockAll.mockResolvedValue([
    new ResponseSupplierProductJson({
      productId: 5,
      sku: "P5",
      productName: "Produto Editável",
      unitPrice: 40,
    }),
  ]);

  render(
    <SupplierProductsDialog open supplierId={1} onOpenChange={() => {}} />
  );

  await screen.findByText("Produto Editável");

  const allButtons = await screen.findAllByRole("button");

  const editBtn = allButtons[1];
  await user.click(editBtn);

  expect(await screen.findByTestId("mock-edit-name")).toHaveTextContent(
    "Produto Editável"
  );

  await user.click(screen.getByTestId("mock-edit-confirm"));

  expect(await screen.findByText("R$ 777.00")).toBeInTheDocument();
});

it("remove produto ao clicar no botão de excluir", async () => {
  const user = userEvent.setup();

  mockAll.mockResolvedValue([
    new ResponseSupplierProductJson({
      productId: 10,
      sku: "X-10",
      productName: "Mouse",
      unitPrice: 50,
    }),
  ]);

  mockDel.mockResolvedValue(undefined);

  render(
    <SupplierProductsDialog open supplierId={50} onOpenChange={() => {}} />
  );

  await screen.findByText("Mouse");

  const allButtons = await screen.findAllByRole("button");

  const deleteBtn = allButtons[2];
  await user.click(deleteBtn);

  await waitFor(() =>
    expect(screen.queryByText("Mouse")).not.toBeInTheDocument()
  );
});
