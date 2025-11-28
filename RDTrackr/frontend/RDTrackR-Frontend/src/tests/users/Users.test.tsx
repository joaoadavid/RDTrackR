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

// Mock do Portal do Radix → necessário para que menu apareça no DOM
vi.mock("@radix-ui/react-portal", () => ({
  Portal: ({ children }: any) => children,
}));

// Mock dos dialogs – agora chamando onSuccess automaticamente
vi.mock("@/components/users/AddUserDialog", () => ({
  AddUserDialog: ({ onSuccess }: any) => {
    if (onSuccess) setTimeout(onSuccess, 0);
    return <div data-testid="add-user-dialog" />;
  },
}));

vi.mock("@/components/users/EditUserDialog", () => ({
  EditUserDialog: ({ onSuccess }: any) => {
    if (onSuccess) setTimeout(onSuccess, 0);
    return <div data-testid="edit-user-dialog" />;
  },
}));

vi.mock("@/components/users/DeleteUserDialog", () => ({
  DeleteUserDialog: ({ onSuccess }: any) => {
    if (onSuccess) setTimeout(onSuccess, 0);
    return <div data-testid="delete-user-dialog" />;
  },
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

  it("filters users when searching", async () => {
    (api.adminAll as any).mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        email: "alice@mail.com",
        role: "user",
      },
      {
        id: 2,
        name: "Bob",
        email: "bob@mail.com",
        role: "user",
      },
    ]);

    render(<Users />);

    await screen.findByText("Alice");

    fireEvent.change(screen.getByPlaceholderText("Buscar usuário..."), {
      target: { value: "alice" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it('opens AddUserDialog when clicking "Adicionar Usuário"', async () => {
    (api.adminAll as any).mockResolvedValue([]);

    render(<Users />);

    fireEvent.click(screen.getByText("Adicionar Usuário"));

    expect(screen.getByTestId("add-user-dialog")).toBeInTheDocument();
  });

  it('opens EditUserDialog when clicking "Editar"', async () => {
    (api.adminAll as any).mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        email: "alice@test.com",
        role: "user",
      },
    ]);

    const user = userEvent.setup();
    render(<Users />);

    const row = await screen.findByText("Alice");

    const actionsButton = row.closest("tr")!.querySelector("button")!;
    await user.click(actionsButton); // 🔥 Radix dropdown abre com userEvent

    const editOption = await screen.findByText("Editar");
    await user.click(editOption);

    expect(screen.getByTestId("edit-user-dialog")).toBeInTheDocument();
  });

  it('opens DeleteUserDialog when clicking "Excluir"', async () => {
    (api.adminAll as any).mockResolvedValue([
      { id: 2, name: "Bob", email: "bob@mail.com", role: "user" },
    ]);

    const user = userEvent.setup();
    render(<Users />);

    const row = await screen.findByText("Bob");

    const actionsButton = row.closest("tr")!.querySelector("button")!;
    await user.click(actionsButton); // abre drop

    const deleteOption = await screen.findByText("Excluir");
    await user.click(deleteOption);

    expect(screen.getByTestId("delete-user-dialog")).toBeInTheDocument();
  });

  it("calls toast on handleSuccess", async () => {
    (api.adminAll as any).mockResolvedValue([]);

    render(<Users />);

    fireEvent.click(screen.getByText("Adicionar Usuário"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });
  });
});
