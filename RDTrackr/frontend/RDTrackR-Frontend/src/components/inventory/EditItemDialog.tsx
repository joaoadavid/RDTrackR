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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  RequestRegisterProductJson,
  ResponseProductJson,
} from "@/generated/apiClient";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ResponseProductJson | null;
  onUpdate: (
    item: ResponseProductJson,
    payload: RequestRegisterProductJson
  ) => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  onUpdate,
}: EditItemDialogProps) {
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        uoM: item.uoM,
        price: item.price.toString(),
        stock: item.stock.toString(),
        reorderPoint: item.reorderPoint.toString(),
      });
    }
  }, [item]);

  if (!form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new RequestRegisterProductJson({
      sku: form.sku,
      name: form.name,
      category: form.category,
      uoM: form.uoM,
      price: Number(form.price),
      stock: Number(form.stock),
      reorderPoint: Number(form.reorderPoint),
    });

    // Esse objeto é exibido na tabela
    const updatedEntity = new ResponseProductJson({
      id: form.id,
      sku: payload.sku!,
      name: payload.name!,
      category: payload.category!,
      uoM: payload.uoM!,
      price: payload.price!,
      stock: payload.stock!,
      reorderPoint: payload.reorderPoint!,
    });

    onUpdate(updatedEntity, payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto selecionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="uoM">Unidade</Label>
              <Select
                value={form.uoM}
                onValueChange={(val) => setForm({ ...form, uoM: val })}
              >
                <SelectTrigger id="uoM">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">Unidade</SelectItem>
                  <SelectItem value="KG">Kg</SelectItem>
                  <SelectItem value="CX">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reorderPoint">Reorder</Label>
              <Input
                id="reorderPoint"
                type="number"
                value={form.reorderPoint}
                onChange={(e) =>
                  setForm({ ...form, reorderPoint: e.target.value })
                }
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
