import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
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
} from "@/generated/apiClient";

// ✔️ Correto: diálogos de Supplier
import { NewSupplierDialog } from "@/components/suppliers/NewSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";

// ✔️ Correto: diálogo para produtos do fornecedor
import { SupplierProductsDialog } from "@/components/suppliersProduct/SupplierProductsDialog";

export default function Suppliers() {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<ResponseSupplierJson[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Modais
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState<ResponseSupplierJson | null>(null);

  // Carregar lista inicial
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

      const updated = await api.supplierAll();
      setSuppliers(updated);

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

  // Editar fornecedor
  const handleEditSupplier = async (form: any) => {
    try {
      const dto = RequestUpdateSupplierJson.fromJS(form);
      const updatedSupplier = await api.supplierPUT(form.id, dto);

      setSuppliers((prev) =>
        prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
      );

      toast({
        title: "Fornecedor atualizado",
        description: `As informações de "${updatedSupplier.name}" foram atualizadas.`,
      });
    } catch {
      toast({
        title: "Erro ao editar fornecedor",
        variant: "destructive",
      });
    }
  };

  // Excluir fornecedor
  const handleDelete = async (id: number) => {
    try {
      await api.supplierDELETE(id);

      setSuppliers((prev) => prev.filter((s) => s.id !== id));

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

  const filtered = suppliers.filter(
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

        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {/* MODAL — NOVO FORNECEDOR */}
      <NewSupplierDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onCreate={handleAddSupplier}
      />

      {/* MODAL — EDITAR FORNECEDOR */}
      <EditSupplierDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        supplier={selectedSupplier}
        onSave={handleEditSupplier}
      />

      {/* MODAL — PRODUTOS DO FORNECEDOR */}
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
              {filtered.map((s) => (
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

                        {/* Editar */}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>

                        {/* Ver Produtos */}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsProductsOpen(true);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" /> Ver Produtos
                        </DropdownMenuItem>

                        {/* Excluir */}
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
