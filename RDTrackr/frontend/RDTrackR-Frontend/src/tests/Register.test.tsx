/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type * as ReactRouterDom from "react-router-dom";

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

const registerOrganizationMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    registerOrganization: registerOrganizationMock,
  }),
}));

vi.mock("@/assets/LogoRDTrackR.svg", () => ({
  default: "logo-rdtrackr.svg",
}));

import { MemoryRouter } from "react-router-dom";
import Register from "@/pages/Register";

const setup = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
  return { user };
};

it("deve renderizar o formulário de registro com textos principais e links", () => {
  setup();

  expect(
    screen.getByRole("heading", { name: /criar organização/i })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      /preencha as informações para criar sua organização e o administrador/i
    )
  ).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /voltar para home/i });
  expect(backLink).toBeInTheDocument();
  expect(backLink).toHaveAttribute("href", "/");

  const loginLink = screen.getByRole("link", { name: /já tenho conta/i });
  expect(loginLink).toBeInTheDocument();
  expect(loginLink).toHaveAttribute("href", "/login");
});

it("deve submeter o formulário, chamar registerOrganization, exibir toast de sucesso e navegar para /inventory", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  registerOrganizationMock.mockResolvedValueOnce(undefined);

  await user.type(screen.getByLabelText(/nome da organização/i), "Minha Org");
  await user.type(
    screen.getByLabelText(/nome do administrador/i),
    "Admin Teste"
  );
  await user.type(
    screen.getByLabelText(/e-mail do administrador/i),
    "admin@example.com"
  );
  await user.type(screen.getByLabelText(/senha/i), "senha-secreta");

  const submitButton = screen.getByRole("button", {
    name: /criar organização/i,
  });
  await user.click(submitButton);

  expect(registerOrganizationMock).toHaveBeenCalledTimes(1);
  expect(registerOrganizationMock).toHaveBeenCalledWith(
    "Minha Org",
    "Admin Teste",
    "admin@example.com",
    "senha-secreta"
  );

  // toast de sucesso
  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Organização criada com sucesso!",
      description: "Administrador Admin Teste registrado.",
    })
  );

  // navegação para dashboard
  expect(mockNavigate).toHaveBeenCalledWith("/inventory");
});

it("deve exibir toast de erro com mensagem vinda do backend quando o cadastro falhar", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  registerOrganizationMock.mockRejectedValueOnce({
    result: { message: "Organização já existe." },
  });

  await user.type(
    screen.getByLabelText(/nome da organização/i),
    "Org Existente"
  );
  await user.type(
    screen.getByLabelText(/nome do administrador/i),
    "Admin Erro"
  );
  await user.type(
    screen.getByLabelText(/e-mail do administrador/i),
    "erro@example.com"
  );
  await user.type(screen.getByLabelText(/senha/i), "senha-erro");

  const submitButton = screen.getByRole("button", {
    name: /criar organização/i,
  });
  await user.click(submitButton);

  // registerOrganization chamado
  expect(registerOrganizationMock).toHaveBeenCalledTimes(1);

  // toast de erro com mensagem do backend
  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro no cadastro",
      description: "Organização já existe.",
      variant: "destructive",
    })
  );

  // não deve navegar
  expect(mockNavigate).not.toHaveBeenCalled();
});

// ===========================================
// 🔹 Fluxo de erro: sem mensagem específica (usa fallback)
// ===========================================
it("deve usar mensagem padrão quando o erro não tiver message em result/data", async () => {
  const { user } = setup();
  vi.clearAllMocks();

  registerOrganizationMock.mockRejectedValueOnce(new Error("Erro qualquer"));

  await user.type(screen.getByLabelText(/nome da organização/i), "Org X");
  await user.type(screen.getByLabelText(/nome do administrador/i), "Admin X");
  await user.type(
    screen.getByLabelText(/e-mail do administrador/i),
    "x@example.com"
  );
  await user.type(screen.getByLabelText(/senha/i), "senha-x");

  const submitButton = screen.getByRole("button", {
    name: /criar organização/i,
  });
  await user.click(submitButton);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro no cadastro",
      description: "Erro ao registrar organização.",
      variant: "destructive",
    })
  );
});
