/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import AuditLog from "@/pages/AuditLog";
import { api } from "@/lib/api";

import {
  ResponseAuditLogJsonPagedResponse,
  ResponseAuditLogJson,
} from "@/generated/apiClient";

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    logs: vi.fn(),
  },
}));

const mockedLogs = vi.mocked(api.logs);

const MOCK_LOGS = [
  new ResponseAuditLogJson({
    user: "João",
    action: "Criou um item",
    type: "CREATE",
    date: new Date("2025-02-10T12:00:00Z"),
  }),
  new ResponseAuditLogJson({
    user: "Maria",
    action: "Atualizou estoque",
    type: "UPDATE",
    date: new Date("2025-02-10T13:00:00Z"),
  }),
];

beforeEach(() => {
  vi.clearAllMocks();

  mockedLogs.mockImplementation(async (page, pageSize, type, search) => {
    let result = [...MOCK_LOGS];

    if (type) {
      result = result.filter((l) => l.type === type);
    }

    if (search) {
      result = result.filter((l) =>
        l.action.toLowerCase().includes(search.toLowerCase())
      );
    }

    return new ResponseAuditLogJsonPagedResponse({
      items: result,
      total: result.length,
      page,
    });
  });
});

it("deve exibir mensagem 'Nenhum registro encontrado' quando API retorna vazio", async () => {
  mockedLogs.mockResolvedValueOnce(
    new ResponseAuditLogJsonPagedResponse({
      items: [],
      total: 0,
      page: 1,
    })
  );

  render(<AuditLog />);

  expect(
    await screen.findByText("Nenhum registro encontrado.")
  ).toBeInTheDocument();
});
