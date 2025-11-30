/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { NewSupplierProductDialog } from "@/components/suppliersProduct/NewSupplierProductDialog";

import {
  ResponseProductJson,
  ResponseProductJsonPagedResponse,
  ResponseSupplierProductJson,
} from "@/generated/apiClient";

// ---------------------------------------------------------
// MOCK DO API
// ---------------------------------------------------------
vi.mock("@/lib/api", () => ({
  api: {
    productGET: vi.fn(),
    productsPOST: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockGet = vi.mocked(api.productGET);
const mockPost = vi.mocked(api.productsPOST);

// ---------------------------------------------------------
// MOCK DO TOAST
// ---------------------------------------------------------
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// ---------------------------------------------------------
// MOCK DEFINITIVO DO SELECT DO SHADCN
// ---------------------------------------------------------
vi.mock("@/components/ui/select", () => {
  let onChangeCallback: ((value: string) => void) | null = null;

  return {
    Select: ({ children, onValueChange }: any) => {
      onChangeCallback = onValueChange;
      return <div data-testid="select-root">{children}</div>;
    },

    SelectTrigger: ({ children }: any) => (
      <button data-testid="select-trigger">{children}</button>
    ),

    SelectValue: ({ placeholder }: any) => (
      <span data-testid="select-value">{placeholder}</span>
    ),

    SelectContent: ({ children }: any) => (
      <div data-testid="select-content">{children}</div>
    ),

    SelectItem: ({ children, value }: any) => (
      <div
        role="option"
        data-testid={`select-item-${value}`}
        onClick={() => onChangeCallback?.(value)} // <<< SEGREDO
      >
        {children}
      </div>
    ),
  };
});

// ---------------------------------------------------------
// DADOS MOCKADOS
// ---------------------------------------------------------
const MOCK_PRODUCTS = [
  new ResponseProductJson({ id: 10, sku: "SK-10", name: "Monitor" }),
  new ResponseProductJson({ id: 20, sku: "SK-20", name: "Teclado" }),
];

mockGet.mockResolvedValue(
  new ResponseProductJsonPagedResponse({
    items: MOCK_PRODUCTS,
    total: 2,
    page: 1,
  })
);

function renderDialog(customProps = {}) {
  return render(
    <NewSupplierProductDialog
      open={true}
      onOpenChange={() => {}}
      supplierId={1}
      existingProducts={[]}
      onAdded={() => {}}
      {...customProps}
    />
  );
}

it("permite selecionar um produto", async () => {
  const user = userEvent.setup();

  renderDialog();

  await waitFor(() => expect(mockGet).toHaveBeenCalled());
  await screen.findByTestId("select-trigger");

  await user.click(screen.getByTestId("select-trigger"));

  const item = await screen.findByTestId("select-item-10");
  await user.click(item);

  expect(item).toBeInTheDocument(); // confirmou seleção
});

it("envia POST ao adicionar produto", async () => {
  const user = userEvent.setup();

  mockPost.mockResolvedValue(
    new ResponseSupplierProductJson({
      productId: 10,
      productName: "Monitor",
      sku: "SK-10",
      unitPrice: 99.9,
    })
  );

  const onAdded = vi.fn();

  renderDialog({ onAdded });

  await waitFor(() => expect(mockGet).toHaveBeenCalled());
  await screen.findByTestId("select-trigger");

  // selecionar produto
  await user.click(screen.getByTestId("select-trigger"));
  await user.click(await screen.findByTestId("select-item-10"));

  // preencher campos
  await user.type(screen.getByPlaceholderText(/ex: abc-001/i), "SUP-10");
  await user.type(screen.getByPlaceholderText(/ex: 12\.50/i), "55.90");

  await user.click(screen.getByRole("button", { name: /adicionar/i }));

  await waitFor(() =>
    expect(mockPost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        productId: 10,
        unitPrice: 55.9,
      })
    )
  );

  expect(onAdded).toHaveBeenCalled();
});
