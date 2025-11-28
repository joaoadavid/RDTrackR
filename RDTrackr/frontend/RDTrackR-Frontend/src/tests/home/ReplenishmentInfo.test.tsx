/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ReplenishmentInfo from "@/pages/ReplenishmentInfo";

vi.mock("@/components/marketing/Header", () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock("@/components/marketing/Footer", () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock("@/assets/replenishment-info.png", () => ({
  default: "mocked-image.png",
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("ReplenishmentInfo Page", () => {
  it("renderiza título principal", () => {
    renderWithRouter(<ReplenishmentInfo />);
    expect(
      screen.getByText("Planejamento Inteligente de Reposição")
    ).toBeInTheDocument();
  });

  it("renderiza descrição inicial", () => {
    renderWithRouter(<ReplenishmentInfo />);
    expect(
      screen.getByText(/Mantenha seu estoque sempre no nível ideal/i)
    ).toBeInTheDocument();
  });

  it("renderiza botão 'Começar gratuitamente'", () => {
    renderWithRouter(<ReplenishmentInfo />);

    const btn = screen.getByRole("link", { name: /Começar gratuitamente/i });

    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("href")).toBe("/register");
  });

  it("renderiza os 3 cards", () => {
    renderWithRouter(<ReplenishmentInfo />);
    expect(screen.getByText("Evite rupturas")).toBeInTheDocument();
    expect(screen.getByText("Lead Time considerado")).toBeInTheDocument();
    expect(screen.getByText("Baseado em consumo real")).toBeInTheDocument();
  });

  it("renderiza a imagem mockada do dashboard", () => {
    renderWithRouter(<ReplenishmentInfo />);

    const img = screen.getByRole("img", {
      name: /interface moderna de gestão empresarial/i,
    });

    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("mocked-image.png");
  });

  it("renderiza CTA final", () => {
    renderWithRouter(<ReplenishmentInfo />);

    const btn = screen.getByRole("link", { name: /Começar agora/i });

    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("href")).toBe("/register");
  });

  it("renderiza Header e Footer", () => {
    renderWithRouter(<ReplenishmentInfo />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
