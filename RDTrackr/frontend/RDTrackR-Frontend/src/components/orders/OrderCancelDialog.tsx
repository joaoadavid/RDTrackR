// src/components/orders/OrderCancelDialog.tsx
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

export function OrderCancelDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: Props) {
  const { toast } = useToast();

  if (!order) return null;

  async function handleCancel() {
    try {
      const dto = new RequestUpdateOrderStatusJson({
        status: "CANCELLED",
      });

      await api.status(order.id!, dto);

      toast({
        title: "Pedido cancelado",
        description:
          order.status === "PAID"
            ? "O estoque foi estornado automaticamente."
            : "O pedido foi cancelado.",
      });

      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao cancelar pedido",
        description: "Não foi possível cancelar o pedido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>Cancelar Pedido</DialogTitle>
          <DialogDescription>
            {order.status === "PAID" ? (
              <>
                Este pedido já foi <strong>PAGO</strong>.<br />
                Ao cancelar, o estoque será{" "}
                <strong>estornado automaticamente</strong>.
              </>
            ) : (
              "Tem certeza que deseja cancelar este pedido?"
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>

          <Button variant="destructive" onClick={handleCancel}>
            Cancelar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
