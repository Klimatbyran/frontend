import { render, screen } from "@testing-library/react";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ChartData } from "@/types/emissions";
import { OverviewChart } from "./OverviewChart";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/LanguageProvider", () => ({
  useLanguage: () => ({ currentLanguage: "en" }),
}));

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      isValidElement(children)
        ? cloneElement(children, { width: 800, height: 360 })
        : children,
  };
});

const currentYear = new Date().getFullYear();

const data: ChartData[] = [
  { year: 2021, total: 120, isAIGenerated: true },
  { year: 2023, total: 100, isAIGenerated: false },
];

const approximatedData: ChartData[] = [
  { year: currentYear, approximated: 90, carbonLaw: 70 },
  { year: currentYear + 1, approximated: 85, carbonLaw: 60 },
];

describe("company OverviewChart", () => {
  it("keeps AI marks out of the graph and labels the modelled tail", () => {
    const { container } = render(
      <OverviewChart
        data={data}
        chartEndYear={2050}
        setChartEndYear={() => undefined}
        shortEndYear={currentYear + 5}
        longEndYear={2050}
        approximatedData={approximatedData}
        onYearSelect={() => undefined}
      />,
    );

    expect(
      screen.queryByText("companies.emissionsHistory.aiGenerated"),
    ).toBeNull();
    expect(
      screen.getByText("companies.emissionsHistory.approximated"),
    ).toBeInTheDocument();
    expect(
      [...container.querySelectorAll("svg")].some((node) =>
        node.innerHTML.includes(">AI<"),
      ),
    ).toBe(false);
  });
});
