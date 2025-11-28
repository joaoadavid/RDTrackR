import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestValidateResetCodeJson } from "@/generated/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.codeResetPassword(email);

      toast({
        title: "Código enviado!",
        description: "Verifique sua caixa de e-mail.",
      });

      setStep("code");
    } catch {
      toast({
        title: "Erro ao enviar código",
        description: "Verifique se o e-mail está correto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateCode() {
    if (!code.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código enviado para seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await api.validateResetCode(
        new RequestValidateResetCodeJson({
          email,
          code,
        })
      );

      navigate(`/reset-password?email=${email}&code=${code}`);
    } catch (err: any) {
      toast({
        title: "Código inválido",
        description:
          err?.body?.message?.[0] ??
          "O código informado é inválido ou expirado.",
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
          <CardTitle>
            {step === "email" ? "Recuperar Senha" : "Verificar Código"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* ========================= STEP 1 — ENVIAR E-MAIL ========================= */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          )}

          {/* ========================= STEP 2 — VALIDAR CÓDIGO ========================= */}
          {step === "code" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enviamos um código para <strong>{email}</strong>.
              </p>

              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: 123456"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleValidateCode}
                disabled={loading}
              >
                {loading ? "Validando..." : "Validar Código"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendCode}
                disabled={loading}
              >
                Reenviar código
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email")}
              >
                Alterar e-mail
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
