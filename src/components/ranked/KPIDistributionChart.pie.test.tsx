import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { KPIDistributionChart } from "./KPIDistributionChart";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/rankings";

beforeAll(() => {
  class RO {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", RO);
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) =>
      opts?.defaultValue ?? key,
  }),
}));

vi.mock("@/components/LanguageProvider", () => ({
  useLanguage: () => ({ currentLanguage: "sv" }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    pieDuration: 0,
    barDuration: 0,
    reduceMotion: true,
  }),
}));

const regionData: Region[] = Array.from({ length: 21 }, (_, i) => ({
  id: String(i),
  name: `Region ${i}`,
  emissions: null,
  historicalEmissionChangePercent: -3 + i * 0.3,
  meetsParis: i === 0,
}));

const meetsParisKPI: KPIValue<Region> = {
  label: "Paris",
  key: "meetsParis",
  unit: "",
  description: "",
  detailedDescription: "",
  higherIsBetter: true,
  isBoolean: true,
  booleanLabels: { true: "Yes", false: "No" },
  source: "",
  sourceUrls: [],
};

const emissionsKPI: KPIValue<Region> = {
  label: "Emissions",
  key: "historicalEmissionChangePercent",
  unit: "%",
  description: "",
  detailedDescription: "",
  higherIsBetter: false,
  source: "",
  sourceUrls: [],
};

describe("KPIDistributionChart", () => {
  it("renders visible sectors for region meetsParis data", () => {
    const { container } = render(
      <div style={{ width: 400, height: 400 }}>
        <KPIDistributionChart
          data={regionData}
          selectedKPI={meetsParisKPI}
          translationPrefix="regions.list"
        />
      </div>,
    );

    expect(container.querySelectorAll(".recharts-surface path").length).toBe(2);
  });

  it("renders histogram bars for region emissions data", () => {
    const { container } = render(
      <div style={{ width: 400, height: 240 }}>
        <KPIDistributionChart
          data={regionData}
          selectedKPI={emissionsKPI}
          average={-1.4}
          translationPrefix="regions.list"
        />
      </div>,
    );

    expect(container.textContent).toContain(
      "municipalities.list.insights.distribution.higherBetter",
    );
  });
});
