import { useEffect, useState } from "react";
import {
  Package,
  Warehouse,
  TrendingDown,
  Activity,
  ShoppingBag,
} from "lucide-react";

import { Link } from "react-router-dom";
import { KpiCard } from "@/components/dashboard/KpiCard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ResponseOverviewJson,
  ResponseProductJson,
  ResponseMovementJson,
} from "@/generated/apiClient";
import { api } from "@/lib/api";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function InventoryOverview() {
  const [overview, setOverview] = useState<ResponseOverviewJson | null>(null);
  const [lowStockItems, setLowStockItems] = useState<ResponseProductJson[]>([]);
  const [movementStats, setMovementStats] = useState<any[]>([]);

  useEffect(() => {
    api.overview().then(setOverview);
  }, []);

  api.productGET(1, 9999).then((result) => {
    const criticalList = (result.items ?? [])
      .filter((p) => p.totalStock < p.reorderPoint)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 5);

    setLowStockItems(criticalList);
  });

  useEffect(() => {
    api.movementGET().then((movements) => {
      const monthsPT = [
        "jan.",
        "fev.",
        "mar.",
        "abr.",
        "mai.",
        "jun.",
        "jul.",
        "ago.",
        "set.",
        "out.",
        "nov.",
        "dez.",
      ];

      // Inicializar todos os meses com 0
      const grouped = monthsPT.map((m) => ({
        month: m,
        inbound: 0,
        outbound: 0,
      }));

      movements.items?.forEach((m: ResponseMovementJson) => {
        const date = new Date(m.createdAt!);
        const monthIndex = date.getMonth();

        if (m.type === "INBOUND")
          grouped[monthIndex].inbound += m.quantity ?? 0;

        if (m.type === "OUTBOUND")
          grouped[monthIndex].outbound += Math.abs(m.quantity ?? 0);
      });

      setMovementStats(grouped);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Estoque – Visão Geral
        </h2>
        <p className="text-muted-foreground">
          Acompanhe métricas, movimentações e itens críticos do inventário.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Produtos Ativos"
          value={overview?.totalProducts ?? "--"}
          icon={Package}
          description="SKUs cadastrados"
        />
        <KpiCard
          title="Depósitos"
          value={overview?.totalWarehouses ?? "--"}
          icon={Warehouse}
          description="Locais de armazenamento"
        />
        <KpiCard
          title="Movimentações"
          value={overview?.totalMovements ?? "--"}
          icon={Activity}
          description="Entradas e saídas registradas"
        />
        <KpiCard
          title="Quantidade em Estoque"
          value={overview?.totalInventoryQuantity ?? "--"}
          icon={TrendingDown}
          description="Soma total de itens"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entradas vs Saídas</CardTitle>
          <CardDescription>Movimentações mensais</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={movementStats}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="inbound"
                name="Entradas"
                stroke="hsl(var(--chart-2))"
                fill="url(#colorInbound)"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="outbound"
                name="Saídas"
                stroke="hsl(var(--chart-3))"
                fill="url(#colorOutbound)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Itens com Estoque Baixo</CardTitle>
            <CardDescription>
              Produtos abaixo do ponto de reposição
            </CardDescription>
          </div>

          <Button asChild>
            <Link to="/inventory/purchase-orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Criar Pedido de Compra
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ponto de Reposição</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.totalStock}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Crítico</Badge>
                  </TableCell>
                </TableRow>
              ))}

              {lowStockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Sem itens críticos
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
