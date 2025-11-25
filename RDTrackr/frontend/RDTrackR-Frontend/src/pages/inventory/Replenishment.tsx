// src/pages/inventory/Replenishment.tsx
import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { KpiCard } from "@/components/inventory/KpiCard";
import {
  ReplenishmentTable,
  ReplenishmentItem,
} from "@/components/inventory/ReplenishmentTable";
import { GeneratePoDialog } from "@/components/inventory/GeneratePoDialog";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import {
  ResponseReplenishmentItemJson,
  RequestGeneratePoFromReplenishmentJson,
  ResponseReplenishmentItemJsonPagedResponse,
} from "@/generated/apiClient";

type CriticalFilter = "all" | "critical" | "non_critical";

export default function Replenishment() {
  const { toast } = useToast();

  // ----------------- filtros -----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [criticalFilter, setCriticalFilter] = useState<CriticalFilter>("all");

  // ----------------- paginação -----------------
  const [page, setPage] = useState(1);
  const pageSize = 10; // ajuste se quiser
  const [total, setTotal] = useState(0);

  // ----------------- seleção e edição -----------------
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editedQty, setEditedQty] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ----------------- loading states -----------------
  const [apiItems, setApiItems] = useState<ResponseReplenishmentItemJson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------- debounce busca -----------------
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ----------------- LOAD API (server-side pagination + search) -----------------
  async function load() {
    setIsLoading(true);

    try {
      const resp: ResponseReplenishmentItemJsonPagedResponse =
        await api.replenishment(page, pageSize, debouncedSearch);

      setApiItems(resp.items ?? []);
      setTotal(resp.total ?? 0);

      // limpa seleção/edição ao trocar de página/resultado
      setSelectedIds(new Set());
      setEditedQty({});
    } catch {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os itens de reposição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  // ----------------- MAP API → FRONT ITEMS -----------------
  const replenishmentItems: ReplenishmentItem[] = useMemo(() => {
    return apiItems.map((i) => {
      const compoundId = `${i.productId}-${i.warehouseId}`;

      return {
        id: compoundId,
        productId: i.productId!,
        warehouseId: i.warehouseId!,
        warehouseName: i.warehouseName ?? "",
        sku: i.sku ?? "",
        name: i.name ?? "",
        category: i.category ?? "",
        uom: i.uom ?? "",
        currentStock: i.currentStock ?? 0,
        reorderPoint: i.reorderPoint ?? 0,
        dailyConsumption: i.dailyConsumption ?? 0,
        leadTime: i.leadTimeDays ?? 0,
        suggestedQty: editedQty[compoundId] ?? i.suggestedQty ?? 0,
        isCritical: i.isCritical ?? false,
        unitPrice: i.unitPrice ?? 0,
      };
    });
  }, [apiItems, editedQty]);

  // ----------------- FILTROS (client-side dentro da página atual) -----------------
  const filteredItems = useMemo(() => {
    return replenishmentItems.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;

      const matchesCrit =
        criticalFilter === "all" ||
        (criticalFilter === "critical" && item.isCritical) ||
        (criticalFilter === "non_critical" && !item.isCritical);

      return matchesCategory && matchesCrit;
    });
  }, [replenishmentItems, category, criticalFilter]);

  // ----------------- KPIs (baseados nos itens filtrados da página atual) -----------------
  const kpis = useMemo(() => {
    const criticalCount = filteredItems.filter((i) => i.isCritical).length;

    const totalStock = filteredItems.reduce(
      (sum, i) => sum + i.currentStock,
      0
    );

    const totalDailyConsumption = filteredItems.reduce(
      (sum, i) => sum + i.dailyConsumption,
      0
    );

    const estimatedValue = filteredItems.reduce(
      (sum, i) => sum + i.suggestedQty * i.unitPrice,
      0
    );

    return {
      criticalCount,
      totalStock,
      totalDailyConsumption,
      estimatedValue,
    };
  }, [filteredItems]);

  // ----------------- handlers seleção -----------------
  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    const idsOnScreen = filteredItems.map((i) => i.id);
    if (selectedIds.size === idsOnScreen.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(idsOnScreen));
    }
  };

  const handleSelectCritical = () => {
    const criticalIds = filteredItems
      .filter((i) => i.isCritical)
      .map((i) => i.id);
    setSelectedIds(new Set(criticalIds));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setEditedQty((prev) => ({ ...prev, [id]: qty }));
  };

  const handleGeneratePo = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione ao menos um item.",
        variant: "destructive",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  // ----------------- CONFIRMAR GERAR PO -----------------
  const handleConfirmPo = async (
    supplierId: string,
    warehouseId: number,
    notes: string,
    groupBySupplier: boolean
  ) => {
    setIsSubmitting(true);

    const selectedItems = filteredItems.filter((i) => selectedIds.has(i.id));

    const dto = RequestGeneratePoFromReplenishmentJson.fromJS({
      supplierId: Number(supplierId),
      warehouseId,
      notes,
      groupBySupplier,
      items: selectedItems.map((i) => ({
        productId: i.productId,
        quantity: i.suggestedQty,
        unitPrice: i.unitPrice,
      })),
    });

    try {
      await api.generatePo(dto);

      toast({
        title: "Pedido criado!",
        description: `${selectedItems.length} item(ns) incluídos.`,
      });

      setIsDialogOpen(false);
      setSelectedIds(new Set());
      load(); // recarrega a página atual
    } catch (err: any) {
      toast({
        title: "Erro ao gerar pedido",
        description: err?.response?.data ?? "Erro desconhecido ao gerar PO.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ----------------- render -----------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Planejamento de Reposição
          </h2>
          <p className="text-muted-foreground">
            Sugestões baseadas em consumo, estoque atual e lead time.
          </p>
        </div>

        <Button variant="outline" disabled={isLoading} onClick={() => load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recalcular
        </Button>
      </div>

      {/* FILTROS */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque por nome/SKU e filtre criticidade ou categoria.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* Busca */}
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="border rounded px-3 py-2 w-full md:w-72"
            />

            {/* Criticidade */}
            <select
              value={criticalFilter}
              onChange={(e) =>
                setCriticalFilter(e.target.value as CriticalFilter)
              }
              className="border rounded px-3 py-2 w-full md:w-56"
            >
              <option value="all">Todos</option>
              <option value="critical">Somente críticos</option>
              <option value="non_critical">Somente não críticos</option>
            </select>

            {/* Categoria */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-56"
            >
              <option value="all">Todas categorias</option>
              {/* Se quiser popular dinamicamente com base nos itens: */}
              {Array.from(new Set(replenishmentItems.map((i) => i.category)))
                .filter((c) => c && c !== "all")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Itens críticos"
          value={kpis.criticalCount}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Estoque total"
          value={kpis.totalStock.toFixed(0)}
          icon={Package}
        />
        <KpiCard
          title="Consumo diário"
          value={kpis.totalDailyConsumption.toFixed(1)}
          icon={TrendingDown}
        />
        <KpiCard
          title="Valor estimado"
          value={`R$ ${kpis.estimatedValue.toFixed(2)}`}
          icon={DollarSign}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Itens de Reposição</CardTitle>
          <CardDescription>
            Produtos com cálculo automático. Selecione para gerar PO.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ReplenishmentTable
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleItem={handleToggleItem}
            onToggleAll={handleToggleAll}
            onSelectCritical={handleSelectCritical}
            onQtyChange={handleQtyChange}
            isLoading={isLoading}
          />

          {/* PAGINAÇÃO */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages} — {total} itens
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO GERAR PO */}
      {selectedIds.size > 0 && (
        <div className="flex justify-end">
          <Button size="lg" disabled={isSubmitting} onClick={handleGeneratePo}>
            {isSubmitting ? "Gerando..." : `Gerar Pedido (${selectedIds.size})`}
          </Button>
        </div>
      )}

      {/* DIALOG */}
      <GeneratePoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        items={filteredItems.filter((i) => selectedIds.has(i.id))}
        onConfirm={handleConfirmPo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
