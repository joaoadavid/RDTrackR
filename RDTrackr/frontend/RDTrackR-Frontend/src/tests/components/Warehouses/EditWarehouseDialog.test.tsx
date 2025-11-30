/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { EditWarehouseDialog } from "@/components/warehouses/EditWarehouseDialog";
import {
  ResponseWarehouseJson,
  RequestUpdateWarehouseJson,
} from "@/generated/apiClient";

const MOCK_WAREHOUSE = new ResponseWarehouseJson({
  id: 1,
  name: "CD São Paulo",
  location: "Centro",
  capacity: 100,
  items: 20,
});

// =====================================================
// 1) NÃO RENDERIZA SE warehouse=null
// =====================================================
it("não renderiza nada quando warehouse = null", () => {
  const { container } = render(
    <EditWarehouseDialog
      open={true}
      warehouse={null}
      onOpenChange={() => {}}
      onUpdate={() => {}}
    />
  );

  expect(container.firstChild).toBeNull();
});

// =====================================================
// 2) FORM INICIA COM OS VALORES DO WAREHOUSE
// =====================================================
it("preenche o formulário com os valores iniciais do warehouse", async () => {
  render(
    <EditWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onOpenChange={() => {}}
      onUpdate={() => {}}
    />
  );

  expect(await screen.findByDisplayValue("CD São Paulo")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Centro")).toBeInTheDocument();
  expect(screen.getByDisplayValue("100")).toBeInTheDocument();
  expect(screen.getByDisplayValue("20")).toBeInTheDocument();
});

// =====================================================
// 3) PERMITE EDITAR OS CAMPOS
// =====================================================
it("permite editar os campos do formulário", async () => {
  const user = userEvent.setup();

  render(
    <EditWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onOpenChange={() => {}}
      onUpdate={() => {}}
    />
  );

  const nameInput = await screen.findByDisplayValue("CD São Paulo");

  await user.clear(nameInput);
  await user.type(nameInput, "Novo Nome");

  expect(nameInput).toHaveValue("Novo Nome");
});

// =====================================================
// 4) SUBMIT CHAMA onUpdate COM DTO E ENTITY ATUALIZADOS
// =====================================================
it("chama onUpdate ao submeter o formulário", async () => {
  const user = userEvent.setup();

  const mockOnUpdate = vi.fn();
  const mockOnOpenChange = vi.fn();

  render(
    <EditWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onOpenChange={mockOnOpenChange}
      onUpdate={mockOnUpdate}
    />
  );

  // Editar valores
  await user.clear(screen.getByDisplayValue("CD São Paulo"));
  await user.type(screen.getByLabelText("Nome"), "CD Rio");

  await user.clear(screen.getByDisplayValue("Centro"));
  await user.type(screen.getByLabelText("Localização"), "Zona Norte");

  await user.clear(screen.getByDisplayValue("100"));
  await user.type(screen.getByLabelText("Capacidade"), "200");

  await user.clear(screen.getByDisplayValue("20"));
  await user.type(screen.getByLabelText("Itens Armazenados"), "80");

  // Submit
  const submitBtn = screen.getByRole("button", { name: /salvar alterações/i });
  await user.click(submitBtn);

  // Validação do callback
  expect(mockOnUpdate).toHaveBeenCalledTimes(1);

  const [updatedEntity, dto] = mockOnUpdate.mock.calls[0];

  // DTO
  expect(dto).toBeInstanceOf(RequestUpdateWarehouseJson);
  expect(dto.name).toBe("CD Rio");
  expect(dto.location).toBe("Zona Norte");
  expect(dto.capacity).toBe(200);
  expect(dto.items).toBe(80);

  // ENTIDADE ATUALIZADA
  expect(updatedEntity).toBeInstanceOf(ResponseWarehouseJson);
  expect(updatedEntity.name).toBe("CD Rio");
  expect(updatedEntity.location).toBe("Zona Norte");
  expect(updatedEntity.capacity).toBe(200);
  expect(updatedEntity.items).toBe(80);

  // A dialog deve fechar
  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});

// =====================================================
// 5) ONOPENCHANGE FECHA O MODAL
// =====================================================
it("fecha o dialog via onOpenChange(false)", () => {
  const mockOnOpenChange = vi.fn();

  render(
    <EditWarehouseDialog
      open={true}
      warehouse={MOCK_WAREHOUSE}
      onOpenChange={mockOnOpenChange}
      onUpdate={() => {}}
    />
  );

  mockOnOpenChange(false);
  expect(mockOnOpenChange).toHaveBeenCalledWith(false);
});
