import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import PurchaseOrderDetailsDialog from "@/components/purchase-orders/PurchaseOrderDetailsDialog";

import {
  ResponsePurchaseOrderJson,
  ResponsePurchaseOrderItemJson,
} from "@/generated/apiClient";

// Mock do toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Helper para criar pedidos reais usando o modelo do NSwag
function makeOrder(overrides?: Partial<ResponsePurchaseOrderJson>) {
  return new ResponsePurchaseOrderJson({
    id: 1,
    number: "PO-001",
    createdOn: new Date("2024-01-10"),
    supplierName: "Fornecedor XPTO",
    status: "DRAFT",

    items: [
      new ResponsePurchaseOrderItemJson({
        productName: "Produto A",
        quantity: 2,
        unitPrice: 10,
      }),
      new ResponsePurchaseOrderItemJson({
        productName: "Produto B",
        quantity: 1,
        unitPrice: 5,
      }),
    ],

    ...overrides,
  });
}

describe("PurchaseOrderDetailsDialog", () => {
  it("não renderiza quando order é null", () => {
    const { container } = render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza informações gerais do pedido", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder()}
      />
    );

    expect(screen.getByText("Detalhes do Pedido")).toBeInTheDocument();
    expect(screen.getByText("PO-001")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor XPTO")).toBeInTheDocument();
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
  });

  it("renderiza itens corretamente", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder()}
      />
    );

    expect(screen.getByText("Produto A")).toBeInTheDocument();
    expect(screen.getByText("Produto B")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 10,00").length).toBeGreaterThan(0);
  });

  it("calcula o total corretamente", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder()}
      />
    );

    // Total de (2×10) + (1×5) = 25,00
    expect(screen.getByText("R$ 25,00")).toBeInTheDocument();
  });

  it("mostra ações corretas quando status = DRAFT", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder({ status: "DRAFT" })}
      />
    );

    expect(screen.getByText("Enviar para Aprovação")).toBeInTheDocument();
    expect(screen.getByText("Cancelar Pedido")).toBeInTheDocument();
  });

  it("mostra ações corretas quando status = PENDING", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder({ status: "PENDING" })}
      />
    );

    expect(screen.getByText("Aprovar Pedido")).toBeInTheDocument();
    expect(screen.getByText("Cancelar Pedido")).toBeInTheDocument();
  });

  it("mostra ação quando status = APPROVED", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder({ status: "APPROVED" })}
      />
    );

    expect(screen.getByText("Marcar como Recebido")).toBeInTheDocument();
  });

  it("mostra mensagem final quando status = RECEIVED", () => {
    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={vi.fn()}
        onUpdateStatus={vi.fn()}
        order={makeOrder({ status: "RECEIVED" })}
      />
    );

    expect(
      screen.getByText("Este pedido já foi finalizado.")
    ).toBeInTheDocument();
  });

  it("chama onUpdateStatus e fecha ao enviar para aprovação", async () => {
    const user = userEvent.setup();

    const onOpenChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={onOpenChange}
        onUpdateStatus={onUpdateStatus}
        order={makeOrder({ status: "DRAFT" })}
      />
    );

    await user.click(screen.getByText("Enviar para Aprovação"));

    expect(onUpdateStatus).toHaveBeenCalledWith(1, "PENDING");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("botão fechar fecha o diálogo", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <PurchaseOrderDetailsDialog
        open={true}
        onOpenChange={onOpenChange}
        onUpdateStatus={vi.fn()}
        order={makeOrder()}
      />
    );

    await user.click(screen.getByText("Fechar"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
