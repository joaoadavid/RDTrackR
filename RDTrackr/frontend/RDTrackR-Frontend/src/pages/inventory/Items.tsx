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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import {
  RequestRegisterProductJson,
  ResponseProductJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { NewItemDialog } from "@/components/inventory/NewItemDialog";
import { EditItemDialog } from "@/components/inventory/EditItemDialog";

export default function InventoryItems() {
  const { toast } = useToast();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResponseProductJson | null>(
    null
  );

  // 🔥 Carregar produtos
  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.productAll();
        setProducts(result);
      } catch (err) {
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível conectar ao servidor.",
          variant: "destructive",
        });
      }
    };

    load();
  }, []);

  // 🔥 Criar produto
  const handleAddItem = async (dto: RequestRegisterProductJson) => {
    try {
      const created = await api.productPOST(dto);
      setProducts((prev) => [...prev, created]);

      toast({
        title: "Produto criado",
        description: `O produto "${created.name}" foi adicionado.`,
      });
    } catch {
      toast({
        title: "Erro ao criar produto",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (
    updatedEntity: ResponseProductJson,
    dto: RequestRegisterProductJson
  ) => {
    try {
      await api.productPUT(Number(updatedEntity.id), dto);

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedEntity.id ? updatedEntity : p))
      );

      toast({
        title: "Produto atualizado",
        description: `O produto "${updatedEntity.name}" foi salvo.`,
      });
    } catch {
      toast({
        title: "Erro ao atualizar produto",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await api.productDELETE(Number(id));

      setProducts((prev) => prev.filter((p) => Number(p.id) !== Number(id)));

      toast({
        title: "Produto excluído",
        description: "O item foi removido do inventário.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())) &&
      (category === "all" || p.category === category)
  );

  const getStockStatus = (stock: number, reorderPoint: number) => {
    if (stock === 0)
      return { label: "Sem Estoque", variant: "destructive" as const };
    if (stock < reorderPoint)
      return { label: "Estoque Baixo", variant: "secondary" as const };
    return { label: "Em Estoque", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Itens do Estoque</h2>
          <p className="text-muted-foreground">Gerencie seus produtos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      {/* Modais */}
      <NewItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddItem}
      />

      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={selectedItem}
        onUpdate={handleUpdateItem}
      />

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
          <CardDescription>Visualize e gerencie o seu estoque</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                <SelectItem value="Roupas">Roupas</SelectItem>
                <SelectItem value="Alimentos">Alimentos</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(
                    product.stock,
                    product.reorderPoint
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.uoM}</TableCell>

                      <TableCell className="text-right">
                        R$ {product.price.toFixed(2)}
                      </TableCell>

                      <TableCell className="text-right">
                        {product.stock}
                      </TableCell>

                      <TableCell className="text-right">
                        {product.reorderPoint}
                      </TableCell>

                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent>
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedItem(product);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(product.id!)}
                              className="text-destructive"
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
