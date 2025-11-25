import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Eye, Check, X } from "lucide-react";

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

  // PAGINAÇÃO
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // FILTROS
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // DATA
  const [data, setData] =
    useState<ResponsePurchaseOrderJsonPagedResponse | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<ResponsePurchaseOrderJson | null>(null);

  // -------- LOAD FROM API (PAGINADO) --------
  const loadOrders = async () => {
    try {
      const result = await api.purchaseorderGET(
        page,
        pageSize,
        statusFilter,
        search
      );

      setData(result);
    } catch {
      toast({
        title: "Erro ao carregar pedidos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, pageSize, statusFilter, search]);

  // -------- UPDATE STATUS --------
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

  // -------- DELETE --------
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

      {/* MODALS */}
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie seus pedidos de compra
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* SEARCH */}
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

              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="RECEIVED">Recebido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TABLE */}
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
              {data?.items?.map((order) => {
                const total =
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
                          statusMap[order.status as keyof typeof statusMap]
                            .variant
                        }
                      >
                        {
                          statusMap[order.status as keyof typeof statusMap]
                            .label
                        }
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {order.items?.length ?? 0}
                    </TableCell>

                    <TableCell className="text-right">
                      R$
                      {total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("pt-BR")
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

              {/* EMPTY STATE */}
              {data?.items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>

            <span className="text-sm">
              Página {page} de {Math.ceil((data?.total ?? 0) / pageSize)}
            </span>

            <Button
              variant="outline"
              disabled={page * pageSize >= (data?.total ?? 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
