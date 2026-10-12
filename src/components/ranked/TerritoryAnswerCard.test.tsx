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
});
