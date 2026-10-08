import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IndustryEmissionsPie } from "./IndustryEmissionsPie";
import type { IndustryBreakdownRow } from "@/hooks/companies/parisOverviewUtils";

const chartProps = vi.fn();
const legendProps = vi.fn();

vi.mock("@/components/charts/sectorChart/SectorPieChart", () => ({
  default: (props: Record<string, unknown>) => {
    chartProps(props);
    return <div data-testid="sector-pie-chart" />;
  },
}));

vi.mock("@/components/charts/sectorChart/SectorPieLegend", () => ({
  default: (props: Record<string, unknown>) => {
    legendProps(props);
    return <div data-testid="sector-pie-legend" />;
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    fadeDuration: 0,
    stagger: () => 0,
    ease: "linear",
  }),
}));

vi.mock("@/hooks/companies/useCompanySectors", () => ({
  useSectorNames: () => ({
    "15": "Materials",
    "35": "Health Care",
  }),
}));

const rows: IndustryBreakdownRow[] = [
  {
    code: "15",
    emissions: 1000,
    companyCount: 2,
  },
  {
    code: "35",
    emissions: 500,
    companyCount: 2,
  },
];

describe("IndustryEmissionsPie", () => {
  it("renders a read-only pie and legend (no sector filter clicks)", () => {
    chartProps.mockClear();
    legendProps.mockClear();

    render(<IndustryEmissionsPie rows={rows} selected={null} />);

    expect(chartProps).toHaveBeenCalled();
    expect(legendProps).toHaveBeenCalled();

    const chartCall = chartProps.mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    const legendCall = legendProps.mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;

    expect(chartCall.onItemClick).toBeUndefined();
    expect(chartCall.customActionLabel).toBeUndefined();
    expect(legendCall.onItemClick).toBeUndefined();
    expect(legendCall.getActionTooltip).toBeUndefined();
  });

  it("colours each sector with its own colour, sized by emissions", () => {
    chartProps.mockClear();

    render(<IndustryEmissionsPie rows={rows} selected={null} />);

    const chartCall = chartProps.mock.calls.at(-1)?.[0] as {
      data: Array<{ key: string; value: number; color: string }>;
    };

    expect(chartCall.data).toEqual([
      { key: "15", name: "Materials", value: 1000, color: "var(--blue-4)" },
      { key: "35", name: "Health Care", value: 500, color: "var(--blue-3)" },
    ]);
    expect(
      screen.queryByText("companiesOverviewPage.paris.rampLow"),
    ).toBeNull();
  });
});
