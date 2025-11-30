/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Users from "@/pages/Users";
import { api } from "@/lib/api";

// Mock do toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));
import { useToast } from "@/hooks/use-toast";

// Mock do Portal do Radix → menu aparece inline no DOM
vi.mock("@radix-ui/react-portal", () => ({
  Portal: ({ children }: any) => children,
}));

// 🔥 MOCK CORRETO DO AddUserDialog
vi.mock("@/components/users/AddUserDialog", () => ({
  AddUserDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="mock-add-user-dialog">
      {open && (
        <div>
          <p>Mock AddUserDialog</p>
          <button
            data-testid="mock-add-confirm"
            onClick={() => {
              onSuccess();
              onOpenChange(false);
            }}
          >
            Confirm Add
          </button>
        </div>
      )}
    </div>
  ),
}));

// 🔥 MOCK CORRETO DO EditUserDialog
vi.mock("@/components/users/EditUserDialog", () => ({
  EditUserDialog: ({ open, user, onOpenChange, onSuccess }: any) => (
    <div data-testid="mock-edit-user-dialog">
      {open && (
        <div>
          <p>Mock EditUserDialog</p>
          {user && <p data-testid="mock-edit-username">{user.name}</p>}

          <button
            data-testid="mock-edit-confirm"
            onClick={() => {
              onSuccess();
              onOpenChange(false);
            }}
          >
            Confirm Edit
          </button>
        </div>
      )}
    </div>
  ),
}));

// 🔥 MOCK CORRETO DO DeleteUserDialog
vi.mock("@/components/users/DeleteUserDialog", () => ({
  DeleteUserDialog: ({ open, user, onOpenChange, onSuccess }: any) => (
    <div data-testid="mock-delete-user-dialog">
      {open && (
        <div>
          <p>Mock DeleteUserDialog</p>
          {user && <p data-testid="mock-delete-username">{user.name}</p>}

          <button
            data-testid="mock-delete-confirm"
            onClick={() => {
              onSuccess();
              onOpenChange(false);
            }}
          >
            Confirm Delete
          </button>

          <button
            data-testid="mock-delete-cancel"
            onClick={() => onOpenChange(false)}
          >
            Cancel Delete
          </button>
        </div>
      )}
    </div>
  ),
}));

describe("Users Page", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // mock do useToast
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  // ============================================
  // 1) RENDERIZA LISTA DE USUÁRIOS
  // ============================================
  it("renders users returned by API", async () => {
    (api.adminAll as any).mockResolvedValue([
      {
        id: 1,
        name: "John Doe",
        email: "john@test.com",
        role: "admin",
        active: true,
        createdOn: new Date(),
      },
    ]);

    render(<Users />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  // ============================================
  // 2) FILTRO DE USUÁRIOS
  // ============================================
  it("filters users when searching", async () => {
    (api.adminAll as any).mockResolvedValue([
      { id: 1, name: "Alice", email: "alice@mail.com", role: "user" },
      { id: 2, name: "Bob", email: "bob@mail.com", role: "user" },
    ]);

    render(<Users />);

    await screen.findByText("Alice");

    fireEvent.change(screen.getByPlaceholderText("Buscar usuário..."), {
      target: { value: "alice" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  // ============================================
  // 3) ABRIR ADD USER DIALOG
  // ============================================
  it('opens AddUserDialog when clicking "Adicionar Usuário"', async () => {
    (api.adminAll as any).mockResolvedValue([]);

    render(<Users />);

    fireEvent.click(screen.getByText("Adicionar Usuário"));

    expect(screen.getByTestId("mock-add-user-dialog")).toBeInTheDocument();
  });

  // ============================================
  // 4) ABRIR EDIT USER DIALOG
  // ============================================
  it('opens EditUserDialog when clicking "Editar"', async () => {
    (api.adminAll as any).mockResolvedValue([
      { id: 1, name: "Alice", email: "alice@test.com", role: "user" },
    ]);

    const user = userEvent.setup();
    render(<Users />);

    const row = await screen.findByText("Alice");

    const actionsButton = row.closest("tr")!.querySelector("button")!;
    await user.click(actionsButton); // abre menu

    const editOption = await screen.findByText("Editar");
    await user.click(editOption);

    expect(screen.getByTestId("mock-edit-user-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("mock-edit-username")).toHaveTextContent("Alice");
  });

  // ============================================
  // 5) ABRIR DELETE USER DIALOG
  // ============================================
  it('opens DeleteUserDialog when clicking "Excluir"', async () => {
    (api.adminAll as any).mockResolvedValue([
      { id: 2, name: "Bob", email: "bob@mail.com", role: "user" },
    ]);

    const user = userEvent.setup();
    render(<Users />);

    const row = await screen.findByText("Bob");

    const actionsButton = row.closest("tr")!.querySelector("button")!;
    await user.click(actionsButton);

    const deleteOption = await screen.findByText("Excluir");
    await user.click(deleteOption);

    expect(screen.getByTestId("mock-delete-user-dialog")).toBeInTheDocument();

    expect(screen.getByTestId("mock-delete-username")).toHaveTextContent("Bob");
  });

  // ============================================
  // 6) TESTE DO SUCCESS (CHAMA TOAST)
  // ============================================
  it("calls toast on handleSuccess", async () => {
    (api.adminAll as any).mockResolvedValue([]);

    render(<Users />);

    fireEvent.click(screen.getByText("Adicionar Usuário"));

    const confirmBtn = await screen.findByTestId("mock-add-confirm");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });
  });
});
