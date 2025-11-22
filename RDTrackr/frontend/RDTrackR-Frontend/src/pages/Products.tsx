import { useEffect, useState } from "react";
import { Search, Boxes } from "lucide-react";

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

import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ResponseProductJson } from "@/generated/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const stockStatusMap = {
  in_stock: { label: "Em Estoque", variant: "default" as const },
  low_stock: { label: "Estoque Baixo", variant: "secondary" as const },
  out_of_stock: { label: "Sem Estoque", variant: "destructive" as const },
};

export default function Products() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ResponseProductJson[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 Carregar produtos da API
  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.productAll();
        setProducts(result);
      } catch {
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível conectar ao servidor.",
          variant: "destructive",
        });
      }
    };

    load();
  }, []);

  // 🔍 Filtro de busca
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Catálogo completo de produtos</p>
        </div>

        {/* 🔥 Botão que REDIRECIONA para a página de ITENS */}
        <Button onClick={() => navigate("/inventory/items")}>
          <Boxes className="mr-2 h-4 w-4" />
          Gerenciar Itens
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
          <CardDescription>
            Visualize informações gerais dos produtos cadastrados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProducts.map((p) => {
                  const total = p.totalStock ?? 0;

                  const status =
                    total === 0
                      ? "out_of_stock"
                      : total < 10
                      ? "low_stock"
                      : "in_stock";

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.category}</TableCell>

                      <TableCell>R$ {p.price?.toFixed(2)}</TableCell>

                      <TableCell>{total}</TableCell>

                      <TableCell>
                        <Badge variant={stockStatusMap[status].variant}>
                          {stockStatusMap[status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
