import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  index: number;
  item: any;
  products: any[];
  itemTotal: number;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: () => void;
}

export function OrderItemCard({
  index,
  item,
  products,
  itemTotal,
  updateItem,
  removeItem,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [stock, setStock] = useState<number | null>(null);

  function handleRemove() {
    setRemoving(true);
    setTimeout(removeItem, 220);
  }

  function handleSelectProduct(productId: number) {
    updateItem(index, "productId", productId);

    const p = products.find((x) => x.id === productId);
    setStock(p?.totalStock ?? null);
  }

  return (
    <AnimatePresence>
      {!removing && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.4 }}
          transition={{ duration: 0.22 }}
          className="border rounded-md p-3 bg-muted/20 space-y-3"
        >
          {/* HEADER */}
          <div className="flex items-center">
            <span className="font-semibold text-sm">Item {index + 1}</span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-muted-foreground"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronUp size={14} />
                )}
              </button>

              <button
                type="button"
                className="p-1 text-gray-400 hover:text-red-500"
                onClick={handleRemove}
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
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                {/* PRODUTO */}
                <div>
                  <Label>Produto</Label>
                  <Select
                    value={String(item.productId)}
                    onValueChange={(v) => handleSelectProduct(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>

                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} — R$ {p.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* ESTOQUE DISPONÍVEL */}
                  {stock !== null && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Estoque disponível: <strong>{stock}</strong>
                    </div>
                  )}
                </div>

                {/* QUANTIDADE + PREÇO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <Label>Preço Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="text-right text-sm text-muted-foreground">
                  Subtotal: <strong>R$ {itemTotal.toFixed(2)}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
