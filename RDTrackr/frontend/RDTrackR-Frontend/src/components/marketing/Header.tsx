import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useTheme } from "@/hooks/use-theme";
import LogoRDTrackR from "@/assets/LogoRDTrackR.svg";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { isAuthenticated, isRestoringSession, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/replenishment-info", label: "Planejamento de Reposição" },
    { href: "/contact", label: "Contato" },
    { href: "/support", label: "Suporte" },
  ];

  // ======================================
  // 🔥 Evitar flicker enquanto restaura sessão
  // ======================================
  if (isRestoringSession) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center bg-background/80 backdrop-blur-md border-b border-border animate-pulse">
        <span className="text-muted-foreground text-sm">Carregando...</span>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={LogoRDTrackR}
              alt="RDTrackR Logo"
              className="h-16 w-auto sm:h-20 md:h-24 object-contain -ml-1"
            />
          </Link>

          {/* LINKS - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link to={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>

          {/* AÇÕES - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon /> : <Sun />}
            </Button>

            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button asChild variant="default" size="lg">
                  <Link to="/register">Criar conta</Link>
                </Button>
                <Button asChild variant="default" size="lg">
                  <Link to="/login">Entrar</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Olá, <strong>{user?.name}</strong>
                </span>

                <Button asChild variant="default">
                  <Link to="/inventory">Entrar na aplicação</Link>
                </Button>

                <Button variant="outline" onClick={logout}>
                  Sair
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon /> : <Sun />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t bg-background/70 backdrop-blur-md rounded-b-2xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={link.href}>{link.label}</Link>
                </Button>
              ))}

              {!isAuthenticated ? (
                <>
                  <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/register">Criar Conta</Link>
                  </Button>
                </>
              ) : (
                <>
                  <span className="px-2">Olá, {user?.name}</span>

                  <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/inventory">Entrar na aplicação</Link>
                  </Button>

                  <Button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sair
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
