import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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

import {
  RequestUpdateWarehouseJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

interface EditWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: ResponseWarehouseJson | null;
  onUpdate: (
    updatedEntity: ResponseWarehouseJson,
    dto: RequestUpdateWarehouseJson
  ) => void;
}

export function EditWarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  onUpdate,
}: EditWarehouseDialogProps) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    capacity: "",
    items: "",
  });

  useEffect(() => {
    if (warehouse) {
      setForm({
        name: warehouse.name ?? "",
        location: warehouse.location ?? "",
        capacity: String(warehouse.capacity ?? ""),
        items: String(warehouse.items ?? ""),
      });
    }
  }, [warehouse]);

  if (!warehouse) return null;

  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dto = RequestUpdateWarehouseJson.fromJS({
      name: form.name,
      location: form.location,
      capacity: Number(form.capacity),
      items: Number(form.items),
    });

    const updatedEntity = ResponseWarehouseJson.fromJS({
      ...warehouse,
      name: form.name,
      location: form.location,
      capacity: Number(form.capacity),
      items: Number(form.items),
      updatedAt: new Date(),
      updatedByName: user ?? "Usuário",
    });

    onUpdate(updatedEntity, dto);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Depósito</DialogTitle>
          <DialogDescription>
            Atualize as informações do depósito selecionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Localização</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Capacidade Total (itens)</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Itens Armazenados</Label>
              <Input
                type="number"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
