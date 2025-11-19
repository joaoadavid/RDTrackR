import { useState } from "react";
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
import { RequestRegisterSupplierJson } from "@/generated/apiClient";
import { api } from "@/lib/api";

interface NewSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (supplier: any) => void;
}

export function NewSupplierDialog({
  open,
  onOpenChange,
  onCreate,
}: NewSupplierDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto = RequestRegisterSupplierJson.fromJS(form);

    const created = await api.supplierPOST(dto);

    onCreate(created);
    toast({
      title: "Criado",
      description: `O fornecedor "${created.name}" foi adicionado.`,
    });

    setForm({ name: "", contact: "", email: "", phone: "", address: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogDescription>
            Cadastre um novo parceiro ou distribuidor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da Empresa</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: TechSupply Brasil"
              required
            />
          </div>

          <div>
            <Label>Contato</Label>
            <Input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Ex: Carlos Silva"
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex: contato@empresa.com"
              required
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ex: (11) 98765-4321"
            />
          </div>

          <div>
            <Label>Endereço / Localização</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ex: São Paulo - SP"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Salvar Fornecedor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
