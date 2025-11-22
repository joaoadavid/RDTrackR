import { useState } from "react";
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

import { RequestAdminCreateUserJson } from "@/generated/apiClient";
import { api } from "@/lib/api";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddUserDialogProps) {
  const [form, setForm] = useState<RequestAdminCreateUserJson>(
    new RequestAdminCreateUserJson({
      name: "",
      email: "",
      password: "",
      role: "user",
    })
  );

  function handleChange(field: string, value: string) {
    const updated = new RequestAdminCreateUserJson(form);
    (updated as any)[field] = value;
    setForm(updated);
  }

  async function handleSubmit() {
    const payload = new RequestAdminCreateUserJson(form);

    await api.create(payload); // <-- correto
    onSuccess();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>Preencha os dados abaixo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.email}
              type="email"
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="text-sm font-medium">Senha</label>
            <Input
              value={form.password}
              type="password"
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Senha temporária"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
