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
  RequestCreateOrderItemJson,
  RequestCreateOrderJson,
  ResponseProductJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

import { useToast } from "@/hooks/use-toast";
import { OrderItemCard } from "./OrderItemCard";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewOrderDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  const [isValidCustomer, setIsValidCustomer] = useState(false);

  // 🔍 Validação de nome do cliente
  useEffect(() => {
    setIsValidCustomer(customerName.trim().length >= 3);
  }, [customerName]);

  // 🔄 Carregar dados ao abrir modal
  useEffect(() => {
    if (open) {
      api.productGET().then((res) => setProducts(res.items ?? []));
      api.warehouseGET().then((res) => setWarehouses(res.items ?? []));
      setItems([{ productId: 0, quantity: 1, price: 0, availableStock: 0 }]);
      setCustomerName("");
      setIsValidCustomer(false);
      setWarehouseId(null);
    }
  }, [open]);

  // 🧼 Reset de estoque ao trocar depósito
  useEffect(() => {
    setItems((prev) => prev.map((i) => ({ ...i, availableStock: 0 })));
  }, [warehouseId]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productId: 0, quantity: 1, price: 0, availableStock: 0 },
    ]);
  }

  function updateItem(index: number, field: string, value: any) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  // ✔ regra do botão: cliente válido + armazém + itens válidos
  const hasInvalidItem = items.some(
    (i) => !i.productId || i.quantity <= 0 || i.price <= 0
  );
  const isFormValid = isValidCustomer && warehouseId && !hasInvalidItem;

  async function handleSubmit() {
    if (!isFormValid) return;

    const formattedItems = items.map(
      (i) =>
        new RequestCreateOrderItemJson({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })
    );

    const payload = new RequestCreateOrderJson({
      customerName,
      warehouseId,
      items: formattedItems,
    });

    try {
      await api.ordersPOST(payload);

      toast({
        title: "Pedido criado!",
        description: "O pedido foi registrado com sucesso.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);

      toast({
        title: "Erro ao registrar pedido",
        description: error?.result?.message ?? "Falha ao registrar o pedido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Escolha os itens e o armazém corretamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CLIENTE */}
          <div className="relative">
            <Label>Cliente *</Label>
            <Input
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`
                ${customerName && !isValidCustomer && "border-red-500"}
                ${isValidCustomer && "border-green-500 pr-8"}
              `}
            />

            {isValidCustomer && (
              <span className="absolute right-2 top-9 text-green-600 font-bold"></span>
            )}

            {customerName && !isValidCustomer && (
              <p className="text-xs text-red-500 mt-1">
                Informe pelo menos 3 caracteres.
              </p>
            )}
          </div>

          {/* ARMAZÉM */}
          <div>
            <Label>Armazém *</Label>
            <Select
              value={warehouseId?.toString()}
              onValueChange={(v) => setWarehouseId(Number(v))}
            >
              <SelectTrigger
                className={`${!warehouseId ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Selecione o armazém" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ITENS */}
          {items.map((item, i) => (
            <OrderItemCard
              key={i}
              index={i}
              item={item}
              products={products}
              warehouseId={warehouseId}
              itemTotal={item.quantity * item.price}
              updateItem={updateItem}
              removeItem={() => removeItem(i)}
            />
          ))}

          <Button variant="outline" onClick={addItem} className="w-full">
            + Adicionar Item
          </Button>

          {/* TOTAL */}
          <div className="text-right text-lg font-bold">
            Total do Pedido: R$ {grandTotal.toFixed(2)}
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>

            <Button
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
            >
              Criar Pedido
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
