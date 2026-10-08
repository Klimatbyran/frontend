import { render } from "@testing-library/react";
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
    onTrackShare: 0.5,
  },
  {
    code: "35",
    emissions: 500,
    companyCount: 2,
    onTrackShare: 0.25,
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
    expect(chartCall.highlightedKey).toBeNull();
    expect(legendCall.onItemClick).toBeUndefined();
    expect(legendCall.getActionTooltip).toBeUndefined();
    expect(legendCall.highlightedKey).toBeNull();
  });

  it("highlights the selected sector without dropping the others", () => {
    chartProps.mockClear();
    legendProps.mockClear();

    render(<IndustryEmissionsPie rows={rows} selected="35" />);

    const chartCall = chartProps.mock.calls.at(-1)?.[0] as {
      highlightedKey?: string | null;
      data?: Array<{ key: string }>;
    };
    const legendCall = legendProps.mock.calls.at(-1)?.[0] as {
      highlightedKey?: string | null;
      data?: Array<{ key: string }>;
    };

    expect(chartCall.highlightedKey).toBe("35");
    expect(legendCall.highlightedKey).toBe("35");
    expect(chartCall.data?.map((item) => item.key)).toEqual(["15", "35"]);
    expect(legendCall.data?.map((item) => item.key)).toEqual(["15", "35"]);
  });
});
