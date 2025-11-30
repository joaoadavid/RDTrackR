import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResponseWarehouseJson } from "@/generated/apiClient";

interface DeleteWarehouseDialogProps {
  open: boolean;
  warehouse: ResponseWarehouseJson | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteWarehouseDialog({
  open,
  warehouse,
  onCancel,
  onConfirm,
}: DeleteWarehouseDialogProps) {
  if (!warehouse) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // quando o modal FECHAR -> chama cancel
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Depósito</DialogTitle>

          <DialogDescription>
            Tem certeza que deseja excluir o depósito{" "}
            <strong>{warehouse.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
