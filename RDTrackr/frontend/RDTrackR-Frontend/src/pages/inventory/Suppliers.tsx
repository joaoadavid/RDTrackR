import { useState, useEffect } from "react";
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
import { api } from "@/lib/api";
import {
  ResponseSupplierJson,
  RequestRegisterSupplierJson,
  RequestUpdateSupplierJson,
} from "@/generated/apiClient";
import { NewSupplierDialog } from "@/components/suppliers/NewSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";

export default function Suppliers() {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<ResponseSupplierJson[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<ResponseSupplierJson | null>(null);

  useEffect(() => {
    api
      .supplierAll()
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }, []);

  const handleAddSupplier = async (form: any) => {
    try {
      const dto = RequestRegisterSupplierJson.fromJS(form);
      await api.supplierPOST(dto);

      // RELOAD real da API
      const updatedList = await api.supplierAll();
      setSuppliers(updatedList);

      toast({
        title: "Fornecedor criado",
        description: `O fornecedor "${form.name}" foi adicionado.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao criar fornecedor",
        description: "Não foi possível cadastrar o fornecedor.",
        variant: "destructive",
      });
    }
  };

  // --- UPDATE ---
  const handleEditSupplier = async (updated: any) => {
    try {
      const dto = RequestUpdateSupplierJson.fromJS(updated);

      const saved = await api.supplierPUT(updated.id, dto);

      setSuppliers((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));

      toast({
        title: "Fornecedor atualizado",
        description: `As informações de "${saved.name}" foram atualizadas.`,
      });
    } catch {
      toast({
        title: "Erro ao editar",
        description: "Não foi possível atualizar o fornecedor.",
        variant: "destructive",
      });
    }
  };

  // --- DELETE ---
  const handleDelete = async (id: number) => {
    try {
      await api.supplierDELETE(id);

      setSuppliers((prev) => prev.filter((s) => s.id !== id));

      toast({
        title: "Fornecedor excluído",
        description: "O fornecedor foi removido.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover o fornecedor.",
        variant: "destructive",
      });
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Fornecedor
        </Button>
      </div>

      {/* MODALS */}
      <NewSupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleAddSupplier}
      />

      <EditSupplierDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        supplier={selectedSupplier}
        onSave={handleEditSupplier}
      />

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            Visualize e gerencie seus fornecedores
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Search */}
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
              {filteredSuppliers.map((s) => (
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
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
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
        </CardContent>
      </Card>
    </div>
  );
}
