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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ResponseProductJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";

interface NewMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (movement: any) => void;
}

export function NewMovementDialog({
  open,
  onOpenChange,
  onCreate,
}: NewMovementDialogProps) {
  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);

  const [form, setForm] = useState({
    type: "INBOUND",
    reference: "",
    productId: 0,
    warehouseId: 0,
    quantity: 1,
  });

  // -----------------------------
  // CARREGAR PRODUTOS E DEPÓSITOS
  // -----------------------------
  useEffect(() => {
    if (!open) return;

    api.productGET(1, 100).then((res) => setProducts(res.items ?? []));
    api.warehouseGET(1, 100).then((res) => setWarehouses(res.items ?? []));
  }, [open]);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId || !form.warehouseId) return;

    const qty = Math.abs(form.quantity);

    const newMovement = {
      ...form,
      quantity: qty,
    };

    onCreate(newMovement);
    onOpenChange(false);

    setForm({
      type: "INBOUND",
      reference: "",
      productId: 0,
      warehouseId: 0,
      quantity: 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Movimentação</DialogTitle>
          <DialogDescription>
            Registre entradas, saídas ou ajustes de estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* TYPE */}
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INBOUND">Entrada</SelectItem>
                <SelectItem value="OUTBOUND">Saída</SelectItem>
                <SelectItem value="ADJUST">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* REFERENCE */}
          <div>
            <Label htmlFor="reference">Referência</Label>
            <Input
              id="reference"
              placeholder="Ex: PO-1093"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              required
            />
          </div>

          {/* PRODUCT */}
          <div>
            <Label htmlFor="product">Produto</Label>
            <Select
              value={form.productId ? String(form.productId) : undefined}
              onValueChange={(v) => setForm({ ...form, productId: Number(v) })}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} — {p.sku}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* WAREHOUSE */}
          <div>
            <Label htmlFor="warehouse">Depósito</Label>
            <Select
              value={form.warehouseId ? String(form.warehouseId) : undefined}
              onValueChange={(v) =>
                setForm({ ...form, warehouseId: Number(v) })
              }
            >
              <SelectTrigger id="warehouse">
                <SelectValue placeholder="Selecione um depósito" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QUANTITY */}
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">Registrar Movimentação</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
