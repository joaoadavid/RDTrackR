import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightLeft,
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
  ResponseWarehouseJson,
} from "@/generated/apiClient";

import { api } from "@/lib/api";
import { NewWarehouseDialog } from "@/components/inventory/NewWarehouseDialog";

export default function Warehouses() {
  const { toast } = useToast();

  const [warehouses, setWarehouses] = useState<ResponseWarehouseJson[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.warehouseAll();
        setWarehouses(result);
      } catch {
        toast({
          title: "Erro ao carregar depósitos",
          description: "Não foi possível conectar ao servidor.",
          variant: "destructive",
        });
      }
    };

    load();
  }, []);

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

  const handleDelete = async (id: number | string) => {
    try {
      const idValue = Number(id ?? 0);

      const warehouseDeleted = warehouses.find((w) => Number(w.id) === idValue);

      await api.warehouseDELETE(idValue);

      setWarehouses((prev) => prev.filter((w) => Number(w.id) !== idValue));

      toast({
        title: "Depósito excluído",
        description: `O depósito "${
          warehouseDeleted?.name ?? "Desconhecido"
        }" foi removido com sucesso.`,
        variant: "destructive",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Erro ao excluir depósito",
        description: "Não foi possível remover o depósito. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "destructive";
    if (utilization >= 60) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Depósitos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os locais de estoque
          </CardDescription>
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
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">
                    {warehouse.name}
                  </TableCell>

                  <TableCell>{warehouse.location}</TableCell>

                  <TableCell>{warehouse.capacity}</TableCell>

                  <TableCell className="text-right">
                    {warehouse.items}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getUtilizationColor(warehouse.utilization!)}
                    >
                      {warehouse.utilization}%
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(warehouse.createdAt!).toLocaleDateString("pt-BR")}
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

                        <DropdownMenuItem>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Transferir
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(warehouse.id!)}
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
    </div>
  );
}
