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
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<
    ResponseSupplierProductJson[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");

  const [items, setItems] = useState([
    { productId: 0, quantity: 1, unitPrice: 0 },
  ]);

  // 👉 Carregar fornecedores
  useEffect(() => {
    api.supplierAll().then(setSuppliers);
  }, []);

  // 👉 Carregar produtos do fornecedor
  useEffect(() => {
    if (!supplierId) return;

    // reset itens ao trocar fornecedor
    setItems([{ productId: 0, quantity: 1, unitPrice: 0 }]);

    api
      .productsAll(supplierId)
      .then((resp) => setSupplierProducts(resp))
      .catch(() =>
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos do fornecedor.",
          variant: "destructive",
        })
      );
  }, [supplierId]);

  function updateItem(index: number, field: string, value: any) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: 0, quantity: 1, unitPrice: 0 }]);
  }

  function handleProductSelect(index: number, productId: number) {
    const p = supplierProducts.find((x) => x.productId === productId);

    updateItem(index, "productId", productId);
    updateItem(index, "unitPrice", p?.unitPrice ?? 0);
  }

  // 👉 TOTAL por ITEM
  const itemTotals = useMemo(
    () => items.map((i) => i.quantity * i.unitPrice),
    [items]
  );

  // 👉 TOTAL GERAL
  const grandTotal = useMemo(
    () => itemTotals.reduce((sum, t) => sum + t, 0),
    [itemTotals]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!supplierId) return;

    setIsSubmitting(true);

    try {
      const dto = RequestCreatePurchaseOrderJson.fromJS({
        supplierId,
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

      // resetar form
      setSupplierId(null);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Pedido de Compra</DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor e dos itens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número do Pedido */}
          <div>
            <Label>Número do Pedido</Label>
            <Input
              placeholder="EX: PO-2025-001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>

          {/* FORNECEDOR */}
          <div>
            <Label>Fornecedor</Label>
            <Select
              value={supplierId?.toString()}
              onValueChange={(v) => setSupplierId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
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

          {/* ITENS */}
          <div className="space-y-3">
            <Label>Itens do Pedido</Label>

            {items.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded-md space-y-2 bg-muted/20"
              >
                {/* PRODUTO */}
                <Select
                  value={item.productId ? item.productId.toString() : ""}
                  onValueChange={(v) => handleProductSelect(index, Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Produto" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierProducts.map((p) => (
                      <SelectItem
                        key={p.productId}
                        value={p.productId!.toString()}
                      >
                        {p.productName} — R$ {p.unitPrice?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* QTD E PREÇO */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Preço Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="text-sm text-muted-foreground">
                  Subtotal: <strong>R$ {itemTotals[index].toFixed(2)}</strong>
                </div>
              </div>
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

          {/* TOTAL GERAL */}
          <div className="text-right text-lg font-bold mt-2">
            Total do Pedido: R$ {grandTotal.toFixed(2)}
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
