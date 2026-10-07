import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KpiComparisonCard } from "./KpiComparisonCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      return `${key}:${options.rank ?? ""}:${options.total ?? ""}:${options.count ?? ""}`;
    },
  }),
}));

vi.mock("@/components/ui/ai-icon", () => ({
  AiIcon: () => <span>ai</span>,
}));

describe("KpiComparisonCard", () => {
  it("shows national and regional placement, including ties", () => {
    render(
      <KpiComparisonCard
        id="change"
        label="Annual emission change since 2015"
        value="-12.0%"
        valueClassName="text-orange-2"
        scopes={[
          {
            id: "national",
            label: "Nationally",
            pending: false,
            placement: { rank: 14, tiedWith: 1, total: 290 },
          },
          {
            id: "regional",
            label: "In Stockholm",
            pending: false,
            placement: { rank: 2, tiedWith: 3, total: 26 },
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Annual emission change since 2015"),
    ).toBeInTheDocument();
    expect(screen.getByText("-12.0%")).toBeInTheDocument();
    expect(screen.getByText("Nationally")).toBeInTheDocument();
    expect(screen.getByText("In Stockholm")).toBeInTheDocument();
    expect(
      screen.getByText("detailPage.kpiPlacement.rank:14:290:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("detailPage.kpiPlacement.tied:::2"),
    ).toBeInTheDocument();
  });
});
