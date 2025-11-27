import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { NewMovementDialog } from "@/components/movements/NewMovementDialog";
import { api } from "@/lib/api";

import {
  ResponseMovementJson,
  MovementType,
  ResponseMovementJsonPagedResponse,
} from "@/generated/apiClient";

const movementTypeMap = {
  INBOUND: { label: "Entrada", variant: "default" as const },
  OUTBOUND: { label: "Saída", variant: "secondary" as const },
  ADJUST: { label: "Ajuste", variant: "outline" as const },
};

export default function Movements() {
  const { toast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [movements, setMovements] = useState<ResponseMovementJson[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function loadMovements() {
    try {
      const result: ResponseMovementJsonPagedResponse = await api.movementGET(
        page,
        pageSize,
        undefined, // warehouse
        typeFilter === "all" ? undefined : (typeFilter as MovementType),
        undefined,
        undefined
      );

      setMovements(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      toast({
        title: "Erro ao carregar movimentações",
        description: "Não foi possível obter os dados do servidor.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadMovements();
  }, [page, pageSize, typeFilter]);

  useEffect(() => {
    if (!isDialogOpen) {
      loadMovements();
    }
  }, [isDialogOpen]);

  const handleAddMovement = async (movementRequest: any) => {
    try {
      await api.movementPOST(movementRequest);

      toast({
        title: "Movimentação registrada",
        description: `A movimentação foi salva com sucesso.`,
      });

      loadMovements();
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Movimentações</h2>
          <p className="text-muted-foreground">
            Histórico de entradas, saídas e ajustes
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <NewMovementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddMovement}
      />

      {/* LISTA */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Movimentações registradas no sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex gap-4 items-center">
            {/* FILTER: TYPE */}
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setPage(1);
                setTypeFilter(v);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="INBOUND">Entradas</SelectItem>
                <SelectItem value="OUTBOUND">Saídas</SelectItem>
                <SelectItem value="ADJUST">Ajustes</SelectItem>
              </SelectContent>
            </Select>

            {/* PAGE SIZE */}
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Itens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / página</SelectItem>
                <SelectItem value="25">25 / página</SelectItem>
                <SelectItem value="50">50 / página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TABELA */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Badge variant={movementTypeMap[m.type!].variant}>
                      {movementTypeMap[m.type!].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">{m.reference}</TableCell>
                  <TableCell>{m.product}</TableCell>
                  <TableCell>{m.warehouse}</TableCell>

                  <TableCell
                    className={`text-right font-medium ${
                      m.type === "OUTBOUND" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {m.type === "OUTBOUND" ? "-" : "+"}
                    {m.quantity}
                  </TableCell>

                  <TableCell>
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleString("pt-BR")
                      : "--"}
                  </TableCell>

                  <TableCell>{m.createdByName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINAÇÃO */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
