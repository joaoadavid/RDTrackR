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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Trash2, Plus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  ResponseSupplierProductJson,
  RequestUpdateSupplierProductJson,
} from "@/generated/apiClient";

import { useToast } from "@/hooks/use-toast";
import { NewSupplierProductDialog } from "./NewSupplierProductDialog";
import { EditSupplierProductDialog } from "./EditSupplierProductDialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: number | null;
}

export function SupplierProductsDialog({
  open,
  onOpenChange,
  supplierId,
}: Props) {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseSupplierProductJson[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ResponseSupplierProductJson | null>(null);

  // LOAD PRODUCTS
  useEffect(() => {
    if (!open || !supplierId) return;

    setLoading(true);

    api
      .productsAll(supplierId)
      .then((resp) => setProducts(resp))
      .catch(() =>
        toast({
          title: "Erro ao carregar produtos",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [open, supplierId]);

  // DELETE
  const handleRemove = async (productId: number) => {
    try {
      await api.productsDELETE(supplierId!, productId);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));

      toast({
        title: "Produto removido",
        description: "O item foi desvinculado.",
      });
    } catch {
      toast({
        title: "Erro ao remover produto",
        variant: "destructive",
      });
    }
  };

  // EDIT
  const handleUpdate = async (newPrice: number) => {
    if (!selectedProduct || !supplierId) return;

    try {
      const dto = RequestUpdateSupplierProductJson.fromJS({
        supplierId,
        productId: selectedProduct.productId,
        unitPrice: newPrice,
      });

      const updated = await api.productsPUT(
        supplierId,
        selectedProduct.productId!,
        dto
      );

      setProducts((prev) =>
        prev.map((p) => (p.productId === updated.productId ? updated : p))
      );

      toast({
        title: "Atualizado!",
        description: "O preço foi atualizado.",
      });

      setIsEditOpen(false);
    } catch {
      toast({
        title: "Erro ao atualizar",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Produtos do Fornecedor</DialogTitle>
          <DialogDescription>
            Gerencie os produtos vinculados a este fornecedor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-3">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4}>Carregando...</TableCell>
                </TableRow>
              )}

              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Nenhum produto vinculado.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                products.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell>R$ {p.unitPrice?.toFixed(2)}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemove(p.productId!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* MODAL — ADD */}
      <NewSupplierProductDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        supplierId={supplierId}
        existingProducts={products} // 🔥 FILTRO AUTOMÁTICO
        onAdded={(prod) => setProducts((prev) => [...prev, prod])}
      />

      {selectedProduct && (
        <EditSupplierProductDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          supplierId={supplierId!}
          product={selectedProduct}
          onUpdated={(updated) =>
            setProducts((prev) =>
              prev.map((p) => (p.productId === updated.productId ? updated : p))
            )
          }
        />
      )}
    </Dialog>
  );
}
