/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AddUserDialog } from "@/components/users/AddUserDialog";
import { api } from "@/lib/api";
import { RequestAdminCreateUserJson } from "@/generated/apiClient";

// MOCK API
vi.mock("@/lib/api", () => ({
  api: {
    create: vi.fn(),
  },
}));

const mockApiCreate = vi.mocked(api.create);

beforeEach(() => {
  vi.clearAllMocks();
  mockApiCreate.mockResolvedValue(undefined);
});

//
// 1) RENDERIZA O DIALOG
//
it("renderiza o modal quando aberto", () => {
  render(
    <AddUserDialog open={true} onOpenChange={() => {}} onSuccess={() => {}} />
  );

  expect(screen.getByText(/adicionar usuário/i)).toBeInTheDocument();
});

//
// 2) PERMITE PREENCHER TODOS OS CAMPOS DO FORMULÁRIO
//
it("permite preencher nome, email, senha e papel", async () => {
  const user = userEvent.setup();

  render(
    <AddUserDialog open={true} onOpenChange={() => {}} onSuccess={() => {}} />
  );

  // Campos de texto via LABEL
  await user.type(screen.getByLabelText(/nome/i), "João Silva");
  await user.type(screen.getByLabelText(/email/i), "joao@email.com");
  await user.type(screen.getByLabelText(/senha/i), "123456");

  // Abrir o select
  const selectTrigger = screen.getByLabelText(/papel/i);
  await user.click(selectTrigger);

  // Selecionar Admin
  await user.click(screen.getByRole("option", { name: /admin/i }));

  // Validar que valores estão no DOM
  expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument();
  expect(screen.getByDisplayValue("joao@email.com")).toBeInTheDocument();
});

//
// 3) SUBMETER FORMULÁRIO → CHAMA API + ONSUCCESS + FECHA MODAL
//
it("chama api.create, onSuccess e fecha o dialog quando salvar", async () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  render(
    <AddUserDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      onSuccess={mockOnSuccess}
    />
  );

  // preencher form
  await user.type(screen.getByLabelText(/nome/i), "Maria Souza");
  await user.type(screen.getByLabelText(/email/i), "maria@empresa.com");
  await user.type(screen.getByLabelText(/senha/i), "abc123");

  // selecionar papel
  const selectTrigger = screen.getByLabelText(/papel/i);
  await user.click(selectTrigger);

  await user.click(screen.getByRole("option", { name: /usuário padrão/i }));

  // clicar salvar
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  // verifica API
  expect(mockApiCreate).toHaveBeenCalledTimes(1);
  const payload = mockApiCreate.mock.calls[0][0] as RequestAdminCreateUserJson;

  expect(payload.name).toBe("Maria Souza");
  expect(payload.email).toBe("maria@empresa.com");
  expect(payload.password).toBe("abc123");
  expect(payload.role.toLowerCase()).toBe("user");

  // callbacks
  expect(mockOnSuccess).toHaveBeenCalled();
  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});

//
// 4) CANCELAR O MODAL
//
it("fecha o dialog ao clicar em Cancelar", async () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();

  render(
    <AddUserDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      onSuccess={() => {}}
    />
  );

  const btnCancel = screen.getByRole("button", { name: /cancelar/i });
  await user.click(btnCancel);

  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});
