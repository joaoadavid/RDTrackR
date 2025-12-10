import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

import { ReplenishmentItem } from "./ReplenishmentTable";
import { api } from "@/lib/api";
import {
  ResponseSupplierJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

interface GeneratePoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ReplenishmentItem[];
  onConfirm: (
    supplierId: string,
    warehouseId: number,
    notes: string,
    groupBySupplier: boolean
  ) => void;
  isSubmitting?: boolean;
}

export function GeneratePoDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
  isSubmitting = false,
}: GeneratePoDialogProps) {
  const { toast } = useToast();

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [groupBySupplier, setGroupBySupplier] = useState(false);

  const [suppliers, setSuppliers] = useState<ResponseSupplierJson[]>([]);
  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);

  // 📌 Armazéns distintos dos itens selecionados
  const distinctWarehouses = useMemo(
    () => [...new Set(items.map((i) => i.warehouseId))],
    [items]
  );

  useEffect(() => {
    if (open) {
      api.supplierGET().then((res) => setSuppliers(res.items ?? []));
      api.warehouseGET().then((res) => setWarehouses(res.items ?? []));
    }
  }, [open]);

  // 📌 Evita abrir modal com múltiplos armazéns
  useEffect(() => {
    if (open && distinctWarehouses.length > 1) {
      toast({
        variant: "destructive",
        title: "Itens de múltiplos armazéns",
        description:
          "Você selecionou itens de armazéns diferentes. Gere pedidos separados.",
      });

      onOpenChange(false);
    }
  }, [open, distinctWarehouses, toast, onOpenChange]);

  const totalValue = items.reduce(
    (sum, item) => sum + item.suggestedQty * item.unitPrice,
    0
  );

  const handleConfirm = () => {
    if (!supplierId || !warehouseId || isSubmitting) return;

    if (distinctWarehouses.length > 1) {
      toast({
        variant: "destructive",
        title: "Não permitido",
        description: "Não é permitido gerar pedido com múltiplos armazéns.",
      });
      return;
    }

    onConfirm(supplierId, warehouseId, "", groupBySupplier);

    setSupplierId("");
    setWarehouseId(null);
    setGroupBySupplier(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Pedido de Compra</DialogTitle>
          <DialogDescription>
            {items.length} item(ns) serão incluídos no pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* RESUMO */}
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-semibold text-sm">Resumo</h4>
            <div className="space-y-1 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.sku} - {item.name}
                  </span>
                  <span className="font-medium">
                    {item.suggestedQty} {item.uom} × R$
                    {item.unitPrice.toFixed(2)} = R$
                    {(item.suggestedQty * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total estimado</span>
                <span>R$ {totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* FORNECEDOR */}
          <div className="space-y-2">
            <Label>Fornecedor *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id!.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ARMAZÉM */}
          <div className="space-y-2">
            <Label>Armazém *</Label>
            <Select
              disabled={distinctWarehouses.length > 1}
              value={warehouseId?.toString()}
              onValueChange={(v) => setWarehouseId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id!.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {distinctWarehouses.length > 1 && (
              <p className="text-red-600 text-sm mt-1">
                🚫 Você selecionou itens de múltiplos armazéns. Gere pedidos
                separados.
              </p>
            )}
          </div>

          {/* AGRUPAR */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="group"
              checked={groupBySupplier}
              onCheckedChange={(checked) =>
                setGroupBySupplier(checked as boolean)
              }
            />
            <Label htmlFor="group">Agrupar por fornecedor preferencial</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!supplierId || !warehouseId || isSubmitting}
          >
            {isSubmitting ? "Gerando pedido..." : "Gerar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
