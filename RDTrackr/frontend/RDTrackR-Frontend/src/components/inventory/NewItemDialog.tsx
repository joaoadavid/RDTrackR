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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { RequestRegisterProductJson } from "@/generated/apiClient";

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (item: RequestRegisterProductJson) => void;
}

export function NewItemDialog({
  open,
  onOpenChange,
  onCreate,
}: NewItemDialogProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    uoM: "UN", // ⚠ campo correto exigido pelo backend
    price: "",
    stock: "",
    reorderPoint: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.sku) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o SKU e o nome do produto.",
        variant: "destructive",
      });
      return;
    }

    // 🔥 Agora usando o construtor do NSwag
    const payload = new RequestRegisterProductJson({
      sku: form.sku,
      name: form.name,
      category: form.category,
      uoM: form.uoM,
      price: Number(form.price),
      stock: Number(form.stock),
      reorderPoint: Number(form.reorderPoint),
    });

    onCreate(payload);

    toast({
      title: "Item adicionado",
      description: `O produto "${form.name}" foi cadastrado com sucesso.`,
    });

    // reset form
    setForm({
      sku: "",
      name: "",
      category: "",
      uoM: "UN",
      price: "",
      stock: "",
      reorderPoint: "",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Item</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto no inventário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
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
                placeholder="Ex: Eletrônicos"
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
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="reorderPoint">Ponto de Reposição</Label>
              <Input
                id="reorderPoint"
                type="number"
                value={form.reorderPoint}
                onChange={(e) =>
                  setForm({ ...form, reorderPoint: e.target.value })
                }
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Salvar Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
