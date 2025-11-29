/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ControlsBar } from "@/components/inventory/ControlsBar";

const setup = () => {
  // mocks
  const onSearchChange = vi.fn();
  const onCategoryChange = vi.fn();
  const onWindowChange = vi.fn();
  const onSeasonalityChange = vi.fn();
  const onCoverageDaysChange = vi.fn();
  const onRecalculate = vi.fn();

  render(
    <ControlsBar
      searchTerm=""
      onSearchChange={onSearchChange}
      category="all"
      onCategoryChange={onCategoryChange}
      window={30}
      onWindowChange={onWindowChange}
      seasonality={0}
      onSeasonalityChange={onSeasonalityChange}
      coverageDays={0}
      onCoverageDaysChange={onCoverageDaysChange}
      onRecalculate={onRecalculate}
    />
  );

  return {
    onSearchChange,
    onCategoryChange,
    onWindowChange,
    onSeasonalityChange,
    onCoverageDaysChange,
    onRecalculate,
  };
};

describe("ControlsBar", () => {
  it("renderiza todos os campos corretamente", () => {
    setup();

    expect(screen.getByLabelText(/buscar produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/janela/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sazonalidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cobertura extra/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /recalcular/i })
    ).toBeInTheDocument();
  });

  it("seleciona categoria e dispara onCategoryChange", async () => {
    const { onCategoryChange } = setup();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/categoria/i);
    await user.click(select);

    const option = await screen.findByText(/matéria-prima/i);
    await user.click(option);

    expect(onCategoryChange).toHaveBeenCalledWith("Matéria-prima");
  });

  it("altera janela (window) e dispara onWindowChange", async () => {
    const { onWindowChange } = setup();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/janela/i);
    await user.click(select);

    await user.click(screen.getByText(/60 dias/i));

    expect(onWindowChange).toHaveBeenCalledWith(60);
  });

  it("altera sazonalidade e dispara onSeasonalityChange", async () => {
    const { onSeasonalityChange } = setup();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/sazonalidade/i);
    await user.click(select);

    await user.click(screen.getByText(/\+10%/i));

    expect(onSeasonalityChange).toHaveBeenCalledWith(10);
  });

  it("altera cobertura extra e dispara onCoverageDaysChange", async () => {
    const { onCoverageDaysChange } = setup();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/cobertura extra/i);
    await user.click(select);

    await user.click(screen.getByText(/7 dias/i));

    expect(onCoverageDaysChange).toHaveBeenCalledWith(7);
  });

  it("clicar em Recalcular dispara onRecalculate", async () => {
    const { onRecalculate } = setup();
    const user = userEvent.setup();

    const button = screen.getByRole("button", { name: /recalcular/i });

    await user.click(button);

    expect(onRecalculate).toHaveBeenCalledTimes(1);
  });
});
