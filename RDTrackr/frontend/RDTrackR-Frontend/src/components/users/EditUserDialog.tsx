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

import {
  ResponseUserListItemJson,
  RequestAdminUpdateUserJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";

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
    })
  );

  useEffect(() => {
    if (user) {
      setForm(
        new RequestAdminUpdateUserJson({
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "user",
          active: user.active ?? true,
        })
      );
    }
  }, [user]);

  function handleChange(field: string, value: any) {
    const updated = new RequestAdminUpdateUserJson(form);
    (updated as any)[field] = value;
    setForm(updated);
  }

  async function handleSubmit() {
    if (!user?.id) return;

    const payload = new RequestAdminUpdateUserJson(form);

    await api.adminPUT(Number(user.id), payload); // <-- correto

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
