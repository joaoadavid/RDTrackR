import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseWarehouseStockItemJson } from "@/generated/apiClient";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteWarehouseItemDialog } from "./DeleteWarehouseItemDialog";

interface WarehouseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: number | null;
  warehouseName: string;
}

export function WarehouseDetailsDialog({
  open,
  onOpenChange,
  warehouseId,
  warehouseName,
}: WarehouseDetailsDialogProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<ResponseWarehouseStockItemJson[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  async function loadItems() {
    if (!warehouseId) return;

    setLoading(true);

    try {
      const resp = await api.itemsAll(warehouseId);
      setItems(resp);
    } catch {
      toast({
        title: "Erro ao carregar itens",
        description: "Não foi possível obter os produtos deste depósito.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem() {
    if (!selectedItemId) return;

    try {
      await api.itemsDELETE(selectedItemId);

      toast({
        title: "Item excluído",
        description: "O item foi removido com sucesso.",
      });

      setIsDeleteOpen(false);
      setSelectedItemId(null);

      loadItems();
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (open) loadItems();
  }, [open, warehouseId]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Itens do Depósito • {warehouseName}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="py-6 text-center text-muted-foreground">
              Carregando...
            </p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Este depósito não possui itens.
            </p>
          ) : (
            <div className="rounded-lg border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Último Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.productId}>
                      <TableCell>{i.sku}</TableCell>
                      <TableCell>{i.productName}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell>{i.reorderPoint}</TableCell>
                      <TableCell>
                        R$ {i.lastPurchasePrice?.toFixed(2) ?? "0.00"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedItemId(i.id!); // precisa ter id no DTO, veja nota abaixo!
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação */}
      <DeleteWarehouseItemDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={deleteItem}
      />
    </>
  );
}
