// src/components/items/NewProductDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RequestRegisterProductJson } from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (dto: RequestRegisterProductJson) => Promise<void>;
}

export function NewProductDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [uoM, setUoM] = useState("");
  const [price, setPrice] = useState(0);

  async function handleSubmit() {
    const dto = new RequestRegisterProductJson({
      name,
      sku,
      category,
      uoM,
      price,
    });

    await onCreate(dto);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div>
            <Label>Categoria</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <Label>UoM</Label>
            <Input value={uoM} onChange={(e) => setUoM(e.target.value)} />
          </div>

          <div>
            <Label>Preço</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Criar Produto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
