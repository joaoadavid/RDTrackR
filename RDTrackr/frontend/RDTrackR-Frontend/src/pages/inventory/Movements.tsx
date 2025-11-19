import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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

import { ResponseMovementJson, MovementType } from "@/generated/apiClient";

const movementTypeMap = {
  INBOUND: { label: "Entrada", variant: "default" as const },
  OUTBOUND: { label: "Saída", variant: "secondary" as const },
  ADJUST: { label: "Ajuste", variant: "outline" as const },
};

export default function Movements() {
  const { toast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [movements, setMovements] = useState<ResponseMovementJson[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 🔄 Carrega os movimentos ao montar a página
  async function loadMovements() {
    try {
      const data = await api.movementAll(
        undefined,
        undefined,
        undefined,
        undefined
      );
      setMovements(data);
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
  }, []);

  // 🔄 Filtro por tipo
  const filteredMovements = movements.filter(
    (m) => typeFilter === "all" || m.type === typeFilter
  );

  // ➕ Registrar nova movimentação (POST real)
  const handleAddMovement = async (movementRequest: any) => {
    try {
      const created = await api.movement(movementRequest);
      setMovements((prev) => [...prev, created]);

      toast({
        title: "Movimentação registrada",
        description: `A movimentação ${created.reference} foi salva com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Modal */}
      <NewMovementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddMovement}
      />

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Movimentações registradas no sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* FILTRO */}
          <div className="mb-4 flex gap-4">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
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
          </div>

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
              {filteredMovements.map((m) => (
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
                      m.quantity! > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {m.quantity! > 0 ? "+" : ""}
                    {m.quantity}
                  </TableCell>

                  <TableCell>
                    {m.createdAt?.toLocaleString("pt-BR") ?? "--"}
                  </TableCell>

                  <TableCell>{m.createdByName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
