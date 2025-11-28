import { useEffect, useState, useCallback, Fragment } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import {
  ResponseAuditLogJsonPagedResponse,
  ResponseAuditLogJson,
} from "@/generated/apiClient";

// ========================================
// 🔥 Mapa de tipos (mesmo de antes)
// ========================================
const typeMap = {
  CREATE: { label: "Criação", variant: "default" as const },
  UPDATE: { label: "Atualização", variant: "secondary" as const },
  DELETE: { label: "Exclusão", variant: "destructive" as const },
  LOGIN: { label: "Login", variant: "outline" as const },
};

// ========================================
// 🔄 Debounce para busca
// ========================================
function useDebounce(value: string, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AuditLog() {
  const { toast } = useToast();

  const [logs, setLogs] = useState<ResponseAuditLogJson[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const debouncedSearch = useDebounce(search, 350);

  // ========================================
  // 🔥 Carregamento com paginação
  // ========================================
  const loadLogs = useCallback(async () => {
    setLoading(true);

    try {
      const result: ResponseAuditLogJsonPagedResponse = await api.logs(
        page,
        pageSize,
        filter === "all" ? undefined : filter,
        debouncedSearch || undefined
      );

      setLogs(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar auditoria",
        description: "Não foi possível obter os dados do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, debouncedSearch, toast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / pageSize);

  // ========================================
  // 🦴 Skeleton Loader
  // ========================================
  const renderSkeleton = () => (
    <TableRow>
      <TableCell className="animate-pulse bg-muted/40 h-6 rounded"></TableCell>
      <TableCell className="animate-pulse bg-muted/40 h-6 rounded"></TableCell>
      <TableCell className="animate-pulse bg-muted/40 h-6 rounded"></TableCell>
      <TableCell className="animate-pulse bg-muted/40 h-6 rounded"></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Auditoria</h2>
          <p className="text-muted-foreground">
            Registro de atividades do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
          <CardDescription>
            Histórico de ações de usuários e eventos do sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            {/* Busca */}
            <div className="flex items-center w-full sm:w-1/2 relative">
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar ação..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>

            {/* Tipo */}
            <Select
              value={filter}
              onValueChange={(v) => {
                setFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="CREATE">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
              </SelectContent>
            </Select>

            {/* Itens por página */}
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Itens / página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / página</SelectItem>
                <SelectItem value="25">25 / página</SelectItem>
                <SelectItem value="50">50 / página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <Fragment key={i}>{renderSkeleton()}</Fragment>
                ))}

              {!loading &&
                logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={typeMap[log.type].variant}>
                        {typeMap[log.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.date
                        ? new Date(log.date).toLocaleString("pt-BR")
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
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
