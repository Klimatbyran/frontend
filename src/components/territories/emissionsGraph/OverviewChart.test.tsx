import { render, screen } from "@testing-library/react";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { OverviewChart } from "./OverviewChart";
import type { DataPoint } from "@/types/emissions";

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

const projectedData: DataPoint[] = [
  {
    year: 2020,
    total: 100,
    isAIGenerated: true,
    trend: undefined,
    approximated: undefined,
    carbonLaw: undefined,
  },
  {
    year: 2022,
    total: 90,
    isAIGenerated: false,
    trend: undefined,
    approximated: undefined,
    carbonLaw: undefined,
  },
  {
    year: currentYear,
    total: undefined,
    approximated: 80,
    trend: 80,
    carbonLaw: 70,
  },
  {
    year: currentYear + 1,
    total: undefined,
    approximated: undefined,
    trend: 75,
    carbonLaw: 60,
  },
];

describe("territory OverviewChart", () => {
  it("keeps AI marks out of the graph and labels the modelled tail", () => {
    const { container } = render(
      <OverviewChart projectedData={projectedData} />,
    );

    expect(screen.queryByText("detailPage.graph.aiGenerated")).toBeNull();
    expect(screen.getByText("detailPage.graph.estimated")).toBeInTheDocument();
    expect(
      [...container.querySelectorAll("svg")].some((node) =>
        node.innerHTML.includes(">AI<"),
      ),
    ).toBe(false);
  });
});
