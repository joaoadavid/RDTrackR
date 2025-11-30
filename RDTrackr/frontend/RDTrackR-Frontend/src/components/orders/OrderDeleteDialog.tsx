import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseOrderJson } from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ResponseOrderJson | null;
  onSuccess: () => void;
}

export function OrderDeleteDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: Props) {
  const { toast } = useToast();

  async function handleDelete() {
    if (!order) return;

    try {
      await api.ordersDELETE(order.id); // <-- AQUI USA SUA ROTA
      toast({
        title: "Pedido removido",
        description: `Pedido #${order.orderNumber} excluído com sucesso.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o pedido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Pedido</DialogTitle>
        </DialogHeader>

        <p>
          Tem certeza que deseja excluir o pedido{" "}
          <strong>#{order?.orderNumber}</strong>? Esta ação não pode ser
          desfeita.
        </p>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
