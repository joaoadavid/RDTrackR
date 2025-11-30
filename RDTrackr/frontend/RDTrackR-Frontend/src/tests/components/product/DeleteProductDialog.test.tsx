import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ResponseProductJson } from "@/generated/apiClient";

function makeProduct(overrides?: Partial<ResponseProductJson>) {
  return new ResponseProductJson({
    id: 10,
    name: "Produto Teste",
    sku: "SKU-001",
    category: "Categoria X",
    uoM: "UN",
    price: 50,
    totalStock: 100,
    reorderPoint: 10,
    updatedAt: new Date(),
    active: true,
    createdByUserId: 1,
    createdByName: "Administrador",
    stockItems: [],
    ...overrides,
  });
}

describe("DeleteProductDialog", () => {
  it("renderiza título e nome do produto", () => {
    const product = makeProduct();

    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={vi.fn()}
        onDelete={vi.fn()}
        product={product}
      />
    );

    expect(screen.getByText("Excluir Produto")).toBeInTheDocument();
    expect(screen.getByText(/Produto Teste/)).toBeInTheDocument();
  });

  it("fecha ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const product = makeProduct();

    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={onOpenChange}
        onDelete={vi.fn()}
        product={product}
      />
    );

    await user.click(screen.getByText("Cancelar"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("chama onDelete e depois fecha", async () => {
    const user = userEvent.setup();

    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    const product = makeProduct();

    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
        product={product}
      />
    );

    await user.click(screen.getByText("Excluir"));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
