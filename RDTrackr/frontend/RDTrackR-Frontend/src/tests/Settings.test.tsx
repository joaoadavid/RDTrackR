/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Settings from "@/pages/Settings";
import {
  RequestChangePasswordJson,
  RequestUpdateUserJson,
  ResponseUserProfileJson,
} from "@/generated/apiClient";

// ============================
// 🔧 Mocks
// ============================

// mock do toast
const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

// mock da API
vi.mock("@/lib/api", () => ({
  api: {
    userPOST: vi.fn(),
    userPUT: vi.fn(),
    changePassword: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockedUserPOST = vi.mocked(api.userPOST);
const mockedUserPUT = vi.mocked(api.userPUT);
const mockedChangePassword = vi.mocked(api.changePassword);

const MOCK_PROFILE = new ResponseUserProfileJson({
  name: "John Doe",
  email: "john@example.com",
});

beforeEach(() => {
  vi.clearAllMocks();

  mockedUserPOST.mockResolvedValue(MOCK_PROFILE);
  mockedUserPUT.mockResolvedValue(undefined as any);
  mockedChangePassword.mockResolvedValue(undefined as any);
});

// helper pra criar user
const setup = () => {
  const user = userEvent.setup();
  render(<Settings />);
  return user;
};

// ===========================================
// 🔹 Deve carregar o perfil e preencher campos
// ===========================================
it("deve carregar o perfil do usuário e preencher nome e email", async () => {
  setup();

  // espera o useEffect chamar a API e setar os valores
  await waitFor(() => {
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  expect(mockedUserPOST).toHaveBeenCalledTimes(1);
});

// ===========================================
// 🔹 Atualizar perfil com sucesso
// ===========================================
it("deve atualizar o perfil com sucesso e exibir toast de sucesso", async () => {
  const user = setup();

  await waitFor(() => {
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  const nameInput = screen.getByDisplayValue("John Doe") as HTMLInputElement;
  const emailInput = screen.getByDisplayValue(
    "john@example.com"
  ) as HTMLInputElement;

  // altera os valores
  await user.clear(nameInput);
  await user.type(nameInput, "Novo Nome");

  await user.clear(emailInput);
  await user.type(emailInput, "novo@example.com");

  const saveButton = screen.getByRole("button", {
    name: /salvar alterações/i,
  });

  await user.click(saveButton);

  expect(mockedUserPUT).toHaveBeenCalledTimes(1);

  const body = mockedUserPUT.mock.calls[0][0];
  expect(body).toBeInstanceOf(RequestUpdateUserJson);
  expect(body.name).toBe("Novo Nome");
  expect(body.email).toBe("novo@example.com");

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    })
  );
});

// ===========================================
// 🔹 Erro ao atualizar perfil
// ===========================================
it("deve exibir toast de erro se falhar ao atualizar o perfil", async () => {
  mockedUserPUT.mockRejectedValueOnce(new Error("Erro qualquer"));

  const user = setup();

  await waitFor(() => {
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  const saveButton = screen.getByRole("button", {
    name: /salvar alterações/i,
  });

  await user.click(saveButton);

  expect(mockedUserPUT).toHaveBeenCalledTimes(1);

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro ao atualizar",
      description: "Verifique os dados enviados.",
      variant: "destructive",
    })
  );
});

// ===========================================
// 🔹 Validação: campos obrigatórios da senha
// ===========================================
it("deve validar campos obrigatórios ao alterar senha", async () => {
  const user = setup();

  const changePasswordButton = await screen.findByRole("button", {
    name: /alterar senha/i,
  });

  await user.click(changePasswordButton);

  expect(mockedChangePassword).not.toHaveBeenCalled();
  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Campos obrigatórios",
      description: "Preencha todos os campos.",
    })
  );
});

// ===========================================
// 🔹 Validação: senhas não coincidem
// ===========================================
it("deve exibir erro quando a confirmação não corresponde à nova senha", async () => {
  const user = setup();

  const currentPwdInput = await screen.findByPlaceholderText(
    /digite sua senha atual/i
  );
  const newPwdInput = screen.getByPlaceholderText(/digite a nova senha/i);
  const confirmInput = screen.getByPlaceholderText(/repita a nova senha/i);

  await user.type(currentPwdInput, "senha-atual");
  await user.type(newPwdInput, "nova-senha");
  await user.type(confirmInput, "outra-senha");

  const changePasswordButton = screen.getByRole("button", {
    name: /alterar senha/i,
  });

  await user.click(changePasswordButton);

  expect(mockedChangePassword).not.toHaveBeenCalled();
  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Senhas não coincidem",
      description: "A confirmação deve ser igual à nova senha.",
      variant: "destructive",
    })
  );
});

