// TODAS AS IMPORTAÇÕES NO TOPO
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

// Depois o resto do código
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => {};
HTMLElement.prototype.releasePointerCapture = () => {};
HTMLElement.prototype.scrollIntoView = vi.fn();

// ResizeObserver mock
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as any;
window.ResizeObserver = ResizeObserverMock as any;

// MOCK DO TOAST
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// MOCK DO API CLIENT
vi.mock("@/lib/api", () => ({
  api: {
    adminAll: vi.fn(),
    adminCreate: vi.fn(),
    adminUpdate: vi.fn(),
    adminDelete: vi.fn(),
  },
}));

// MOCK DOS DIALOGS
vi.mock("@/components/users/AddUserDialog", () => ({
  AddUserDialog: (props: any) => (
    <div data-testid="add-user-dialog" {...props} />
  ),
}));

vi.mock("@/components/users/EditUserDialog", () => ({
  EditUserDialog: (props: any) => (
    <div data-testid="edit-user-dialog" {...props} />
  ),
}));

vi.mock("@/components/users/DeleteUserDialog", () => ({
  DeleteUserDialog: (props: any) => (
    <div data-testid="delete-user-dialog" {...props} />
  ),
}));

expect.extend(matchers);
