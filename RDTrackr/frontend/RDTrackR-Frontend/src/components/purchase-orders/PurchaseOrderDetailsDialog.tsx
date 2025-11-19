import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  ResponsePurchaseOrderJson,
  ResponsePurchaseOrderItemJson,
} from "@/generated/apiClient";

// 🎯 INTERFACE CORRETA
export interface PurchaseOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ResponsePurchaseOrderJson | null;
  onUpdateStatus: (id: number, newStatus: string) => void | Promise<void>;
}

export function PurchaseOrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onUpdateStatus,
}: PurchaseOrderDetailsDialogProps) {
  if (!order) return null;

  const formattedDate = order.createdAt
    ? format(order.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "—";

  // 💰 Cálculo com itens REAIS
  const subtotal =
    order.items?.reduce(
      (acc, item) => acc + (item.unitPrice ?? 0) * (item.quantity ?? 0),
      0
    ) ?? 0;

  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const statusMap: Record<string, string> = {
    CANCELLED: "Cancelado",
    PENDING: "Pendente",
    DRAFT: "Rascunho",
    APPROVED: "Aprovado",
    RECEIVED: "Recebido",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle data-testid="details-title">
            Detalhes do Pedido
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o pedido selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* 📋 Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número do Pedido</p>
              <p className="font-semibold">{order.number}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Fornecedor</p>
              <p className="font-semibold">{order.supplierName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={
                  order.status === "CANCELLED"
                    ? "destructive"
                    : order.status === "PENDING"
                    ? "secondary"
                    : order.status === "DRAFT"
                    ? "outline"
                    : "default"
                }
              >
                {statusMap[order.status ?? ""] ?? order.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* 🧾 Itens */}
          <div>
            <p className="text-sm font-semibold mb-2">Itens do Pedido</p>

            {order.items && order.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Preço Unitário</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.items.map(
                    (item: ResponsePurchaseOrderItemJson, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.productName}</TableCell>

                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>

                        <TableCell className="text-right">
                          R${" "}
                          {(item.unitPrice ?? 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>

                        <TableCell className="text-right">
                          R${" "}
                          {(
                            (item.quantity ?? 0) * (item.unitPrice ?? 0)
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum item cadastrado.
              </p>
            )}
          </div>

          {/* 💰 Totais */}
          <div className="flex justify-end mt-4">
            <div className="w-1/2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  R${" "}
                  {subtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Impostos (12%)
                </span>
                <span className="font-medium">
                  R${" "}
                  {taxes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  R${" "}
                  {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default PurchaseOrderDetailsDialog;
