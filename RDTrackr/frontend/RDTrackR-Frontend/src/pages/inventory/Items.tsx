import { useEffect, useState } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

import {
  ResponseProductJson,
  ResponseStockItemJson,
  RequestRegisterProductJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";

// Modais
import { NewProductDialog } from "@/components/products/NewProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";

export default function Items() {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [stockItems, setStockItems] = useState<ResponseStockItemJson[]>([]);
  const [search, setSearch] = useState("");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<ResponseProductJson | null>(null);

  // =============================
  // 🔥 Carregar produtos + estoque
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const [prodResp, stockResp] = await Promise.all([
          api.productAll(),
          api.stockitemAll(),
        ]);

        setProducts(prodResp);
        setStockItems(stockResp);
      } catch {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível conectar ao servidor.",
          variant: "destructive",
        });
      }
    };
    load();
  }, []);

  // =============================
  // FILTRAR SOMENTE ATIVOS
  // =============================
  const activeProducts = products.filter((p) => p.active !== false);

  const filtered = activeProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // =============================
  // Criar produto
  // =============================
  const handleCreate = async (dto: RequestRegisterProductJson) => {
    try {
      const created = await api.productPOST(dto);
      setProducts((prev) => [...prev, created]);

      toast({
        title: "Produto criado",
        description: `"${created.name}" foi adicionado.`,
      });

      setIsNewOpen(false);
    } catch {
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível adicionar.",
        variant: "destructive",
      });
    }
  };

  // =============================
  // Editar produto
  // =============================
  const handleEdit = async (dto: RequestRegisterProductJson) => {
    if (!selected?.id) return;

    try {
      await api.productPUT(selected.id, dto);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? ResponseProductJson.fromJS({ ...p, ...dto })
            : p
        )
      );

      toast({
        title: "Produto atualizado",
        description: `"${dto.name}" foi atualizado.`,
      });

      setIsEditOpen(false);
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível editar.",
        variant: "destructive",
      });
    }
  };

  // =============================
  // Excluir produto
  // =============================
  const handleDelete = async () => {
    if (!selected?.id) return;

    try {
      await api.productDELETE(selected.id);

      setProducts((prev) => prev.filter((p) => p.id !== selected.id));

      toast({
        title: "Produto removido",
        description: `"${selected.name}" foi excluído.`,
        variant: "destructive",
      });

      setIsDeleteOpen(false);
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Falha ao remover produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Itens</h2>
          <p className="text-muted-foreground">Gerencie todos os produtos</p>
        </div>

        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Itens</CardTitle>
          <CardDescription>
            Visualize e gerencie os produtos ativos
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>UoM</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Distribuição por Warehouse</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((p) => {
                  const stockForProduct = stockItems.filter(
                    (s) => s.productName === p.name
                  );

                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.uoM}</TableCell>
                      <TableCell>R$ {p.price?.toFixed(2)}</TableCell>

                      {/* Total Stock */}
                      <TableCell>{p.totalStock ?? 0}</TableCell>

                      {/* Warehouse name + quantity */}
                      <TableCell className="text-sm text-muted-foreground">
                        {stockForProduct.length === 0
                          ? "Sem estoque"
                          : stockForProduct
                              .map((s) => `${s.warehouseName}: ${s.quantity}`)
                              .join(" | ")}
                      </TableCell>

                      {/* Ações */}
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
                                setSelected(p);
                                setIsEditOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelected(p);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Nenhum produto ativo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <NewProductDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onCreate={handleCreate}
      />

      {selected && (
        <EditProductDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          product={selected}
          onEdit={handleEdit}
        />
      )}

      {selected && (
        <DeleteProductDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          product={selected}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
