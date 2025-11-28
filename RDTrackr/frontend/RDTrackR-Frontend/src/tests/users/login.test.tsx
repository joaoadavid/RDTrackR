/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type * as ReactRouterDom from "react-router-dom";

// ============================
// 🔧 Mocks
// ============================

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const loginMock = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

vi.mock("@/assets/LogoRDTrackR.svg", () => ({
  default: "logo-rdtrackr.svg",
}));

import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

// ============================
// Helper
// ============================
const setup = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  return { user };
};

// helpers pra pegar os inputs via Label -> div -> input
const getEmailInput = () => {
  const label = screen.getByText(/^email$/i);
  const wrapper = label.closest("div");
  if (!wrapper) throw new Error("Wrapper do email não encontrado");
  const input = wrapper.querySelector("input") as HTMLInputElement | null;
  if (!input) throw new Error("Input de email não encontrado");
  return input;
};

const getPasswordInput = () => {
  const label = screen.getByText(/^senha$/i);
  const wrapper = label.closest("div");
  if (!wrapper) throw new Error("Wrapper da senha não encontrado");
  const input = wrapper.querySelector("input") as HTMLInputElement | null;
  if (!input) throw new Error("Input de senha não encontrado");
  return input;
};

// ===========================================
// 🔹 Render básico
// ===========================================
it("deve renderizar o formulário de login com logo, textos e inputs", () => {
  setup();

  expect(screen.getByAltText(/rdtrackr logo/i)).toBeInTheDocument();
  expect(screen.getByText(/entre com suas credenciais/i)).toBeInTheDocument();

  // labels
  expect(screen.getByText(/^email$/i)).toBeInTheDocument();
  expect(screen.getByText(/^senha$/i)).toBeInTheDocument();

  // pelo menos um input renderizado (email)
  const inputs = screen.getAllByRole("textbox");
  expect(inputs.length).toBeGreaterThanOrEqual(1);

  expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /esqueci minha senha/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /voltar à home/i })
  ).toBeInTheDocument();
});

// ===========================================
// 🔹 Fluxo feliz: login com sucesso
// ===========================================
it("deve fazer login com sucesso, exibir toast e navegar para /inventory", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  loginMock.mockResolvedValueOnce(undefined);

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  await user.type(emailInput, "user@example.com");
  await user.type(passwordInput, "senha-secreta");

  const submitButton = screen.getByRole("button", { name: /entrar/i });
  await user.click(submitButton);

  expect(loginMock).toHaveBeenCalledTimes(1);
  expect(loginMock).toHaveBeenCalledWith("user@example.com", "senha-secreta");

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Login bem-sucedido",
      description: "Bem-vindo!",
    })
  );

  expect(mockNavigate).toHaveBeenCalledWith("/inventory");
});

// ===========================================
// 🔹 Erro: mensagem em err.result.message
// ===========================================
it("deve exibir toast de erro com mensagem de err.result.message quando o login falhar", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  loginMock.mockRejectedValueOnce({
    result: { message: "Credenciais inválidas." },
  });

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  await user.type(emailInput, "user@example.com");
  await user.type(passwordInput, "wrong-pass");

  const submitButton = screen.getByRole("button", { name: /entrar/i });
  await user.click(submitButton);

  expect(loginMock).toHaveBeenCalledTimes(1);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro no login",
      description: "Credenciais inválidas.",
      variant: "destructive",
    })
  );

  expect(mockNavigate).not.toHaveBeenCalled();
});

// ===========================================
// 🔹 Erro: mensagem em err.body.message
// ===========================================
it("deve exibir toast de erro com mensagem de err.body.message quando o login falhar", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  loginMock.mockRejectedValueOnce({
    body: { message: "Conta bloqueada." },
  });

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  await user.type(emailInput, "blocked@example.com");
  await user.type(passwordInput, "senha");

  const submitButton = screen.getByRole("button", { name: /entrar/i });
  await user.click(submitButton);

  expect(loginMock).toHaveBeenCalledTimes(1);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro no login",
      description: "Conta bloqueada.",
      variant: "destructive",
    })
  );

  expect(mockNavigate).not.toHaveBeenCalled();
});

// ===========================================
// 🔹 Erro: fallback
// ===========================================
it("deve usar mensagem padrão quando o erro não tiver message em result ou body", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  loginMock.mockRejectedValueOnce(new Error("Qualquer erro"));

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  await user.type(emailInput, "user@example.com");
  await user.type(passwordInput, "senha");

  const submitButton = screen.getByRole("button", { name: /entrar/i });
  await user.click(submitButton);

  expect(loginMock).toHaveBeenCalledTimes(1);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro no login",
      description: "Erro ao realizar login.",
      variant: "destructive",
    })
  );

  expect(mockNavigate).not.toHaveBeenCalled();
});

it("deve navegar para /forgot-password ao clicar em 'Esqueci minha senha'", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  const forgotButton = screen.getByRole("button", {
    name: /esqueci minha senha/i,
  });

  await user.click(forgotButton);

  expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
});

it("deve navegar para / ao clicar em 'Voltar à Home'", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  const homeButton = screen.getByRole("button", {
    name: /voltar à home/i,
  });

  await user.click(homeButton);

  expect(mockNavigate).toHaveBeenCalledWith("/");
});
