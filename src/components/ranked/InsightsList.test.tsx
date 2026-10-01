import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InsightsList from "./InsightsList";

vi.mock("@/components/LocalizedLink", () => ({
  LocalizedLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: false,
    barDuration: 0.6,
    ease: [0.22, 1, 0.36, 1] as const,
  }),
}));

describe("InsightsList", () => {
  it("renders companies that share a name as separate rows", () => {
    render(
      <InsightsList
        title="Top companies"
        entities={[
          { id: "company-a", name: "Duni AB", value: 10 },
          { id: "company-b", name: "Duni AB", value: 20 },
        ]}
        dataPointKey="value"
        unit="%"
        totalCount={2}
        entityType="companies"
        nameKey="name"
        colorItem={() => "#ffffff"}
      />,
    );

    expect(screen.getAllByText("Duni AB")).toHaveLength(2);
  });

  it("grows ranking bars from the left when showBars is enabled", () => {
    const { container } = render(
      <InsightsList
        title="Top companies"
        entities={[{ id: "company-a", name: "Acme AB", value: 50 }]}
        dataPointKey="value"
        unit="%"
        totalCount={1}
        entityType="companies"
        nameKey="name"
        showBars
        colorItem={() => "#ffffff"}
      />,
    );

    const bar = container.querySelector(".group > .absolute");
    expect(bar?.getAttribute("style")).toContain("barGrowFromLeft");
    expect(bar?.getAttribute("style")).toContain("--insights-bar-width");
    expect(bar?.getAttribute("style")).toContain("600ms");
  });

  it("renders municipality links without bar animation styles when showBars is off", () => {
    const { container } = render(
      <InsightsList
        title="Top municipalities"
        entities={[{ name: "Stockholm", value: 10 }]}
        dataPointKey="value"
        unit="%"
        totalCount={1}
        entityType="municipalities"
        nameKey="name"
        colorItem={() => "#ffffff"}
      />,
    );

    expect(container.querySelector(".group > .absolute")).toBeNull();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/municipalities/stockholm",
    );
  });
});
