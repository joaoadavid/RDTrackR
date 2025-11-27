import { useState, useEffect } from "react";
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
  const [reorderPoint, setReorderPoint] = useState(0);

  const [errors, setErrors] = useState<string[]>([]);

  function resetForm() {
    setName("");
    setSku("");
    setCategory("");
    setUoM("");
    setPrice(0);
    setReorderPoint(0);
    setErrors([]);
  }

  function validateForm(): string[] {
    const temp: string[] = [];

    if (!name.trim()) temp.push("Nome é obrigatório.");
    if (!sku.trim()) temp.push("SKU é obrigatório.");
    if (!category.trim()) temp.push("Categoria é obrigatória.");
    if (!uoM.trim()) temp.push("Unidade de medida (UoM) é obrigatória.");
    if (reorderPoint < 0) temp.push("Reorder Point não pode ser negativo.");

    return temp;
  }

  async function handleSubmit() {
    const validation = validateForm();
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    const dto = new RequestRegisterProductJson({
      name,
      sku,
      category,
      uoM,
      price,
      reorderPoint,
    });

    try {
      await onCreate(dto);
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors ??
        error?.body?.errors ?? ["Erro inesperado ao criar o produto."];
      setErrors(apiErrors);
    }
  }

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) resetForm();
        onOpenChange(state);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-100 text-red-800 p-3 rounded">
              <ul className="list-disc list-inside">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

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

          <div>
            <Label>Reorder Point</Label>
            <Input
              type="number"
              min={0}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))}
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
