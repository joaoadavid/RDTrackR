/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ForgotPassword from "@/pages/ForgotPassword";

// ==============================
// MOCKS
// ==============================
vi.mock("@/lib/api", () => ({
  api: {
    codeResetPassword: vi.fn(),
    validateResetCode: vi.fn(),
  },
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { api } from "@/lib/api";
const mockedApi = vi.mocked(api);

// ==============================
// SETUP
// ==============================
function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
  return { user };
}

// ======================================================================
// TESTES
// ======================================================================

it("renderiza formulário inicial", () => {
  setup();

  expect(
    screen.getByRole("heading", { name: /recuperar senha/i })
  ).toBeInTheDocument();

  // Agora existe htmlFor + id -> usamos getByLabelText
  expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
});

it("envia código e avança para etapa de validação", async () => {
  const { user } = setup();

  mockedApi.codeResetPassword.mockResolvedValueOnce(undefined);

  await user.type(screen.getByLabelText(/^email$/i), "user@mail.com");
  await user.click(screen.getByRole("button", { name: /enviar código/i }));

  expect(mockedApi.codeResetPassword).toHaveBeenCalledWith("user@mail.com");

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Código enviado!" })
  );

  // Avançou para o passo 2
  expect(
    await screen.findByRole("heading", { name: /verificar código/i })
  ).toBeInTheDocument();
});

it("exibe erro quando falha ao enviar", async () => {
  const { user } = setup();

  mockedApi.codeResetPassword.mockRejectedValueOnce(new Error("fail"));

  await user.type(screen.getByLabelText(/^email$/i), "user@mail.com");
  await user.click(screen.getByRole("button", { name: /enviar código/i }));

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro ao enviar código",
      variant: "destructive",
    })
  );
});

it("valida código e navega para reset-password", async () => {
  const { user } = setup();

  // Passo 1
  mockedApi.codeResetPassword.mockResolvedValueOnce(undefined);
  await user.type(screen.getByLabelText(/^email$/i), "user@mail.com");
  await user.click(screen.getByRole("button", { name: /enviar código/i }));

  // Passo 2
  mockedApi.validateResetCode.mockResolvedValueOnce(undefined);

  await user.type(screen.getByLabelText(/^código$/i), "123456");
  await user.click(screen.getByRole("button", { name: /validar código/i }));

  expect(navigateMock).toHaveBeenCalledWith(
    "/reset-password?email=user@mail.com&code=123456"
  );
});

it("exibe erro quando o código é inválido", async () => {
  const { user } = setup();

  mockedApi.codeResetPassword.mockResolvedValueOnce(undefined);
  await user.type(screen.getByLabelText(/^email$/i), "user@mail.com");
  await user.click(screen.getByRole("button", { name: /enviar código/i }));

  mockedApi.validateResetCode.mockRejectedValueOnce({
    body: { message: ["Código inválido"] },
  });

  await user.type(screen.getByLabelText(/^código$/i), "999999");
  await user.click(screen.getByRole("button", { name: /validar código/i }));

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Código inválido",
      description: "Código inválido",
    })
  );
});
