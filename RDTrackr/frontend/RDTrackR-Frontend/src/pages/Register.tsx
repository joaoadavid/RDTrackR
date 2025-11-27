import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoR from "@/assets/LogoRDTrackR.svg";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerOrganization } = useAuth();

  const [formData, setFormData] = useState({
    organization: "",
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerOrganization(
        formData.organization,
        formData.nome,
        formData.email,
        formData.senha
      );

      toast({
        title: "Organização criada com sucesso!",
        description: `Administrador ${formData.nome} registrado.`,
      });

      navigate("/inventory");
    } catch (error: any) {
      const msg =
        error?.result?.message ??
        error?.data?.message ??
        "Erro ao registrar organização.";

      toast({
        title: "Erro no cadastro",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar para home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <img src={LogoR} className="h-20 scale-125" />
            <CardTitle className="text-2xl">Criar organização</CardTitle>
            <CardDescription>
              Preencha as informações para criar sua organização e o
              administrador
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="organization">Nome da Organização</Label>
                <Input
                  id="organization"
                  name="organization"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nome">Nome do Administrador</Label>
                <Input id="nome" name="nome" onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="email">E-mail do Administrador</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Criar Organização
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
