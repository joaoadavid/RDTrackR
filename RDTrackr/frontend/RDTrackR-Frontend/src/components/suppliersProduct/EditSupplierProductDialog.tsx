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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ResponseProductJson,
  ResponseSupplierProductJson,
  RequestUpdateSupplierProductJson,
} from "@/generated/apiClient";

import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: number;
  product: ResponseSupplierProductJson | null; // item atual a ser editado
  onUpdated: (updated: ResponseSupplierProductJson) => void;
}

export function EditSupplierProductDialog({
  open,
  onOpenChange,
  supplierId,
  product,
  onUpdated,
}: Props) {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!open) return;

    api.productGET().then((res) => setProducts(res.items ?? []));
  }, [open]);

  // Preencher formulário ao abrir
  useEffect(() => {
    if (!product) return;

    setProductId(product.productId ?? null);
    setPrice(product.unitPrice?.toString() ?? "");
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !productId || !price) return;

    try {
      const dto = RequestUpdateSupplierProductJson.fromJS({
        supplierId,
        productId,
        unitPrice: Number(price),
      });

      const updated = await api.productsPUT(
        supplierId,
        product.productId!,
        dto
      );

      toast({
        title: "Produto atualizado!",
        description: "As informações deste item foram alteradas.",
      });

      onUpdated(updated);
      onOpenChange(false);
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível editar o produto do fornecedor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Produto do Fornecedor</DialogTitle>
          <DialogDescription>
            Ajuste o preço ou altere o item vinculado a este fornecedor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Produto */}
          <div>
            <Label>Produto</Label>
            <Select
              value={productId?.toString()}
              onValueChange={(v) => setProductId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um produto..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id!.toString()}>
                    {p.sku} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço */}
          <div>
            <Label>Preço negociado</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
