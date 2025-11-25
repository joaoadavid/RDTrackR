import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import {
  RequestRegisterWarehouseJson,
  RequestUpdateWarehouseJson,
  ResponseWarehouseJson,
  ResponseWarehouseJsonPagedResponse,
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { NewWarehouseDialog } from "@/components/inventory/NewWarehouseDialog";
import { EditWarehouseDialog } from "@/components/warehouses/EditWarehouseDialog";
import { WarehouseDetailsDialog } from "@/components/warehouses/WarehouseDetailsDialog";

export default function Warehouses() {
  const { toast } = useToast();

  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] =
    useState<ResponseWarehouseJson | null>(null);
  const [detailsWarehouseId, setDetailsWarehouseId] = useState<number | null>(
    null
  );
  const [detailsWarehouseName, setDetailsWarehouseName] = useState("");

  async function loadData() {
    try {
      const result: ResponseWarehouseJsonPagedResponse = await api.warehouseGET(
        page,
        pageSize,
        search
      );

      setWarehouses(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar depósitos",
        description: "Não foi possível obter os dados.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleAddWarehouse = async (dto: RequestRegisterWarehouseJson) => {
    try {
      await api.warehousePOST(dto);
      loadData();

      toast({ title: "Depósito criado", description: "Criado com sucesso." });
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Erro ao criar depósito", variant: "destructive" });
    }
  };

  const handleUpdateWarehouse = async (
    w: ResponseWarehouseJson,
    dto: RequestUpdateWarehouseJson
  ) => {
    try {
      await api.warehousePUT(w.id!, dto);
      loadData();

      toast({ title: "Depósito atualizado" });
      setEditWarehouse(null);
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.warehouseDELETE(id);
      loadData();

      toast({ title: "Depósito removido", variant: "destructive" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const getUtilizationColor = (u: number) => {
    if (u >= 80) return "destructive";
    if (u >= 60) return "secondary";
    return "default";
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Depósitos</h2>
          <p className="text-muted-foreground">
            Gerencie os locais de armazenamento
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Depósito
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Buscar por nome ou localização..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <NewWarehouseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddWarehouse}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Depósitos</CardTitle>
          <CardDescription>Informações gerais da sua estrutura</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {warehouses.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.location}</TableCell>
                  <TableCell>{w.capacity}</TableCell>
                  <TableCell className="text-right">{w.items}</TableCell>
                  <TableCell>
                    <Badge variant={getUtilizationColor(w.utilization!)}>
                      {w.utilization}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(w.createdAt!).toLocaleDateString("pt-BR")}
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

                        {/* DETAILS */}
                        <DropdownMenuItem
                          onClick={() => {
                            setDetailsWarehouseId(w.id!);
                            setDetailsWarehouseName(w.name ?? "");
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>

                        {/* EDIT */}
                        <DropdownMenuItem onClick={() => setEditWarehouse(w)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        {/* DELETE */}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(w.id!)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {warehouses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Nenhum depósito encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <WarehouseDetailsDialog
        open={!!detailsWarehouseId}
        warehouseId={detailsWarehouseId}
        warehouseName={detailsWarehouseName}
        onOpenChange={(open) => !open && setDetailsWarehouseId(null)}
      />

      <EditWarehouseDialog
        open={!!editWarehouse}
        warehouse={editWarehouse}
        onOpenChange={(open) => !open && setEditWarehouse(null)}
        onUpdate={handleUpdateWarehouse}
      />
    </div>
  );
}
