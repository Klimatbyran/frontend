import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectorPieLegend from "./SectorPieLegend";
import type { PieChartItem } from "./SectorPieChart";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/LanguageProvider", () => ({
  useLanguage: () => ({ currentLanguage: "sv" }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    fadeDuration: 0,
    stagger: () => 0,
    ease: "linear",
  }),
}));

const data: PieChartItem[] = [
  { key: "15", name: "Materials", value: 1000, color: "#fff" },
  { key: "35", name: "Health Care", value: 500, color: "#aaa" },
];

describe("SectorPieLegend", () => {
  it("does not use pointer cursor when not interactive", () => {
    render(<SectorPieLegend data={data} total={1000} />);

    const row = screen.getByText("Materials").closest("div.flex");
    expect(row).toHaveClass("cursor-default");
    expect(row).not.toHaveClass("cursor-pointer");
  });

  it("uses pointer cursor when filtering is enabled", () => {
    render(
      <SectorPieLegend
        data={data}
        total={1000}
        onFilteredSectorsChange={() => {}}
      />,
    );

    const row = screen.getByText("Materials").closest("div.flex");
    expect(row).toHaveClass("cursor-pointer");
  });

  it("highlights the selected sector and dims the rest", () => {
    const { container } = render(
      <SectorPieLegend data={data} total={1500} highlightedKey="35" />,
    );

    const selected = screen.getByText("Health Care").closest("div.flex");
    const other = screen.getByText("Materials").closest("div.flex");

    expect(selected).toHaveAttribute("aria-current", "true");
    expect(selected).toHaveClass("bg-blue-5/40");
    expect(other).not.toHaveAttribute("aria-current");
    expect(other).toHaveStyle({ opacity: "0.4" });
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
  });
});
