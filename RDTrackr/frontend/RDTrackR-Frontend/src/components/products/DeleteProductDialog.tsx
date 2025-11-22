// src/components/items/DeleteProductDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResponseProductJson } from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ResponseProductJson;
  onDelete: () => Promise<void>;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onDelete,
}: Props) {
  async function handleDelete() {
    await onDelete();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Produto</DialogTitle>
        </DialogHeader>

        <p>
          Tem certeza que deseja excluir o produto{" "}
          <strong>{product.name}</strong>?
        </p>

        <DialogFooter>
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
