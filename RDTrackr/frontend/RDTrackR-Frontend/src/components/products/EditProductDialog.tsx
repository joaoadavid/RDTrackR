import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RequestRegisterProductJson,
  ResponseProductJson,
} from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ResponseProductJson;
  onEdit: (dto: RequestRegisterProductJson) => Promise<void>;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onEdit,
}: Props) {
  const [form, setForm] = useState<RequestRegisterProductJson>(
    new RequestRegisterProductJson()
  );

  useEffect(() => {
    if (product) {
      setForm(
        new RequestRegisterProductJson({
          name: product.name!,
          sku: product.sku!,
          category: product.category!,
          uoM: product.uoM!,
          price: product.price!,
          reorderPoint: product.reorderPoint,
        })
      );
    }
  }, [product]);

  function update(field: string, value: any) {
    setForm((prev) => {
      const clone = new RequestRegisterProductJson(prev);
      (clone as any)[field] = value;
      return clone;
    });
  }

  async function handleSubmit() {
    await onEdit(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <Label>SKU</Label>
            <Input
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>

          <div>
            <Label>UoM</Label>
            <Input
              value={form.uoM}
              onChange={(e) => update("uoM", e.target.value)}
            />
          </div>

          <div>
            <Label>Preço</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
