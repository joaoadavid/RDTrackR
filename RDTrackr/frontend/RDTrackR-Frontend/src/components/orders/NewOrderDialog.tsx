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

import { useToast } from "@/hooks/use-toast";
import { OrderItemCard } from "./OrderItemCard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewOrderDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<RequestCreateOrderItemJson[]>([]);

  const [nameError, setNameError] = useState(false);

  // Carrega produtos apenas uma vez
  useEffect(() => {
    api.productGET().then((res) => setProducts(res.items ?? []));
  }, []);

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

  const itemTotals = useMemo(
    () => items.map((i) => i.quantity * i.price),
    [items]
  );

  const grandTotal = useMemo(
    () => itemTotals.reduce((a, b) => a + b, 0),
    [itemTotals]
  );

  async function handleSubmit() {
    if (!customerName || customerName.trim().length < 3) {
      setNameError(true);
      return toast({
        title: "Nome inválido",
        description: "O nome do cliente deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
    }
    setNameError(false);

    if (items.length === 0) {
      return toast({
        title: "Nenhum item no pedido",
        description: "Adicione ao menos um item.",
        variant: "destructive",
      });
    }

    for (const item of items) {
      if (!item.productId) {
        return toast({
          title: "Produto obrigatório",
          description: "Selecione um produto antes de continuar.",
          variant: "destructive",
        });
      }

      if (item.quantity <= 0) {
        return toast({
          title: "Quantidade inválida",
          description: "A quantidade deve ser maior que zero.",
          variant: "destructive",
        });
      }

      if (item.price <= 0) {
        return toast({
          title: "Preço inválido",
          description: "O valor unitário deve ser maior que zero.",
          variant: "destructive",
        });
      }

      // 🔥 Validação de estoque aqui!
      const product = products.find((p) => p.id === item.productId);
      const available = product?.totalStock ?? 0;

      if (item.quantity > available) {
        return toast({
          title: "Estoque insuficiente",
          description: `O produto possui apenas ${available} unidade(s) disponíveis.`,
          variant: "destructive",
        });
      }
    }

    try {
      const payload = new RequestCreateOrderJson({
        customerName,
        items,
      });

      await api.ordersPOST(payload);

      toast({
        title: "Pedido criado!",
        description: "O pedido foi registrado com sucesso.",
      });

      onSuccess();
      onOpenChange(false);
      setCustomerName("");
      setItems([]);
    } catch (error: any) {
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
              className={nameError ? "border-red-500" : ""}
            />
          </div>

          {/* ITENS */}
          <div className="space-y-3 pb-2">
            <Label>Itens do Pedido</Label>

            {items.map((item, i) => (
              <OrderItemCard
                key={i}
                index={i}
                item={item}
                products={products}
                itemTotal={itemTotals[i]}
                updateItem={updateItem}
                removeItem={() =>
                  setItems((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}

            <Button variant="outline" onClick={addItem} className="w-full">
              + Adicionar Item
            </Button>
          </div>

          {/* TOTAL */}
          <div className="text-right text-lg font-bold pb-3">
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
