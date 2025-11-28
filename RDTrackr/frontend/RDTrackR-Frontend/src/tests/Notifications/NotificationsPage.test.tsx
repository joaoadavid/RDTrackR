/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import NotificationsPage from "@/pages/Notifications";

// 🔥 MOCK DO HOOK
const mockMarkAsRead = vi.fn();
const mockReload = vi.fn();

const mockUseNotifications = vi.fn();

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => mockUseNotifications(),
}));

// helper para montar componente
const renderPage = () => render(<NotificationsPage />);

beforeEach(() => {
  vi.clearAllMocks();
  mockMarkAsRead.mockReset();
  mockReload.mockReset();
});

it("exibe loader enquanto loading = true", () => {
  mockUseNotifications.mockReturnValue({
    notifications: [],
    loading: true,
    markAsRead: mockMarkAsRead,
    reload: mockReload,
  });

  renderPage();

  // Loader é o único elemento com classe animate-spin
  expect(document.querySelector(".animate-spin")).toBeInTheDocument();
});

it("exibe mensagem de vazio quando não há notificações", () => {
  mockUseNotifications.mockReturnValue({
    notifications: [],
    loading: false,
    markAsRead: mockMarkAsRead,
    reload: mockReload,
  });

  renderPage();

  expect(
    screen.getByText(/nenhuma notificação encontrada/i)
  ).toBeInTheDocument();
});

it("chama markAsRead ao clicar em 'Marcar como lida'", async () => {
  mockUseNotifications.mockReturnValue({
    loading: false,
    reload: mockReload,
    markAsRead: mockMarkAsRead,
    notifications: [
      {
        id: 7,
        message: "Nova mensagem",
        createdAt: new Date(),
        isRead: false,
      },
    ],
  });

  renderPage();

  fireEvent.click(screen.getByRole("button", { name: /marcar como lida/i }));

  expect(mockMarkAsRead).toHaveBeenCalledTimes(1);
  expect(mockMarkAsRead).toHaveBeenCalledWith(7);
});
it("chama reload ao clicar no botão Recarregar", () => {
  mockUseNotifications.mockReturnValue({
    loading: false,
    notifications: [],
    markAsRead: mockMarkAsRead,
    reload: mockReload,
  });

  renderPage();

  fireEvent.click(screen.getByRole("button", { name: /recarregar/i }));

  expect(mockReload).toHaveBeenCalledTimes(1);
});
it("exibe badge 'Lida' quando isRead = true", () => {
  mockUseNotifications.mockReturnValue({
    loading: false,
    reload: mockReload,
    markAsRead: mockMarkAsRead,
    notifications: [
      {
        id: 3,
        message: "Estoque baixo",
        createdAt: new Date(),
        isRead: true,
      },
    ],
  });

  renderPage();

  expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument();
  expect(screen.getByText(/lida/i)).toBeInTheDocument();

  // Não deve renderizar botão
  expect(
    screen.queryByRole("button", { name: /marcar como lida/i })
  ).not.toBeInTheDocument();
});
