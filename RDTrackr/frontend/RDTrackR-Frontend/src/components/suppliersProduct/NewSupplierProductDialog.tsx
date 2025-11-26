import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  ResponseProductJson,
  RequestRegisterSupplierProductJson,
  ResponseSupplierProductJson,
} from "@/generated/apiClient";

import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: number | null;

  // Produtos já vinculados ao fornecedor
  existingProducts: ResponseSupplierProductJson[];

  onAdded: (item: ResponseSupplierProductJson) => void;
}

export function NewSupplierProductDialog({
  open,
  onOpenChange,
  supplierId,
  existingProducts,
  onAdded,
}: Props) {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");

  useEffect(() => {
    if (!open) return;

    api.productGET().then((res) => setProducts(res.items ?? []));
  }, [open]);

  // Filtragem automática
  const availableProducts = useMemo(() => {
    const existingIds = new Set(existingProducts.map((p) => p.productId));
    return products.filter((p) => !existingIds.has(p.id));
  }, [products, existingProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !supplierId || !price || !sku) return;

    try {
      const dto = RequestRegisterSupplierProductJson.fromJS({
        productId,
        unitPrice: Number(price),
        // supplierSKU não existe no backend → não enviar
        supplierSKU: sku,
      });

      const created = await api.productsPOST(supplierId, dto);

      toast({
        title: "Produto adicionado!",
        description: "O fornecedor agora fornece este item.",
      });

      onAdded(created);
      onOpenChange(false);

      setProductId(null);
      setPrice("");
      setSku("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível registrar o item.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Produto ao Fornecedor</DialogTitle>
          <DialogDescription>
            Escolha um produto que este fornecedor fornece.
          </DialogDescription>
        </DialogHeader>

        {availableProducts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Todos os produtos já estão vinculados a este fornecedor.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Produto</Label>
              <Select onValueChange={(v) => setProductId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher produto..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id!.toString()}>
                      {p.sku} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>SKU do fornecedor</Label>
              <Input
                placeholder="Ex: ABC-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Preço do fornecedor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 12.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
