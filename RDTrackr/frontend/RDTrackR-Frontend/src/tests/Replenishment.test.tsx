/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import ReplenishmentInfo from "@/pages/ReplenishmentInfo";

// ============================
// 🔧 Mocks
// ============================

vi.mock("@/components/marketing/Header", () => ({
  Header: () => <div data-testid="mock-header" />,
}));

vi.mock("@/components/marketing/Footer", () => ({
  Footer: () => <div data-testid="mock-footer" />,
}));

// ✅ mock de asset precisa retornar { default: ... }
vi.mock("@/assets/replenishment-info.png", () => ({
  default: "replenishment-info.png",
}));

// ============================
// Helper
// ============================
const setup = () => {
  render(
    <MemoryRouter>
      <ReplenishmentInfo />
    </MemoryRouter>
  );
};

// ===========================================
// 🔹 Hero
// ===========================================
it("deve renderizar o hero com título, descrição e CTA principal", () => {
  setup();

  expect(
    screen.getByRole("heading", {
      name: /planejamento inteligente de reposição/i,
    })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      /mantenha seu estoque sempre no nível ideal com sugestões automáticas de compra/i
    )
  ).toBeInTheDocument();

  const ctaLink = screen.getByRole("link", {
    name: /começar gratuitamente/i,
  });
  expect(ctaLink).toBeInTheDocument();
  expect(ctaLink).toHaveAttribute("href", "/register");
});

// ===========================================
// 🔹 Cards de benefícios
// ===========================================
it("deve renderizar os três cards de benefícios com seus textos", () => {
  setup();

  expect(screen.getByText(/evite rupturas/i)).toBeInTheDocument();
  expect(
    screen.getByText(/reabasteça antes que o estoque acabe\./i)
  ).toBeInTheDocument();

  expect(screen.getByText(/lead time considerado/i)).toBeInTheDocument();
  expect(
    screen.getByText(/reposição calculada com base no tempo de entrega\./i)
  ).toBeInTheDocument();

  expect(screen.getByText(/baseado em consumo real/i)).toBeInTheDocument();
  expect(
    screen.getByText(/sugestões precisas com base no histórico\./i)
  ).toBeInTheDocument();
});

// ===========================================
// 🔹 Screenshot / imagem
// ===========================================
it("deve renderizar a imagem de screenshot com o alt correto", () => {
  setup();

  const img = screen.getByAltText(
    /dashboard rdtrackr - interface moderna de gestão empresarial/i
  );
  expect(img).toBeInTheDocument();
});

// ===========================================
// 🔹 CTA final
// ===========================================
it("deve renderizar o CTA final para registro", () => {
  setup();

  expect(
    screen.getByRole("heading", {
      name: /pronto para otimizar seu estoque\?/i,
    })
  ).toBeInTheDocument();

  const finalCta = screen.getByRole("link", {
    name: /começar agora/i,
  });

  expect(finalCta).toBeInTheDocument();
  expect(finalCta).toHaveAttribute("href", "/register");
});

// ===========================================
// 🔹 Renderiza Header e Footer (mocks)
// ===========================================
it("deve renderizar Header e Footer", () => {
  setup();

  expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
});
