import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";

import { ResponseUserListItemJson } from "@/generated/apiClient";
import { api } from "@/lib/api";

// MAPS
const roleMap = {
  admin: { label: "Admin", variant: "default" as const },
  user: { label: "Usuário", variant: "secondary" as const },
};

export default function Users() {
  const [users, setUsers] = useState<ResponseUserListItemJson[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] =
    useState<ResponseUserListItemJson | null>(null);

  async function loadUsers() {
    const result = await api.adminAll();
    setUsers(result);
  }

  useEffect(() => {
    loadUsers().then(() => {
      console.log("USERS:", users);
    });
  }, []);

  function handleSuccess(action: "created" | "updated" | "deleted") {
    try {
      loadUsers();

      const messages = {
        created: {
          title: "Usuário criado",
          description: "O usuário foi registrado com sucesso.",
        },
        updated: {
          title: "Usuário atualizado",
          description: "As informações foram salvas com sucesso.",
        },
        deleted: {
          title: "Usuário excluído",
          description: "O usuário foi removido do sistema.",
        },
      };

      toast({
        title: messages[action].title,
        description: messages[action].description,
      });
    } catch {
      toast({
        title: "Erro ao salvar usuário",
        description: "Verifique as informações e tente novamente.",
        variant: "destructive",
      });
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários da organização
          </p>
        </div>

        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Gerencie acesso e permissões</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>

                  <TableCell>
                    <Badge variant={roleMap[u.role!.toLowerCase()]?.variant}>
                      {roleMap[u.role!.toLowerCase()]?.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={u.active ? "default" : "secondary"}>
                      {u.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {u.createdOn?.toLocaleDateString("pt-BR")}
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

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(u);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(u);
                            setDeleteOpen(true);
                          }}
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

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => handleSuccess("created")}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onSuccess={() => handleSuccess("updated")}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onSuccess={() => handleSuccess("deleted")}
      />
    </div>
  );
}
