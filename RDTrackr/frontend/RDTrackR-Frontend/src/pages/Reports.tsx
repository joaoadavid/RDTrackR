import { useEffect, useState, useMemo, Fragment } from "react";
import { TrendingDown, Package, DollarSign, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import {
  ResponseReportsJson,
  ResponseRecentPurchaseOrderJson,
} from "@/generated/apiClient";

export default function Reports() {
  const { toast } = useToast();

  const [data, setData] = useState<ResponseReportsJson | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // 🔥 Buscar dados reais da API
  // =========================
  async function loadReports() {
    setLoading(true);
    try {
      const result = await api.reports();
      setData(result);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  // =========================
  // 🔢 KPIs calculados pelo backend
  // =========================
  const kpis = useMemo(() => {
    if (!data) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
      };
    }

    return {
      totalOrders: data.totalPurchaseOrders ?? 0,
      totalRevenue: data.totalValuePurchased ?? 0,
      pendingOrders: data.pendingPurchaseOrders ?? 0,
      cancelledOrders: 0, // Caso sua API passe a retornar, troque aqui
    };
  }, [data]);

  // =========================
  // 🔠 Status dos pedidos recentes
  // (expanda conforme seu domínio real)
  // =========================
  const statusMap: Record<string, { label: string; variant: any }> = {
    PAID: { label: "Pago", variant: "default" },
    PENDING: { label: "Pendente", variant: "secondary" },
    SHIPPED: { label: "Enviado", variant: "outline" },
    CANCELLED: { label: "Cancelado", variant: "destructive" },
    APPROVED: { label: "Aprovado", variant: "default" },
    DRAFT: { label: "Rascunho", variant: "outline" },
    IN_REVIEW: { label: "Revisão", variant: "secondary" },
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Análises de compras e desempenho geral
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pedidos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalOrders}</div>
            <p className="text-xs text-muted-foreground">no sistema</p>
          </CardContent>
        </Card>

        {/* Valor total comprado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total Comprado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {kpis.totalRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              em compras realizadas
            </p>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              aguardando aprovação
            </p>
          </CardContent>
        </Card>

        {/* Cancelados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.cancelledOrders}</div>
            <p className="text-xs text-muted-foreground">últimos registros</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabela de pedidos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Últimos pedidos registrados no sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading */}
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}

              {/* Dados reais */}
              {!loading &&
                data?.recentOrders?.map(
                  (order: ResponseRecentPurchaseOrderJson, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {order.supplierName}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            statusMap[order.status!]?.variant || "secondary"
                          }
                        >
                          {statusMap[order.status!]?.label || order.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        R${" "}
                        {order.total?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "pt-BR"
                            )
                          : ""}
                      </TableCell>
                    </TableRow>
                  )
                )}

              {/* Sem registros */}
              {!loading &&
                (!data?.recentOrders || data.recentOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
