// ===============================
// TIPOS — embutidos no próprio arquivo
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
// TABELA
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
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Sugestão</TableHead>
            <TableHead>Preço</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                Carregando...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
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
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                        CRÍTICO
                      </span>
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
                    <input
                      type="number"
                      className={cn(
                        "w-20 input input-bordered text-center",
                        item.isCritical && "border-red-500 bg-red-50"
                      )}
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
