/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DeleteWarehouseDialog } from "@/components/warehouses/DeleteWarehouseDialog";
import { ResponseWarehouseJson } from "@/generated/apiClient";

const MOCK_WAREHOUSE = new ResponseWarehouseJson({
  id: 1,
  name: "CD São Paulo",
  location: "Centro",
  capacity: 50,
  items: 10,
  utilization: 0.2,
});

// =====================================================
// 1) NÃO RENDERIZA SE warehouse = null
// =====================================================
it("não renderiza nada quando warehouse é null", () => {
  const { container } = render(
    <DeleteWarehouseDialog
      open={true}
      warehouse={null}
      onCancel={() => {}}
      onConfirm={() => {}}
    />
  );

  expect(container.firstChild).toBeNull();
});

// =====================================================
// 2) RENDERIZA O MODAL E MOSTRA NOME DO DEPÓSITO
// =====================================================
it("exibe o nome do depósito no texto da confirmação", async () => {
  render(
    <DeleteWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onCancel={() => {}}
      onConfirm={() => {}}
    />
  );

  expect(await screen.findByText(/cd são paulo/i)).toBeInTheDocument();
});

// =====================================================
// 3) BOTÃO CANCELAR CHAMA onCancel
// =====================================================
it("chama onCancel quando clicar no botão Cancelar", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();

  render(
    <DeleteWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onCancel={onCancel}
      onConfirm={() => {}}
    />
  );

  const btnCancel = await screen.findByRole("button", { name: /cancelar/i });
  await user.click(btnCancel);

  expect(onCancel).toHaveBeenCalledTimes(1);
});

// =====================================================
// 4) BOTÃO EXCLUIR CHAMA onConfirm
// =====================================================
it("chama onConfirm quando clicar no botão Excluir", async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn();

  render(
    <DeleteWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onCancel={() => {}}
      onConfirm={onConfirm}
    />
  );

  const btnDelete = await screen.findByRole("button", { name: /excluir/i });
  await user.click(btnDelete);

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

// =====================================================
// 5) FECHAR O MODAL (onOpenChange) CHAMA onCancel
// =====================================================
it("chama onCancel ao fechar o dialog", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();

  render(
    <DeleteWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onCancel={onCancel}
      onConfirm={() => {}}
    />
  );

  // O ShadCN usa um overlay para fechar o diálogo
  const overlay = document.querySelector('[data-state="open"]');

  if (overlay) {
    await user.click(overlay);
  }

  expect(onCancel).toHaveBeenCalledTimes(1);
});
