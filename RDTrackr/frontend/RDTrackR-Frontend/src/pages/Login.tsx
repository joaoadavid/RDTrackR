import { useState } from "react";
import LogoRDTrackR from "@/assets/LogoRDTrackR.svg";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo!`,
      });

      navigate("/inventory");
    } catch (err: any) {
      const message =
        err?.result?.message ?? err?.body?.message ?? "Erro ao realizar login.";

      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex justify-center">
            <img
              src={LogoRDTrackR}
              alt="RDTrackR Logo"
              className="h-30 w-auto sm:h-32 object-contain scale-125"
            />
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between text-sm mt-1">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Esqueci minha senha
              </button>

              <button
                type="button"
                className="text-muted-foreground hover:underline"
                onClick={() => navigate("/")}
              >
                Voltar à Home
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
