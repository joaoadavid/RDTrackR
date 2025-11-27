import { useEffect, useState, useCallback } from "react";
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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

// Pagination UI
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Items() {
  const { toast } = useToast();

  // ----------------------------
  // ESTADOS
  // ----------------------------
  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [stockItems, setStockItems] = useState<ResponseStockItemJson[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ResponseProductJson | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const prodResp = await api.productGET(page, pageSize, debouncedSearch);
      const stockResp = await api.stockitemAll();

      setProducts(prodResp.items ?? []);
      setTotal(prodResp.total ?? 0);
      setStockItems(stockResp);
    } catch {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const valueA = (a as any)[sortColumn];
    const valueB = (b as any)[sortColumn];

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleCreate = async (dto: RequestRegisterProductJson) => {
    try {
      await api.productPOST(dto);
      load();

      toast({
        title: "Produto criado",
        description: `"${dto.name}" foi adicionado.`,
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

  const handleEdit = async (dto: RequestRegisterProductJson) => {
    if (!selected?.id) return;

    try {
      await api.productPUT(selected.id, dto);
      load();

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

  const handleDelete = async () => {
    if (!selected?.id) return;

    try {
      await api.productDELETE(selected.id);
      load();

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
            Visualize e gerencie produtos com paginação, busca e filtros.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>

            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Qtd por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "sku",
                    "nome",
                    "categoria",
                    "uoM",
                    "preço",
                    "total em estoque",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort(col)}
                    >
                      {col.toUpperCase()}{" "}
                      {sortColumn === col
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : ""}
                    </TableHead>
                  ))}
                  <TableHead>Distribuição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedProducts.map((p) => {
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
                      <TableCell>{p.totalStock ?? 0}</TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {stockForProduct.length === 0
                          ? "Sem estoque"
                          : stockForProduct
                              .map((s) => `${s.warehouseName}: ${s.quantity}`)
                              .join(" | ")}
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

                {sortedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINAÇÃO */}
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Página {page} de {Math.ceil(total / pageSize)}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage(Math.ceil(total / pageSize))}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
