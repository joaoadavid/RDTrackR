import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { useEnterApp } from "@/hooks/useEnterApp";
import dashboardHero from "@/assets/dashboard.png";

export function Hero() {
  const { enterApp } = useEnterApp();

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-10" />

      <Container>
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-2 px-4 py-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Administre com autonomia total</span>
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Administre tudo com{" "}
            <span className="text-gradient">velocidade e autonomia</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gerencie seu negócio de forma simples e poderosa.
          </p>
        </div>

        <div className="mt-16 lg:mt-24 animate-fade-in">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10" />
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-2 shadow-2xl">
              <img
                src={dashboardHero}
                alt="Dashboard RdTrackR - Interface moderna de gestão empresarial"
                className="w-full h-auto rounded-lg"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
