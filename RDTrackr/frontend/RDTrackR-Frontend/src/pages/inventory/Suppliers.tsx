import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import {
  ResponseSupplierJson,
  RequestRegisterSupplierJson,
  RequestUpdateSupplierJson,
  ResponseSupplierJsonPagedResponse,
} from "@/generated/apiClient";

import { NewSupplierDialog } from "@/components/suppliers/NewSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";
import { SupplierProductsDialog } from "@/components/suppliersProduct/SupplierProductsDialog";

export default function Suppliers() {
  const { toast } = useToast();

  // dados
  const [suppliers, setSuppliers] = useState<ResponseSupplierJson[]>([]);
  const [loading, setLoading] = useState(true);

  // paginação
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // busca
  const [search, setSearch] = useState("");

  // modais
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState<ResponseSupplierJson | null>(null);

  // ============================
  // LOAD PAGINADO
  // ============================
  async function loadSuppliers() {
    try {
      setLoading(true);
      const result: ResponseSupplierJsonPagedResponse = await api.supplierGET(
        page,
        pageSize,
        search
      );

      setSuppliers(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar fornecedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // load inicial + mudança de página
  useEffect(() => {
    loadSuppliers();
  }, [page]);

  // busca com debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadSuppliers();
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const totalPages = Math.ceil(total / pageSize);

  // ============================
  // CREATE
  // ============================
  const handleAddSupplier = async (form: any) => {
    try {
      const dto = RequestRegisterSupplierJson.fromJS(form);
      await api.supplierPOST(dto);

      loadSuppliers();

      toast({
        title: "Fornecedor criado",
        description: `O fornecedor "${form.name}" foi adicionado.`,
      });
    } catch {
      toast({
        title: "Erro ao criar fornecedor",
        variant: "destructive",
      });
    }
  };

  // ============================
  // UPDATE
  // ============================
  const handleEditSupplier = async (form: any) => {
    try {
      const dto = RequestUpdateSupplierJson.fromJS(form);
      await api.supplierPUT(form.id, dto);

      loadSuppliers();

      toast({
        title: "Fornecedor atualizado",
        description: `As informações foram atualizadas.`,
      });
    } catch {
      toast({
        title: "Erro ao editar fornecedor",
        variant: "destructive",
      });
    }
  };

  // ============================
  // DELETE
  // ============================
  const handleDelete = async (id: number) => {
    try {
      await api.supplierDELETE(id);

      loadSuppliers();

      toast({
        title: "Fornecedor removido",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erro ao excluir fornecedor",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p>Carregando fornecedores...</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Gerencie fornecedores e parceiros
          </p>
        </div>

        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {/* MODAIS */}
      <NewSupplierDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onCreate={handleAddSupplier}
      />

      <EditSupplierDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        supplier={selectedSupplier}
        onSave={handleEditSupplier}
      />

      <SupplierProductsDialog
        open={isProductsOpen}
        onOpenChange={setIsProductsOpen}
        supplierId={selectedSupplier?.id ?? null}
      />

      {/* LISTA */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            Gerencie os fornecedores cadastrados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* SEARCH */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.contact}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.address}</TableCell>

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
                            setSelectedSupplier(s);
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsProductsOpen(true);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" /> Ver Produtos
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINAÇÃO */}
          <div className="flex justify-between items-center mt-4">
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
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
