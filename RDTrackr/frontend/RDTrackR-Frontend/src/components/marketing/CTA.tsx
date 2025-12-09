import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useEnterApp } from "@/hooks/useEnterApp";

export function CTA() {
  const { enterApp } = useEnterApp();

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <Container>
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já estão gerenciando seus
            negócios com mais eficiência e autonomia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="default" size="lg" asChild>
              <Link to="/register">
                Começar agora gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <Button variant="default" size="lg" onClick={enterApp}>
              Entrar na aplicação
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
