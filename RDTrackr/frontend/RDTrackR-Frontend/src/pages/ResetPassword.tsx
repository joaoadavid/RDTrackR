import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { RequestResetYourPasswordJson } from "@/generated/apiClient";

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const email = query.get("email") ?? "";
  const code = query.get("code") ?? "";

  const [password, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirm) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Senhas diferentes",
        description: "A confirmação deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const body = new RequestResetYourPasswordJson({
        email,
        code,
        password,
      });

      await api.resetPassword(body);

      toast({
        title: "Senha redefinida!",
        description: "Você já pode fazer login novamente.",
      });

      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: err?.body?.message ?? "Código inválido ou expirado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Redefinindo senha para: <strong>{email}</strong>
            </p>

            <div>
              <Label>Nova Senha</Label>
              <Input
                type="password"
                data-testid="password"
                value={password}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                data-testid="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
