// src/components/orders/OrderViewDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ResponseOrderJson } from "@/generated/apiClient";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ResponseOrderJson | null;
}

export function OrderViewDialog({ open, onOpenChange, order }: Props) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>Número: {order.orderNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p>
              <b>Cliente:</b> {order.customerName}
            </p>
            <p>
              <b>Status:</b> {order.status}
            </p>
            <p>
              <b>Total:</b> R${order.total?.toFixed(2)}
            </p>
            <p>
              <b>Criado Em:</b> {order.createdOn?.toLocaleDateString("pt-BR")}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.price?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
