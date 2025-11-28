/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Support from "@/pages/Support";

vi.mock("@/components/marketing/Header", () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock("@/components/marketing/Footer", () => ({
  Footer: () => <div data-testid="footer" />,
}));

describe("Support Page", () => {
  it("renders support page content", () => {
    render(
      <MemoryRouter>
        <Support />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /como podemos ajudar/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/central de suporte/i)).toBeInTheDocument();

    expect(screen.getByText(/status do sistema/i)).toBeInTheDocument();
    expect(
      screen.getByText(/sistema operando normalmente/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/email de suporte/i)).toBeInTheDocument();
    const emailButton = screen.getByText(/enviar email/i).closest("a");
    expect(emailButton).toHaveAttribute(
      "href",
      "mailto:joao.antoniodavid@hotmail.com"
    );

    expect(screen.getByText(/formulário de contato/i)).toBeInTheDocument();
    const formLink = screen.getByText(/abrir formulário/i).closest("a");
    expect(formLink).toHaveAttribute("href", "/contact");

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
