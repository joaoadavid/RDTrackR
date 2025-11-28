/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    contact: vi.fn(),
  },
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: any[]) => toastMock(...args),
}));

vi.mock("@/components/marketing/Header", () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock("@/components/marketing/Footer", () => ({
  Footer: () => <div data-testid="footer" />,
}));

import Contact from "@/pages/Contact";
import { api } from "@/lib/api";

// ajudar com o tipo do mock
const mockedApiContact = vi.mocked(api.contact);

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  );
  return { user };
}

it("deve renderizar título e subtítulo", () => {
  setup();

  expect(
    screen.getByRole("heading", { name: /entre em contato/i })
  ).toBeInTheDocument();

  expect(
    screen.getByText(/tem alguma dúvida\? preencha o formulário/i)
  ).toBeInTheDocument();
});

it("deve enviar mensagem e exibir toast de sucesso", async () => {
  const { user } = setup();

  mockedApiContact.mockResolvedValueOnce(undefined);

  await user.type(screen.getByLabelText(/nome completo/i), "João Teste");
  await user.type(screen.getByLabelText(/^email$/i), "teste@mail.com");
  await user.type(screen.getByLabelText(/assunto/i), "Ajuda");
  await user.type(screen.getByLabelText(/mensagem/i), "Mensagem teste");

  await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

  expect(mockedApiContact).toHaveBeenCalledTimes(1);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    })
  );
});

it("deve exibir mensagem de erro caso o envio falhe", async () => {
  const { user } = setup();

  mockedApiContact.mockRejectedValueOnce(new Error("fail"));

  await user.type(screen.getByLabelText(/nome completo/i), "João");
  await user.type(screen.getByLabelText(/^email$/i), "joao@mail.com");
  await user.type(screen.getByLabelText(/assunto/i), "Ajuda");
  await user.type(screen.getByLabelText(/mensagem/i), "Mensagem teste");

  await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro ao enviar mensagem",
      description: "Tente novamente mais tarde.",
      variant: "destructive",
    })
  );
});

it("deve limpar o formulário após envio bem-sucedido", async () => {
  const { user } = setup();

  mockedApiContact.mockResolvedValueOnce(undefined);

  const name = screen.getByLabelText(/nome completo/i);
  const email = screen.getByLabelText(/^email$/i);
  const subject = screen.getByLabelText(/assunto/i);
  const message = screen.getByLabelText(/mensagem/i);

  await user.type(name, "Maria");
  await user.type(email, "maria@mail.com");
  await user.type(subject, "Ajuda");
  await user.type(message, "Testando");

  await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

  expect(name).toHaveValue("");
  expect(email).toHaveValue("");
  expect(subject).toHaveValue("");
  expect(message).toHaveValue("");
});

it("deve renderizar Header e Footer", () => {
  setup();

  expect(screen.getByTestId("header")).toBeInTheDocument();
  expect(screen.getByTestId("footer")).toBeInTheDocument();
});
