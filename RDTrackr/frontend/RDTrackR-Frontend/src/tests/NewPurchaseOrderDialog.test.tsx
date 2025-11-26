// ✅ mock vem ANTES de tudo
import { vi } from "vitest";

const toastMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

// Imports do Testing Library
import { render, screen, within, fireEvent } from "@testing-library/react";
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
        open={true}
        onOpenChange={onOpenChangeMock}
        onCreate={onCreateMock}
      />
    );

    expect(screen.getByText(/novo item/i)).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Preço")).toBeInTheDocument();
    expect(screen.getByLabelText("Estoque")).toBeInTheDocument();
    expect(screen.getByLabelText("Ponto de Reposição")).toBeInTheDocument();
  });

  it("deve permitir selecionar unidade 'Kg' no select", async () => {
    const user = userEvent.setup();

    render(
      <NewItemDialog
        open
        onOpenChange={onOpenChangeMock}
        onCreate={onCreateMock}
      />
    );

    await user.click(screen.getByRole("combobox", { name: /unidade/i }));
    const listbox = await screen.findByRole("listbox");
    const kgOption = within(listbox).getByText("Kg");
    await user.click(kgOption);

    expect(screen.getByRole("combobox")).toHaveTextContent("Kg");
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

    await user.click(screen.getByRole("button", { name: /salvar item/i }));

    expect(onCreateMock).toHaveBeenCalledTimes(1);
    expect(onCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: "PROD-123",
        name: "Teclado Gamer",
        category: "Periféricos",
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

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });
});
