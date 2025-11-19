import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  DollarSign,
  RefreshCw,
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
import { ControlsBar } from "@/components/inventory/ControlsBar";
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
} from "@/generated/apiClient";

export default function Replenishment() {
  const { toast } = useToast();

  // parâmetros
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [window, setWindow] = useState(60);
  const [seasonality, setSeasonality] = useState(0);
  const [coverageDays, setCoverageDays] = useState(0);

  // seleção e edição
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editedQty, setEditedQty] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // dados da API
  const [apiItems, setApiItems] = useState<ResponseReplenishmentItemJson[]>([]);

  // ----------- LOAD API -------------------
  useEffect(() => {
    api
      .replenishment()
      .then((response) => setApiItems(response))
      .catch(() =>
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível obter os itens de reposição.",
          variant: "destructive",
        })
      );
  }, []);

  // ----------- MAP API → FRONT ITEMS -------------------
  const replenishmentItems: ReplenishmentItem[] = useMemo(() => {
    return apiItems.map((i) => ({
      id: i.productId!.toString(),
      sku: i.sku ?? "",
      name: i.name ?? "",
      category: i.category ?? "",
      uom: i.uom ?? "",
      currentStock: i.currentStock ?? 0,
      reorderPoint: i.reorderPoint ?? 0,
      dailyConsumption: i.dailyConsumption ?? 0,

      // 👇 Ajuste importante
      leadTime: i.leadTimeDays ?? 0,

      suggestedQty: editedQty[i.productId!] ?? i.suggestedQty ?? 0,
      isCritical: i.isCritical ?? false,
      unitPrice: i.unitPrice ?? 0,
    }));
  }, [apiItems, editedQty]);

  // ----------- FILTROS -------------------
  const filteredItems = useMemo(() => {
    return replenishmentItems.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = category === "all" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [replenishmentItems, searchTerm, category]);

  // ----------- KPIs -------------------
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

  // ----------- HANDLERS -------------------
  const handleRecalculate = () => {
    toast({
      title: "Recalculado",
      description: "Os valores foram atualizados.",
    });
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
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

  const handleConfirmPo = async (
    supplierId: string,
    notes: string,
    groupBySupplier: boolean
  ) => {
    try {
      const selectedItems = filteredItems.filter((i) => selectedIds.has(i.id));

      const dto = RequestGeneratePoFromReplenishmentJson.fromJS({
        supplierId: Number(supplierId),
        notes,
        groupBySupplier,
        items: selectedItems.map((i) => ({
          productId: Number(i.id),
          quantity: i.suggestedQty,
          unitPrice: i.unitPrice,
        })),
      });

      await api.generatePo(dto);

      toast({
        title: "Pedido criado",
        description: `${selectedItems.length} item(ns) foram enviados para gerar um novo pedido de compra.`,
      });

      setIsDialogOpen(false);
      setSelectedIds(new Set());
    } catch {
      toast({
        title: "Erro ao gerar pedido",
        description: "Ocorreu um problema ao criar o pedido de compra.",
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
            Planejamento de Reposição
          </h2>
          <p className="text-muted-foreground">
            Sugestões baseadas em consumo, estoque atual e lead time.
          </p>
        </div>
        <Button variant="outline" onClick={handleRecalculate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recalcular
        </Button>
      </div>

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

      {/* CONTROLS */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Simulação</CardTitle>
          <CardDescription>Ajuste filtros e parâmetros</CardDescription>
        </CardHeader>
        <CardContent>
          <ControlsBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            category={category}
            onCategoryChange={setCategory}
            window={window}
            onWindowChange={setWindow}
            seasonality={seasonality}
            onSeasonalityChange={setSeasonality}
            coverageDays={coverageDays}
            onCoverageDaysChange={setCoverageDays}
            onRecalculate={handleRecalculate}
          />
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Itens de Reposição</CardTitle>
          <CardDescription>
            Produtos com cálculo automático de ponto de pedido
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
          />
        </CardContent>
      </Card>

      {/* ACTION BUTTON */}
      {selectedIds.size > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleGeneratePo} size="lg">
            Gerar Pedido ({selectedIds.size} item
            {selectedIds.size !== 1 ? "s" : ""})
          </Button>
        </div>
      )}

      {/* DIALOG */}
      <GeneratePoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        items={filteredItems.filter((i) => selectedIds.has(i.id))}
        onConfirm={handleConfirmPo}
      />
    </div>
  );
}
