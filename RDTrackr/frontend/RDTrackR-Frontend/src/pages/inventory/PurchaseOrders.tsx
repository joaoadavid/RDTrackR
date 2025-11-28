import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import {
  ResponsePurchaseOrderJson,
  ResponsePurchaseOrderJsonPagedResponse,
  RequestUpdatePurchaseOrderStatusJson,
} from "@/generated/apiClient";

import { NewPurchaseOrderDialog } from "@/components/purchase-orders/NewPurchaseOrderDialog";
import { PurchaseOrderDetailsDialog } from "@/components/purchase-orders/PurchaseOrderDetailsDialog";

const statusMap = {
  DRAFT: { label: "Rascunho", variant: "outline" as const },
  PENDING: { label: "Pendente", variant: "secondary" as const },
  APPROVED: { label: "Aprovado", variant: "default" as const },
  RECEIVED: { label: "Recebido", variant: "default" as const },
  CANCELLED: { label: "Cancelado", variant: "destructive" as const },
};

export default function PurchaseOrders() {
  const { toast } = useToast();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const [orders, setOrders] = useState<ResponsePurchaseOrderJson[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<ResponsePurchaseOrderJson | null>(null);

  async function loadOrders() {
    try {
      const result: ResponsePurchaseOrderJsonPagedResponse =
        await api.purchaseorderGET(
          page,
          pageSize,
          statusFilter === "all" ? undefined : statusFilter,
          search === "" ? undefined : search
        );

      setOrders(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar pedidos",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => {
    if (!isDialogOpen) {
      loadOrders();
    }
  }, [isDialogOpen]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const dto = RequestUpdatePurchaseOrderStatusJson.fromJS({
        status: newStatus,
      });

      await api.status2(id, dto);
      loadOrders();
    } catch {
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.purchaseorderDELETE(id);
      loadOrders();
    } catch {
      toast({
        title: "Erro ao deletar pedido",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Pedidos de Compra
          </h2>
          <p className="text-muted-foreground">
            Gerencie pedidos feitos aos fornecedores
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
      </div>

      {/* DIALOGS */}
      <NewPurchaseOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={() => loadOrders()}
      />

      <PurchaseOrderDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* LIST TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie seus pedidos de compra
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* FILTER BAR */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Buscar por número ou fornecedor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-[300px]"
            />

            {/* STATUS FILTER */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent data-testid="status-filter-menu">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="RECEIVED">Recebido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Itens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / página</SelectItem>
                <SelectItem value="25">25 / página</SelectItem>
                <SelectItem value="50">50 / página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => {
                const totalCalc =
                  order.items?.reduce(
                    (acc, item) =>
                      acc + (item.unitPrice ?? 0) * (item.quantity ?? 0),
                    0
                  ) ?? 0;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.number}
                    </TableCell>
                    <TableCell>{order.supplierName}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          statusMap[order.status! as keyof typeof statusMap]
                            .variant
                        }
                      >
                        {
                          statusMap[order.status! as keyof typeof statusMap]
                            .label
                        }
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {order.items?.length ?? 0}
                    </TableCell>

                    <TableCell className="text-right">
                      R$
                      {totalCalc.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell>
                      {order.createdOn
                        ? new Date(order.createdOn).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>

                          {(order.status === "DRAFT" ||
                            order.status === "PENDING") && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleUpdateStatus(order.id!, "CANCELLED")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}

                          {order.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(order.id!, "RECEIVED")
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Receber
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(order.id!)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
