import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { ResponseOrderJson } from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: ResponseOrderJson | null;
}

export function OrderDetailsDialog({ open, onOpenChange, order }: Props) {
  if (!order) return null;

  const total =
    order.items?.reduce(
      (sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0),
      0
    ) ?? 0;

  // 🎨 Controle centralizado de variantes por status
  const statusVariant =
    order.status === "CANCELLED"
      ? "destructive"
      : order.status === "PENDING"
      ? "secondary"
      : "default"; // Azul para PAID, SHIPPED

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Cliente:</strong> {order.customerName}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <Badge variant={statusVariant}>{order.status}</Badge>
            </p>

            <p>
              <strong>Data:</strong>{" "}
              {order.createdOn
                ? new Date(order.createdOn).toLocaleString("pt-BR")
                : "--"}
            </p>

            <p>
              <strong>Total:</strong> R$
              {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {order.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      R$
                      {item.price?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      R$
                      {(item.quantity! * item.price!).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end text-lg font-semibold pr-2">
            Total: R$
            {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
