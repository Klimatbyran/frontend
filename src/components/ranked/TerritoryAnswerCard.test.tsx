import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TerritoryAnswerCard } from "./TerritoryAnswerCard";
import type { KPIValue } from "@/types/rankings";

vi.mock("i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("i18next")>();
  return {
    ...actual,
    t: (key: string) => key,
  };
});

vi.mock("@/components/LocalizedLink", () => ({
  LocalizedLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { metric?: string }) =>
      options?.metric ? `${key}:${options.metric}` : key,
  }),
}));

type Row = { name: string; change: number };

const kpi: KPIValue<Row> = {
  label: "Emissions change",
  key: "change",
  unit: "%",
  source: "source.label",
  sourceUrls: ["https://example.com"],
  description: "Emissions change",
  detailedDescription: "How much emissions have changed.",
  higherIsBetter: false,
};

describe("TerritoryAnswerCard", () => {
  it("colors the average with the map legend midpoint", () => {
    render(
      <TerritoryAnswerCard
        entities={[
          { name: "Alpha", change: -4 },
          { name: "Beta", change: 0 },
        ]}
        selectedKPI={kpi}
        entityType="municipalities"
        translationPrefix="municipalities.list"
      />,
    );

    const average = screen.getByText("−2.0%");
    expect(average.style.color).toBe(
      "color-mix(in srgb, var(--pink-4) 0%, var(--pink-3) 100%)",
    );
  });

  it("paints the above/below average bar and legends pink and blue", () => {
    const { container } = render(
      <TerritoryAnswerCard
        entities={[
          { name: "Alpha", change: -4 },
          { name: "Beta", change: 0 },
          { name: "Gamma", change: 2 },
        ]}
        selectedKPI={kpi}
        entityType="municipalities"
        translationPrefix="municipalities.list"
      />,
    );

    const barSegments = container.querySelectorAll(
      ".flex.h-3.overflow-hidden.rounded-full > div",
    );
    expect(barSegments).toHaveLength(2);
    expect(barSegments[0]).toHaveStyle({ backgroundColor: "var(--blue-3)" });
    expect(barSegments[1]).toHaveStyle({ backgroundColor: "var(--pink-3)" });

    const legendDots = container.querySelectorAll(
      "span.inline-block.size-2\\.5",
    );
    expect(legendDots).toHaveLength(2);
    expect(legendDots[0]).toHaveStyle({ backgroundColor: "var(--blue-3)" });
    expect(legendDots[1]).toHaveStyle({ backgroundColor: "var(--pink-3)" });
  });

  it("makes the above and below shares add up to 100", () => {
    render(
      <TerritoryAnswerCard
        entities={[
          { name: "A", change: -10 },
          { name: "B", change: -10 },
          { name: "C", change: -10 },
          { name: "D", change: -10 },
          { name: "E", change: -10 },
          { name: "F", change: 10 },
          { name: "G", change: 10 },
          { name: "H", change: 10 },
        ]}
        selectedKPI={kpi}
        entityType="municipalities"
        translationPrefix="municipalities.list"
      />,
    );

    expect(screen.getByText("(63%)")).toBeInTheDocument();
    expect(screen.getByText("(37%)")).toBeInTheDocument();
    expect(screen.queryByText("(38%)")).not.toBeInTheDocument();
  });
});
