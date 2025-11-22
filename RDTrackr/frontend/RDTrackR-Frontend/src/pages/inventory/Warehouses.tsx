import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  RequestRegisterWarehouseJson,
  RequestUpdateWarehouseJson,
  ResponseWarehouseJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { NewWarehouseDialog } from "@/components/inventory/NewWarehouseDialog";
import { EditWarehouseDialog } from "@/components/warehouses/EditWarehouseDialog";
import { WarehouseDetailsDialog } from "@/components/warehouses/WarehouseDetailsDialog";

export default function Warehouses() {
  const { toast } = useToast();

  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [detailsWarehouseId, setDetailsWarehouseId] = useState<number | null>(
    null
  );
  const [detailsWarehouseName, setDetailsWarehouseName] = useState("");

  const [editWarehouse, setEditWarehouse] =
    useState<ResponseWarehouseJson | null>(null);

  // LOAD
  useEffect(() => {
    api
      .warehouseAll()
      .then(setWarehouses)
      .catch(() =>
        toast({
          title: "Erro ao carregar depósitos",
          description: "Não foi possível conectar ao servidor.",
          variant: "destructive",
        })
      );
  }, []);

  // CREATE
  const handleAddWarehouse = async (dto: RequestRegisterWarehouseJson) => {
    try {
      const created = await api.warehousePOST(dto);
      setWarehouses((prev) => [...prev, created]);

      toast({
        title: "Depósito criado",
        description: `O depósito "${created.name}" foi adicionado.`,
      });
    } catch {
      toast({
        title: "Erro ao criar depósito",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // UPDATE
  const handleUpdateWarehouse = async (
    updated: ResponseWarehouseJson,
    dto: RequestUpdateWarehouseJson
  ) => {
    try {
      await api.warehousePUT(updated.id!, dto);

      setWarehouses((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );

      toast({
        title: "Depósito atualizado",
        description: `O depósito "${updated.name}" foi editado.`,
      });
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o depósito.",
        variant: "destructive",
      });
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    try {
      await api.warehouseDELETE(id);

      setWarehouses((prev) => prev.filter((w) => w.id !== id));

      toast({
        title: "Depósito removido",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erro ao excluir depósito",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getUtilizationColor = (u: number) => {
    if (u >= 80) return "destructive";
    if (u >= 60) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Depósitos</h2>
          <p className="text-muted-foreground">
            Gerencie locais de armazenamento
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Depósito
        </Button>
      </div>

      <NewWarehouseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddWarehouse}
      />

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Depósitos</CardTitle>
          <CardDescription>Visualize e gerencie o estoque</CardDescription>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG DETALHES */}
      <WarehouseDetailsDialog
        open={!!detailsWarehouseId}
        warehouseId={detailsWarehouseId}
        warehouseName={detailsWarehouseName}
        onOpenChange={(open) => {
          if (!open) setDetailsWarehouseId(null);
        }}
      />

      {/* DIALOG EDITAR */}
      <EditWarehouseDialog
        open={!!editWarehouse}
        warehouse={editWarehouse}
        onOpenChange={(open) => {
          if (!open) setEditWarehouse(null);
        }}
        onUpdate={handleUpdateWarehouse}
      />
    </div>
  );
}
