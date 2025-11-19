import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  RequestUpdateSupplierJson,
  ResponseSupplierJson,
} from "@/generated/apiClient";
import { api } from "@/lib/api";

interface EditSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: ResponseSupplierJson | null;
  onSave: (supplier: ResponseSupplierJson) => void;
}

export function EditSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
}: EditSupplierDialogProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    id: 0,
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  // PREENCHE O FORMULARIO AO ABRIR
  useEffect(() => {
    if (supplier) {
      setForm({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
      });
    }
  }, [supplier]);

  // <- AGORA SIM! AQUI É SEGURO COLOCAR
  if (!supplier) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto = RequestUpdateSupplierJson.fromJS({
      name: form.name,
      contact: form.contact,
      email: form.email,
      phone: form.phone,
      address: form.address,
    });

    try {
      const updated = await api.supplierPUT(form.id, dto);
      onSave(updated);
      onOpenChange(false);
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o fornecedor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
          <DialogDescription>
            Atualize os dados do fornecedor selecionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da Empresa</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Contato</Label>
            <Input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>Endereço / Localização</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
