// ===============================
// TIPOS
// ===============================
export interface ReplenishmentItem {
  id: string;
  productId: number;
  warehouseId: number;
  warehouseName: string;

  sku: string;
  name: string;
  category: string;
  uom: string;

  currentStock: number;
  reorderPoint: number;
  dailyConsumption: number;
  leadTime: number;

  suggestedQty: number;

  isCritical: boolean;
  unitPrice: number;
}

// ===============================
// COMPONENTES
// ===============================

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ReplenishmentTableProps {
  items: ReplenishmentItem[];
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  onToggleAll: () => void;
  onSelectCritical: () => void;
  onQtyChange: (id: string, qty: number) => void;
  isLoading?: boolean;
}

export function ReplenishmentTable({
  items,
  selectedIds,
  onToggleItem,
  onToggleAll,
  onSelectCritical,
  onQtyChange,
  isLoading,
}: ReplenishmentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        {/* HEADER */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={onToggleAll}
              />
            </TableHead>

            <TableHead>SKU</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Categorias</TableHead>
            <TableHead>Depósitos</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Reposição</TableHead>
            <TableHead>Criticidade</TableHead>
            <TableHead>Sugestões</TableHead>
            <TableHead>Preços</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6">
                Carregando...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6">
                Nenhum item encontrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const isSelected = selectedIds.has(item.id);

              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "transition",
                    item.isCritical &&
                      "bg-red-50 hover:bg-red-100 border-l-4 border-red-600"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleItem(item.id)}
                    />
                  </TableCell>

                  <TableCell>{item.sku}</TableCell>

                  <TableCell className="font-medium flex items-center gap-2">
                    {item.name}
                    {item.isCritical && (
                      <Badge className="bg-red-600 text-white">Crítico</Badge>
                    )}
                  </TableCell>

                  <TableCell>{item.category}</TableCell>

                  <TableCell>{item.warehouseName}</TableCell>

                  <TableCell
                    className={cn(item.isCritical && "text-red-700 font-bold")}
                  >
                    {item.currentStock}
                  </TableCell>

                  <TableCell
                    className={cn(item.isCritical && "text-red-700 font-bold")}
                  >
                    {item.reorderPoint}
                  </TableCell>

                  <TableCell>
                    {item.isCritical ? (
                      <Badge variant="destructive">Crítico</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <input
                      type="number"
                      className={cn(
                        "w-20 border rounded text-center py-1",
                        item.isCritical &&
                          "border-red-500 bg-red-50 text-red-700"
                      )}
                      min={0}
                      value={item.suggestedQty}
                      onChange={(e) =>
                        onQtyChange(item.id, Number(e.target.value))
                      }
                    />
                  </TableCell>

                  <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
