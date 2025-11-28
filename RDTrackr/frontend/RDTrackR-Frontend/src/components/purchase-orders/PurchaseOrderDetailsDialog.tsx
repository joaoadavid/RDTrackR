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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  if (!order) return null;

  const formattedDate = order.createdOn
    ? format(order.createdOn, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "—";

  const total =
    order.items?.reduce(
      (acc, item) => acc + (item.unitPrice ?? 0) * (item.quantity ?? 0),
      0
    ) ?? 0;

  const statusMap: Record<string, string> = {
    CANCELLED: "Cancelado",
    PENDING: "Pendente",
    DRAFT: "Rascunho",
    APPROVED: "Aprovado",
    RECEIVED: "Recebido",
  };

  function renderActions() {
    const status = order.status;

    async function updateAndClose(newStatus: string) {
      await onUpdateStatus(order.id!, newStatus);
      onOpenChange(false); // FECHAR AUTOMATICAMENTE
    }

    return (
      <div className="space-y-2 mt-4">
        {status === "DRAFT" && (
          <>
            <Button
              className="w-full"
              onClick={() => updateAndClose("PENDING")}
            >
              Enviar para Aprovação
            </Button>

            <Button
              className="w-full"
              variant="destructive"
              onClick={() => updateAndClose("CANCELLED")}
            >
              Cancelar Pedido
            </Button>
          </>
        )}

        {status === "PENDING" && (
          <>
            <Button
              className="w-full"
              onClick={() => updateAndClose("APPROVED")}
            >
              Aprovar Pedido
            </Button>

            <Button
              className="w-full"
              variant="destructive"
              onClick={() => updateAndClose("CANCELLED")}
            >
              Cancelar Pedido
            </Button>
          </>
        )}

        {status === "APPROVED" && (
          <Button className="w-full" onClick={() => updateAndClose("RECEIVED")}>
            Marcar como Recebido
          </Button>
        )}

        {(status === "CANCELLED" || status === "RECEIVED") && (
          <p className="text-sm text-muted-foreground text-center">
            Este pedido já foi finalizado.
          </p>
        )}
      </div>
    );
  }

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
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>

                        <TableCell className="text-right">
                          R${" "}
                          {(
                            (item.quantity ?? 0) * (item.unitPrice ?? 0)
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
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

          {/* 💰 Total */}
          <div className="flex justify-end mt-4">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  R${" "}
                  {total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* 🟦 Ações de Status */}
          {renderActions()}
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
