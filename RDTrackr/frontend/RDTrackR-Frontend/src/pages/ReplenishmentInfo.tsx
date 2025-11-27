import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import replenishmentinfo from "@/assets/replenishment-info.png";
import { BarChart3, Layers, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReplenishmentInfo() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-24">
        <Container className="space-y-20">

          {/* HERO */}
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Planejamento Inteligente de Reposição
            </h1>
            <p className="text-muted-foreground text-lg">
              Mantenha seu estoque sempre no nível ideal com sugestões automáticas de compra
              baseadas em consumo, lead time e segurança.
            </p>
            <Button size="lg" className="mt-4" asChild>
              <Link to="/register">
                Começar gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </section>

          {/* BENEFICIOS */}
          <section className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Evite rupturas",
                desc: "Reabasteça antes que o estoque acabe."
              },
              {
                icon: Timer,
                title: "Lead Time considerado",
                desc: "Reposição calculada com base no tempo de entrega."
              },
              {
                icon: BarChart3,
                title: "Baseado em consumo real",
                desc: "Sugestões precisas com base no histórico."
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="text-center">
                  <CardHeader>
                    <Icon className="w-10 h-10 text-primary mx-auto mb-2" />
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.desc}
                  </CardContent>
                </Card>
              );
            })}
          </section>

          {/* SCREENSHOT */}
          <section className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Veja na prática</h2>
            <p className="text-muted-foreground text-lg">
              Você recebe recomendações automáticas baseadas em dados reais do estoque.
            </p>

            <div className="rounded-xl border shadow-lg overflow-hidden">
               <img
                src={replenishmentinfo}
                alt="Dashboard RdTrackR - Interface moderna de gestão empresarial"
                className="w-full h-auto rounded-lg"
                loading="eager"
              />
            </div>
           
          </section>

          {/* CTA FINAL */}
          <section className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Pronto para otimizar seu estoque?</h2>
            <Button size="lg" asChild>
              <Link to="/register">Começar agora</Link>
            </Button>
          </section>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
