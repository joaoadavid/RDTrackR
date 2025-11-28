import { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Check,
  X,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import {
  ResponseOrderJson,
  ResponseOrderJsonPagedResponse,
} from "@/generated/apiClient";

import { NewOrderDialog } from "@/components/orders/NewOrderDialog";
import { OrderConfirmPaymentDialog } from "@/components/orders/OrderConfirmPaymentDialog";
import { OrderCancelDialog } from "@/components/orders/OrderCancelDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";

const statusMap = {
  PENDING: { label: "Pendente", variant: "secondary" as const },
  PAID: { label: "Pago", variant: "default" as const },
  SHIPPED: { label: "Enviado", variant: "outline" as const },
  CANCELLED: { label: "Cancelado", variant: "destructive" as const },
};

export default function Orders() {
  const { toast } = useToast();

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Data
  const [orders, setOrders] = useState<ResponseOrderJson[]>([]);

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<ResponseOrderJson | null>(
    null
  );

  async function loadOrders() {
    try {
      const result: ResponseOrderJsonPagedResponse = await api.ordersGET(
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
        description: "Não foi possível obter os dados do servidor.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => {
    if (!isDialogOpen) loadOrders();
  }, [isDialogOpen]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">Gerencie pedidos de clientes</p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      {/* MODALS */}
      <NewOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => loadOrders()}
      />

      <OrderConfirmPaymentDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        order={selectedOrder}
        onSuccess={loadOrders}
      />

      <OrderCancelDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        order={selectedOrder}
        onSuccess={loadOrders}
      />

      <OrderDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
      />

      {/* LISTA */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pedidos registrados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* FILTER BAR */}
          <div className="mb-4 flex gap-4 items-center">
            <Input
              placeholder="Buscar por número ou cliente..."
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
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="SHIPPED">Enviado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* PAGE SIZE */}
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

          {/* TABLE */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>

                  <TableCell>
                    <Badge variant={statusMap[order.status!].variant}>
                      {statusMap[order.status!].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {order.items?.length ?? 0}
                  </TableCell>

                  <TableCell className="text-right">
                    R$
                    {order.total?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>

                  <TableCell>
                    {order.createdOn
                      ? new Date(order.createdOn).toLocaleDateString("pt-BR")
                      : "--"}
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

                        {order.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsConfirmOpen(true);
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Marcar como Pago
                          </DropdownMenuItem>
                        )}

                        {order.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsCancelOpen(true);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
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
