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
    expect(screen.getByText("#14")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(
      screen.getByText("detailPage.kpiPlacement.rankOf::290:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("detailPage.kpiPlacement.rankOf::26:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("detailPage.kpiPlacement.tied:::2"),
    ).toBeInTheDocument();
  });

  it("shows how a yes or no result is split across the dataset", () => {
    render(
      <KpiComparisonCard
        id="meetsParis"
        label="Meets the Paris Agreement"
        value="Yes"
        comparison="distribution"
        distributionChart="pie"
        scopes={[
          {
            id: "national",
            label: "Nationally",
            pending: false,
            placement: null,
            distribution: {
              total: 6,
              buckets: [
                {
                  id: "yes",
                  label: "Yes",
                  count: 4,
                  tone: "good",
                  active: true,
                },
                {
                  id: "no",
                  label: "No",
                  count: 2,
                  tone: "poor",
                  active: false,
                },
              ],
            },
          },
          {
            id: "regional",
            label: "In Stockholm",
            pending: false,
            placement: null,
            distribution: {
              total: 3,
              buckets: [
                {
                  id: "yes",
                  label: "Yes",
                  count: 2,
                  tone: "good",
                  active: true,
                },
                {
                  id: "no",
                  label: "No",
                  count: 1,
                  tone: "poor",
                  active: false,
                },
              ],
            },
          },
        ]}
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Nationally")).toBeInTheDocument();
    expect(screen.getByText("In Stockholm")).toBeInTheDocument();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("67%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
  });
});
