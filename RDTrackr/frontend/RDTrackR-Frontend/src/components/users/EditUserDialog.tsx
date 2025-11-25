import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Eye, EyeOff } from "lucide-react";

import {
  ResponseUserListItemJson,
  RequestAdminUpdateUserJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";

// =======================================================
// 🔥 Componente de senha com mostrar/ocultar
// =======================================================
function PasswordInput({ value, onChange, placeholder }: any) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="pr-10"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

// =======================================================
// 🔥 EditUserDialog
// =======================================================
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ResponseUserListItemJson | null;
  onSuccess: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const [form, setForm] = useState<RequestAdminUpdateUserJson>(
    new RequestAdminUpdateUserJson({
      name: "",
      email: "",
      role: "user",
      active: true,
      newPassword: undefined,
    })
  );

  const [changePassword, setChangePassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (user) {
      setForm(
        new RequestAdminUpdateUserJson({
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "user",
          active: user.active ?? true,
          newPassword: undefined,
        })
      );

      setChangePassword(false);
      setPasswordConfirm("");
    }
  }, [user]);

  function handleChange(field: string, value: any) {
    const updated = new RequestAdminUpdateUserJson(form);
    (updated as any)[field] = value;
    setForm(updated);
  }

  async function handleSubmit() {
    if (!user?.id) return;

    // 🔐 validação da senha
    if (changePassword) {
      if (!form.newPassword || !passwordConfirm) {
        alert("Preencha a nova senha e a confirmação.");
        return;
      }

      if (form.newPassword !== passwordConfirm) {
        alert("As senhas não coincidem.");
        return;
      }
    } else {
      form.newPassword = undefined;
    }

    const payload = new RequestAdminUpdateUserJson(form);

    await api.adminPUT(Number(user.id), payload);

    onSuccess();
    onOpenChange(false);
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados deste usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Papel */}
          <div>
            <label className="text-sm font-medium">Papel</label>
            <Select
              value={form.role}
              onValueChange={(v) => handleChange("role", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin / Gerente</SelectItem>
                <SelectItem value="user">Usuário Padrão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.active ? "active" : "inactive"}
              onValueChange={(v) => handleChange("active", v === "active")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TROCAR SENHA */}
          <div className="border-t pt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
              />
              Alterar Senha
            </label>

            {changePassword && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Nova senha</label>
                  <PasswordInput
                    value={form.newPassword ?? ""}
                    placeholder="Digite a nova senha"
                    onChange={(e: any) =>
                      handleChange("newPassword", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirmar nova senha
                  </label>
                  <PasswordInput
                    value={passwordConfirm}
                    placeholder="Repita a nova senha"
                    onChange={(e: any) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
