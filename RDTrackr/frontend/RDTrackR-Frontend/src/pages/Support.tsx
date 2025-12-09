import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, HelpCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useSystemStatus } from "@/hooks/use-systemStatus";

export default function Support() {
  const status = useSystemStatus();

  function renderStatus() {
    switch (status) {
      case "up":
        return (
          <Badge className="bg-green-500 text-white text-sm px-3 py-1">
            Sistema operando normalmente
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-yellow-400 text-black text-sm px-3 py-1">
            Instabilidade detectada
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-red-600 text-white text-sm px-3 py-1">
            Sistema indisponível
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-sm px-3 py-1">
            Verificando status...
          </Badge>
        );
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge variant="secondary">Central de Suporte</Badge>

              <h1 className="text-4xl font-bold tracking-tight">
                Como podemos ajudar?
              </h1>

              <p className="text-lg text-muted-foreground">
                Você pode abrir um chamado ou falar conosco diretamente.
              </p>
            </div>

            <Card className="text-center border shadow-sm">
              <CardHeader>
                <HelpCircle className="w-10 h-10 mx-auto text-primary mb-3" />
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>{renderStatus()}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border shadow-sm">
                <CardHeader className="text-center space-y-2">
                  <Mail className="w-8 h-8 mx-auto text-primary" />
                  <CardTitle>Email de Suporte</CardTitle>
                  <CardDescription>Resposta em até 24h úteis</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild className="w-full">
                    <a href="mailto:joao.antoniodavid@hotmail.com">
                      Enviar Email
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="text-center space-y-2">
                  <MessageCircle className="w-8 h-8 mx-auto text-primary" />
                  <CardTitle>Formulário de Contato</CardTitle>
                  <CardDescription>
                    Envie sua solicitação diretamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/contact">
                      Abrir Formulário
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
