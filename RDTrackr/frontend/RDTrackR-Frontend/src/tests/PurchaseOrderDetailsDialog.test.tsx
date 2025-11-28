import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { PurchaseOrderDetailsDialog } from "@/components/purchase-orders/PurchaseOrderDetailsDialog";

import {
  ResponsePurchaseOrderJson,
  ResponsePurchaseOrderItemJson,
} from "@/generated/apiClient";

describe("PurchaseOrderDetailsDialog", () => {
  const onOpenChangeMock = vi.fn();
  const onUpdateStatusMock = vi.fn();

  // Pedido padrão usado pela maioria dos testes
  const mockOrder = new ResponsePurchaseOrderJson({
    id: 1,
    number: "PO-250101-001",
    supplierName: "TechSupply Brasil",
    status: "APPROVED",
    createdOn: new Date("2025-01-01"),

    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Notebook Dell Inspiron 15",
        quantity: 2,
        unitPrice: 3500,
      }),
      new ResponsePurchaseOrderItemJson({
        productName: "Mouse Logitech M170",
        quantity: 1,
        unitPrice: 80,
      }),
      new ResponsePurchaseOrderItemJson({
        productName: "Monitor LG Ultrawide 29",
        quantity: 1,
        unitPrice: 950,
      }),
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar corretamente os detalhes do pedido", () => {
    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={mockOrder}
      />
    );

    // Título
    expect(screen.getByTestId("details-title")).toHaveTextContent(
      "Detalhes do Pedido"
    );

    // Itens da tabela
    expect(screen.getByText("Notebook Dell Inspiron 15")).toBeInTheDocument();
  });

  it("deve renderizar corretamente o status CANCELLED", () => {
    const cancelledOrder = new ResponsePurchaseOrderJson({
      ...mockOrder,
      status: "CANCELLED",
    });

    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={cancelledOrder}
      />
    );

    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });

  it("deve renderizar corretamente o status PENDING", () => {
    const pendingOrder = new ResponsePurchaseOrderJson({
      ...mockOrder,
      status: "PENDING",
    });

    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={pendingOrder}
      />
    );

    expect(screen.getByText("Pendente")).toBeInTheDocument();
  });

  it("deve renderizar corretamente o status DRAFT", () => {
    const draftOrder = new ResponsePurchaseOrderJson({
      ...mockOrder,
      status: "DRAFT",
    });

    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={draftOrder}
      />
    );

    expect(screen.getByText("Rascunho")).toBeInTheDocument();
  });

  it("deve exibir os itens da tabela corretamente", () => {
    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={mockOrder}
      />
    );

    expect(screen.getByText("Notebook Dell Inspiron 15")).toBeInTheDocument();
    expect(screen.getByText("Mouse Logitech M170")).toBeInTheDocument();
    expect(screen.getByText(/Monitor LG Ultrawide 29/)).toBeInTheDocument();

    // Subtotal aparece dentro da tabela
    expect(screen.getAllByText(/Subtotal/i).length).toBeGreaterThan(0);
  });

  it("deve fechar o dialog quando o botão 'Fechar' for clicado", async () => {
    const user = userEvent.setup();

    render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={mockOrder}
      />
    );

    await user.click(screen.getByRole("button", { name: /fechar/i }));

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });

  it("não deve renderizar nada se 'order' for null", () => {
    const { container } = render(
      <PurchaseOrderDetailsDialog
        open
        onOpenChange={onOpenChangeMock}
        onUpdateStatus={onUpdateStatusMock}
        order={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
