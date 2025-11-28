import { useState, useEffect, useMemo } from "react";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  RequestCreatePurchaseOrderJson,
  ResponseSupplierJson,
  ResponseSupplierProductJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ItemCard } from "./ItemCard"; // ⬅️ importe o componente separado

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (order: any) => void;
}

export function NewPurchaseOrderDialog({
  open,
  onOpenChange,
  onCreate,
}: Props) {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<ResponseSupplierJson[]>([]);
  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  const [supplierProducts, setSupplierProducts] = useState<
    ResponseSupplierProductJson[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");

  const [items, setItems] = useState([
    { productId: 0, quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    if (open) {
      api.supplierGET().then((res) => setSuppliers(res.items ?? []));
      api.warehouseGET().then((res) => setWarehouses(res.items ?? []));
    }
  }, [open]);

  useEffect(() => {
    if (!supplierId) return;

    setItems([{ productId: 0, quantity: 1, unitPrice: 0 }]);

    api
      .productsAll(supplierId)
      .then((resp) => setSupplierProducts(resp))
      .catch(() =>
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos.",
          variant: "destructive",
        })
      );
  }, [supplierId]);

  function addItem() {
    setItems((prev) => [...prev, { productId: 0, quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(index: number, field: string, value: any) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function handleProductSelect(index: number, productId: number) {
    const p = supplierProducts.find((x) => x.productId === productId);

    updateItem(index, "productId", productId);

    updateItem(index, "unitPrice", p?.unitPrice ?? 0);
  }

  const itemTotals = useMemo(
    () => items.map((i) => i.quantity * i.unitPrice),
    [items]
  );

  const grandTotal = useMemo(
    () => itemTotals.reduce((sum, t) => sum + t, 0),
    [itemTotals]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!supplierId) {
      toast({
        title: "Fornecedor obrigatório",
        description: "Selecione um fornecedor antes de criar o pedido.",
        variant: "destructive",
      });
      return;
    }

    if (!warehouseId) {
      toast({
        title: "Armazém obrigatório",
        description: "Selecione um Warehouse para este pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dto = RequestCreatePurchaseOrderJson.fromJS({
        supplierId,
        warehouseId,
        number: orderNumber,
        items,
      });

      const created = await api.purchaseorderPOST(dto);

      toast({
        title: "Pedido criado!",
        description: `Pedido Nº ${created.number}`,
      });

      onCreate(created);
      onOpenChange(false);

      setSupplierId(null);
      setWarehouseId(null);
      setOrderNumber("");
      setSupplierProducts([]);
      setItems([{ productId: 0, quantity: 1, unitPrice: 0 }]);
    } catch (err: any) {
      const message =
        err?.result?.messages?.[0] ??
        err?.result?.message ??
        err?.body?.message ??
        "Erro ao criar pedido.";

      toast({
        title: "Erro ao criar pedido",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido de Compra</DialogTitle>
          <DialogDescription>
            Preencha as informações do pedido abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Número do Pedido</Label>
            <Input
              placeholder="EX: PO-2025-001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Fornecedor</Label>
            <Select
              value={supplierId !== null ? supplierId.toString() : undefined}
              onValueChange={(v) => setSupplierId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id!.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Armazém</Label>

            <Select
              value={warehouseId !== null ? warehouseId.toString() : undefined}
              onValueChange={(v) => setWarehouseId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o armazém" />
              </SelectTrigger>

              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id!.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Itens do Pedido</Label>

            {items.map((item, index) => (
              <ItemCard
                key={index}
                index={index}
                item={item}
                supplierProducts={supplierProducts}
                itemTotals={itemTotals}
                updateItem={updateItem}
                handleProductSelect={handleProductSelect}
                removeItem={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
                warehouses={warehouses}
                warehouseId={warehouseId}
              />
            ))}

            <Button
              variant="outline"
              type="button"
              onClick={addItem}
              className="w-full"
            >
              + Adicionar Item
            </Button>
          </div>

          <div className="text-right text-lg font-bold mt-2">
            Total: R$ {grandTotal.toFixed(2)}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Criando..." : "Criar Pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
