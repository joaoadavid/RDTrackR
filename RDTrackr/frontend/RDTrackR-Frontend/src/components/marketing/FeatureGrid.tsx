import {
  Package,
  BarChart3,
  Zap,
  AlertCircleIcon,
  MoveHorizontal,
  FileIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const features = [
  {
    icon: Package,
    title: "Catálogo rápido",
    description:
      "SKU, unidade, descrição e estoque mínimo com preenchimento assistido.",
  },
  {
    icon: BarChart3,
    title: "Relatórios em Tempo Real",
    description:
      "Visualize métricas importantes e tome decisões baseadas em dados atualizados.",
  },
  {
    icon: MoveHorizontal,
    title: "Movimentações",
    description:
      "Entradas e saídas com validações, histórico e saldo atualizado.",
  },
  {
    icon: Zap,
    title: "Performance Otimizada",
    description:
      "Sistema rápido e responsivo, construído com as melhores práticas de desenvolvimento.",
  },
  {
    icon: AlertCircleIcon,
    title: "Alertas de mínimo",
    description: "Receba avisos antes de faltar e priorize a reposição certa.",
  },
  {
    icon: FileIcon,
    title: "Importação CSV",
    description: "Suba seus itens e saldos por planilha, sem complicação",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20 lg:py-32">
      <Container>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            O painel de estoque que cresce com o seu negócio
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cadastre itens, registre entradas/saídas e receba alertas de mínimo
            em tempo real. Tudo rápido, simples e organizado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
