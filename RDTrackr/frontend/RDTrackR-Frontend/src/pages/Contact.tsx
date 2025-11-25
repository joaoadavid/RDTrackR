import { useState } from "react";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { RequestContactJson } from "@/generated/apiClient";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.contact(
        new RequestContactJson({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        })
      );

      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Entre em contato
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tem alguma dúvida? Preencha o formulário abaixo ou entre em
                contato através das outras opções.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                  <CardDescription>
                    <a
                      href="mailto:joao.antoniodavid@hotmail.com"
                      className="hover:text-primary transition-colors"
                    >
                      rdtrackr@outlook.com
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Telefone</CardTitle>
                  <CardDescription>
                    <a
                      href="tel:+5547996394983"
                      className="hover:text-primary transition-colors"
                    >
                      +55 (47) 996394983
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Endereço</CardTitle>
                  <CardDescription>
                    Joinville, SC
                    <br />
                    Brasil
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Envie sua mensagem</CardTitle>
                <CardDescription>
                  Responderemos em até 24 horas úteis
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Como podemos ajudar?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Descreva sua dúvida ou solicitação..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
