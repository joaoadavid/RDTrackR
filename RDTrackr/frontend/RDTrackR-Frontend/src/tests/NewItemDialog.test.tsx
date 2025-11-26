import { vi } from "vitest";
const toastMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewItemDialog } from "@/components/inventory/NewItemDialog";

describe("NewItemDialog", () => {
  const onCreateMock = vi.fn();
  const onOpenChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos corretamente", () => {
    render(
      <NewItemDialog
        open
        onOpenChange={onOpenChangeMock}
        onCreate={onCreateMock}
      />
    );

    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Preço")).toBeInTheDocument();
    expect(screen.getByLabelText("Estoque")).toBeInTheDocument();
    expect(screen.getByLabelText("Ponto de Reposição")).toBeInTheDocument();
  });

  it("deve criar um novo item corretamente e exibir toast de sucesso", async () => {
    const user = userEvent.setup();

    render(
      <NewItemDialog
        open
        onOpenChange={onOpenChangeMock}
        onCreate={onCreateMock}
      />
    );

    await user.type(screen.getByLabelText("SKU"), "PROD-123");
    await user.type(screen.getByLabelText("Nome"), "Teclado Gamer");
    await user.type(screen.getByLabelText("Categoria"), "Periféricos");
    await user.type(screen.getByLabelText("Preço"), "299");
    await user.type(screen.getByLabelText("Estoque"), "10");
    await user.type(screen.getByLabelText("Ponto de Reposição"), "2");

    await user.click(screen.getByTestId("submit"));

    expect(onCreateMock).toHaveBeenCalledTimes(1);
    expect(onCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: "PROD-123",
        name: "Teclado Gamer",
        price: 299,
        stock: 10,
        reorderPoint: 2,
      })
    );

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Item adicionado",
        description: expect.stringContaining("Teclado Gamer"),
      })
    );
  });
});
