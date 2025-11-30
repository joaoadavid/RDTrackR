import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemCard } from "@/components/purchase-orders/ItemCard";
import { vi } from "vitest";

function setup(overrides?: Partial<any>) {
  const updateItem = vi.fn();
  const handleProductSelect = vi.fn();
  const removeItem = vi.fn();

  const props = {
    index: 0,
    item: { productId: null, quantity: 1, unitPrice: 10 },
    supplierProducts: [
      { productId: 1, productName: "Produto A", unitPrice: 10 },
      { productId: 2, productName: "Produto B", unitPrice: 20 },
    ],
    itemTotals: [10],
    updateItem,
    handleProductSelect,
    removeItem,
    warehouses: [
      {
        id: 1,
        stockItems: [
          { productId: 1, quantity: 50 },
          { productId: 2, quantity: 5 },
        ],
      },
    ],
    warehouseId: 1,
    ...overrides,
  };

  render(<ItemCard {...props} />);
  return { updateItem, handleProductSelect, removeItem, props };
}

describe("ItemCard", () => {
  it("renderiza corretamente", () => {
    setup();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("colapsa e expande o card", async () => {
    const user = userEvent.setup();
    setup();

    const collapseBtn = screen.getByTestId("collapse-button");

    // colapsar
    await user.click(collapseBtn);
    await waitFor(() =>
      expect(screen.queryByLabelText("Quantidade")).not.toBeInTheDocument()
    );

    // expandir
    await user.click(collapseBtn);
    expect(screen.getByLabelText("Quantidade")).toBeInTheDocument();
  });

  it("seleciona produto e exibe estoque", async () => {
    const user = userEvent.setup();
    const { handleProductSelect } = setup();

    // abre o select
    await user.click(screen.getByTestId("product-trigger"));

    // seleciona Produto A
    await user.click(screen.getByText("Produto A — R$ 10.00"));

    // callback foi chamado
    expect(handleProductSelect).toHaveBeenCalledWith(0, 1);

    // estoque aparece
    expect(
      await screen.findByText(
        (content, element) =>
          element?.textContent === "Estoque disponível: 50 unidade(s)"
      )
    ).toBeInTheDocument();
  });

  it("remove item após 250ms", async () => {
    const user = userEvent.setup();
    const { removeItem } = setup();

    const removeBtn = screen.getByTestId("remove-button");

    await user.click(removeBtn);

    await waitFor(() => expect(removeItem).toHaveBeenCalled(), {
      timeout: 300,
    });
  });
});