// ===========================================
// 🔹 Alterar senha com sucesso
// ===========================================
it("deve alterar a senha com sucesso, limpar campos e exibir toast", async () => {
  const user = setup();

  const currentPwdInput = await screen.findByPlaceholderText(
    /digite sua senha atual/i
  );
  const newPwdInput = screen.getByPlaceholderText(/digite a nova senha/i);
  const confirmInput = screen.getByPlaceholderText(/repita a nova senha/i);

  await user.type(currentPwdInput, "senha-atual");
  await user.type(newPwdInput, "nova-senha");
  await user.type(confirmInput, "nova-senha");

  const changePasswordButton = screen.getByRole("button", {
    name: /alterar senha/i,
  });

  await user.click(changePasswordButton);

  expect(mockedChangePassword).toHaveBeenCalledTimes(1);

  const payload = mockedChangePassword.mock.calls[0][0];
  expect(payload).toBeInstanceOf(RequestChangePasswordJson);
  expect(payload.password).toBe("senha-atual");
  expect(payload.newPassword).toBe("nova-senha");

  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    })
  );

  // campos devem ser limpos após sucesso
  await waitFor(() => {
    expect(
      (
        screen.getByPlaceholderText(
          /digite sua senha atual/i
        ) as HTMLInputElement
      ).value
    ).toBe("");
    expect(
      (screen.getByPlaceholderText(/digite a nova senha/i) as HTMLInputElement)
        .value
    ).toBe("");
    expect(
      (screen.getByPlaceholderText(/repita a nova senha/i) as HTMLInputElement)
        .value
    ).toBe("");
  });
});

// ===========================================
// 🔹 Erro ao alterar senha
// ===========================================
it("deve exibir toast de erro se falhar ao alterar a senha", async () => {
  mockedChangePassword.mockRejectedValueOnce(new Error("Senha incorreta"));

  const user = setup();

  const currentPwdInput = await screen.findByPlaceholderText(
    /digite sua senha atual/i
  );
  const newPwdInput = screen.getByPlaceholderText(/digite a nova senha/i);
  const confirmInput = screen.getByPlaceholderText(/repita a nova senha/i);

  await user.type(currentPwdInput, "senha-atual");
  await user.type(newPwdInput, "nova-senha");
  await user.type(confirmInput, "nova-senha");

  const changePasswordButton = screen.getByRole("button", {
    name: /alterar senha/i,
  });

  await user.click(changePasswordButton);

  expect(mockedChangePassword).toHaveBeenCalledTimes(1);
  expect(toastMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Erro ao alterar senha",
      description: "Senha atual incorreta.",
      variant: "destructive",
    })
  );
});

// ===========================================
// 🔹 Toggle de mostrar/ocultar senha (PasswordInput)
// ===========================================
it("deve alternar entre mostrar e ocultar a senha", async () => {
  const user = setup();

  const currentPwdInput = await screen.findByPlaceholderText(
    /digite sua senha atual/i
  );

  const wrapper = currentPwdInput.parentElement!;
  const toggleButton = wrapper.querySelector("button") as HTMLButtonElement;

  // inicialmente deve ser type="password"
  expect((currentPwdInput as HTMLInputElement).type).toBe("password");

  await user.click(toggleButton);
  expect((currentPwdInput as HTMLInputElement).type).toBe("text");

  await user.click(toggleButton);
  expect((currentPwdInput as HTMLInputElement).type).toBe("password");
});
