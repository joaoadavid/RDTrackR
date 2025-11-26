import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
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
  RequestCreateOrderJson,
  RequestCreateOrderItemJson,
  ResponseProductJson,
} from "@/generated/apiClient";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewOrderDialog({ open, onOpenChange, onSuccess }: Props) {
  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<RequestCreateOrderItemJson[]>([]);

  api.productGET().then((res) => setProducts(res.items ?? []));

  function addItem() {
    setItems((prev) => [
      ...prev,
      new RequestCreateOrderItemJson({
        productId: 0,
        price: 0,
        quantity: 1,
      }),
    ]);
  }

  function updateItem(index: number, field: string, value: any) {
    const clone = [...items];
    (clone[index] as any)[field] = value;
    setItems(clone);
  }

  // 🔢 CALCULO SUBTOTAL POR ITEM
  const itemTotals = useMemo(
    () => items.map((i) => i.quantity * i.price),
    [items]
  );

  // 💰 TOTAL GERAL
  const grandTotal = useMemo(
    () => itemTotals.reduce((acc, t) => acc + t, 0),
    [itemTotals]
  );

  async function handleSubmit() {
    const payload = new RequestCreateOrderJson({
      customerName,
      items,
    });

    await api.ordersPOST(payload);
    onSuccess();
    onOpenChange(false);

    // reset
    setCustomerName("");
    setItems([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente e os itens do pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CLIENTE */}
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* ITENS */}
          <div className="space-y-3">
            <Label>Itens do Pedido</Label>

            {items.map((item, i) => (
              <div
                key={i}
                className="border rounded-md p-3 space-y-3 bg-muted/20"
              >
                {/* PRODUTO */}
                <div>
                  <Label>Produto</Label>
                  <Select
                    value={String(item.productId)}
                    onValueChange={(v) => updateItem(i, "productId", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>

                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} — R$ {p.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* GRID QTD + PREÇO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <Label>Preço Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(i, "price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="text-right text-sm text-muted-foreground">
                  Subtotal: <strong>R$ {itemTotals[i].toFixed(2)}</strong>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem} className="w-full">
              + Adicionar Item
            </Button>
          </div>

          {/* TOTAL GERAL */}
          <div className="text-right text-lg font-bold">
            Total do Pedido: R$ {grandTotal.toFixed(2)}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Criar Pedido</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
