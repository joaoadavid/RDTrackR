import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import {
  RequestUpdateUserJson,
  RequestChangePasswordJson,
  ResponseUserProfileJson,
} from "@/generated/apiClient";

import { Eye, EyeOff } from "lucide-react";

// =================================================================
// 🔥 Componente de Input com ícone de mostrar/ocultar senha
// =================================================================
function PasswordInput({ value, onChange, placeholder }: any) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="pr-10"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

// =================================================================
// 🔥 Página de Settings
// =================================================================
export default function Settings() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<ResponseUserProfileJson | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Campos de senha
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ============================================================
  // 🔄 Carregar perfil do usuário logado
  // ============================================================
  useEffect(() => {
    api.userPOST().then((p) => {
      setProfile(p);
      setName(p.name ?? "");
      setEmail(p.email ?? "");
    });
  }, []);

  // ============================================================
  // 🔥 Atualizar perfil (nome + email)
  // ============================================================
  async function handleUpdateProfile() {
    const body = new RequestUpdateUserJson({
      name,
      email,
    });

    try {
      await api.userPUT(body);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Verifique os dados enviados.",
        variant: "destructive",
      });
    }
  }

  // ============================================================
  // 🔥 Alterar senha
  // ============================================================
  async function handleChangePassword() {
    if (!password || !newPassword || !confirm) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
      });
      return;
    }

    if (newPassword !== confirm) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = new RequestChangePasswordJson({
        password,
        newPassword,
      });

      await api.changePassword(payload);

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });

      setPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      toast({
        title: "Erro ao alterar senha",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e segurança
        </p>
      </div>

      {/* =========================== */}
      {/* 🔥 Atualizar Perfil */}
      {/* =========================== */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize seus dados pessoais</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button onClick={handleUpdateProfile}>Salvar Alterações</Button>
        </CardContent>
      </Card>

      {/* =========================== */}
      {/* 🔥 Alterar Senha */}
      {/* =========================== */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Troque sua senha atual por uma nova</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Senha Atual</Label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <Label>Nova Senha</Label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <Label>Confirmar Nova Senha</Label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>

          <Button onClick={handleChangePassword}>Alterar Senha</Button>
        </CardContent>
      </Card>
    </div>
  );
}
