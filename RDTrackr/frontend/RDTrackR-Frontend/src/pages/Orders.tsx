import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Eye, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewOrderDialog } from "@/components/orders/NewOrderDialog";
import { OrderConfirmPaymentDialog } from "@/components/orders/OrderConfirmPaymentDialog";
import { OrderCancelDialog } from "@/components/orders/OrderCancelDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";

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
import { api } from "@/lib/api";
import { ResponseOrderJson } from "@/generated/apiClient";
import { useToast } from "@/hooks/use-toast";

const statusMap = {
  PENDING: { label: "Pendente", variant: "secondary" as const },
  PAID: { label: "Pago", variant: "default" as const },
  SHIPPED: { label: "Enviado", variant: "outline" as const },
  CANCELLED: { label: "Cancelado", variant: "destructive" as const },
};

export default function Orders() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<ResponseOrderJson[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Modais
  const [selectedOrder, setSelectedOrder] = useState<ResponseOrderJson | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // 🔥 Modal de Detalhes
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<ResponseOrderJson | null>(
    null
  );

  const loadOrders = async () => {
    try {
      const result = await api.ordersAll();
      setOrders(result);
    } catch {
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Criar pedido
  const handleCreateOrder = async (req: any) => {
    try {
      const created = await api.ordersPOST(req);
      setOrders((prev) => [...prev, created]);

      toast({
        title: "Pedido criado",
        description: "O pedido foi registrado com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao criar pedido",
        description: "Verifique os dados enviados.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Modal de criação */}
      <NewOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadOrders}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pedidos registrados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filtro */}
          <div className="mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          </div>

          {/* Tabela */}
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
              {filteredOrders.map((order) => (
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

                        {/* 🔥 Ver Detalhes */}
                        <DropdownMenuItem
                          onClick={() => {
                            setDetailsOrder(order);
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

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modais secundários */}
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

      {/* 🔥 Modal de Detalhes */}
      <OrderDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={detailsOrder}
      />
    </div>
  );
}
