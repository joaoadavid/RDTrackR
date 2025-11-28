import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ItemCardProps {
  index: number;
  item: any;
  supplierProducts: any[];
  itemTotals: number[];
  updateItem: (index: number, field: string, value: any) => void;
  handleProductSelect: (index: number, value: number) => void;
  removeItem: () => void;

  warehouses: any[];
  warehouseId: number | null;
}

export function ItemCard({
  index,
  item,
  supplierProducts,
  itemTotals,
  updateItem,
  handleProductSelect,
  removeItem,
  warehouses,
  warehouseId,
}: ItemCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [stock, setStock] = useState<number | null>(null);

  function handleRemove() {
    setIsRemoving(true);
    setTimeout(removeItem, 250);
  }

  function onProductChange(productId: number) {
    handleProductSelect(index, productId);

    // Seleciona o warehouse ativo
    const warehouse = warehouses.find((w) => w.id === warehouseId);

    // Busca o stockItem pelo productId
    const stockItem = warehouse?.stockItems?.find(
      (x: any) => x.productId === productId
    );

    // Atualiza o estado local com a quantidade
    setStock(stockItem?.quantity ?? 0);
  }

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.4 }}
          transition={{ duration: 0.25 }}
          className="border p-3 rounded-md bg-muted/20 space-y-2"
        >
          {/* HEADER */}
          <div className="flex items-center">
            <span className="font-semibold text-sm">Item {index + 1}</span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 hover:text-muted-foreground text-gray-500 transition"
              >
                {collapsed ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronUp size={14} />
                )}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:text-red-500 text-gray-400 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                {/* PRODUTO */}
                <Select
                  value={item.productId ? item.productId.toString() : undefined}
                  onValueChange={(v) => onProductChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Produto" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierProducts.map((p) => (
                      <SelectItem
                        key={p.productId}
                        value={p.productId.toString()}
                      >
                        {p.productName} — R$ {p.unitPrice?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* ESTOQUE DISPONÍVEL */}
                {stock !== null && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Estoque disponível: <strong>{stock}</strong> unidade(s)
                  </div>
                )}

                {/* QUANTIDADE / PREÇO */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Preço Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Subtotal: <strong>R$ {itemTotals[index].toFixed(2)}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
