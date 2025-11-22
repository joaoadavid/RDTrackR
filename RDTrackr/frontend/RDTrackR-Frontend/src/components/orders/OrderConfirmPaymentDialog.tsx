// src/components/orders/OrderConfirmPaymentDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  ResponseOrderJson,
  RequestUpdateOrderStatusJson,
} from "@/generated/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ResponseOrderJson | null;
  onSuccess: () => Promise<void>;
}

export function OrderConfirmPaymentDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: Props) {
  const { toast } = useToast();

  if (!order) return null;

  async function handleConfirm() {
    try {
      const dto = new RequestUpdateOrderStatusJson({
        status: "PAID",
      });

      await api.status(order.id!, dto);

      toast({
        title: "Pagamento confirmado",
        description: `Pedido ${order.orderNumber} agora está como PAGO.`,
      });

      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
          <DialogDescription>
            Ao confirmar pagamento, o sistema irá baixar o estoque
            automaticamente criando uma movimentação <strong>OUTBOUND</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="default">
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
