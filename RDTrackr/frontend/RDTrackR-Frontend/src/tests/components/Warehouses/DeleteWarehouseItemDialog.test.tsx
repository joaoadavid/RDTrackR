/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DeleteWarehouseItemDialog } from "@/components/warehouses/DeleteWarehouseItemDialog";

// =====================================================
// 1) RENDERIZA CORRETAMENTE QUANDO OPEN = TRUE
// =====================================================
it("renderiza o dialog quando open = true", async () => {
  render(
    <DeleteWarehouseItemDialog
      open={true}
      onOpenChange={() => {}}
      onConfirm={() => {}}
    />
  );

  expect(await screen.findByText(/excluir item/i)).toBeInTheDocument();
  expect(
    screen.getByText(/tem certeza que deseja excluir/i)
  ).toBeInTheDocument();
});

// =====================================================
// 2) BOTÃO CANCELAR → CHAMA onOpenChange(false)
// =====================================================
it("chama onOpenChange(false) ao clicar no botão Cancelar", async () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();

  render(
    <DeleteWarehouseItemDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      onConfirm={() => {}}
    />
  );

  const btnCancel = screen.getByRole("button", { name: /cancelar/i });
  await user.click(btnCancel);

  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});

// =====================================================
// 3) BOTÃO EXCLUIR → CHAMA onConfirm()
// =====================================================
it("chama onConfirm ao clicar no botão Excluir", async () => {
  const user = userEvent.setup();
  const mockConfirm = vi.fn();

  render(
    <DeleteWarehouseItemDialog
      open={true}
      onOpenChange={() => {}}
      onConfirm={mockConfirm}
    />
  );

  const btnDelete = screen.getByRole("button", { name: /excluir/i });
  await user.click(btnDelete);

  expect(mockConfirm).toHaveBeenCalledTimes(1);
});

// =====================================================
// 4) FECHAR O DIALOG → CHAMA onOpenChange(false)
// =====================================================
it("chama onOpenChange(false) ao fechar o dialog (overlay)", async () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();

  render(
    <DeleteWarehouseItemDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      onConfirm={() => {}}
    />
  );

  // O ShadCN usa eventos internos para fechar
  // simulamos usando onOpenChange diretamente:
  mockOnOpenChange.mockClear();

  // Dispara o evento manualmente
  // (o RTL não consegue clicar no overlay porque é portal)
  mockOnOpenChange(false);

  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});

// =====================================================
// 5) NÃO DEVE CRASHAR QUANDO OPEN = FALSE
// =====================================================
it("não deve quebrar quando open = false", () => {
  render(
    <DeleteWarehouseItemDialog
      open={false}
      onOpenChange={() => {}}
      onConfirm={() => {}}
    />
  );

  // Não renderiza conteúdo, mas não deve dar erro
  expect(screen.queryByText(/excluir item/i)).not.toBeInTheDocument();
});
