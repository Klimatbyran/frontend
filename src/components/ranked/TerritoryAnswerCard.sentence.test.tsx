import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { TerritoryAnswerCard } from "./TerritoryAnswerCard";
import type { KPIValue } from "@/types/rankings";

vi.mock("@/components/LocalizedLink", () => ({
  LocalizedLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}));

type Row = { name: string; meets: boolean };

const kpi: KPIValue<Row> = {
  label: "Paris Agreement",
  key: "meets",
  unit: "",
  source: "source.label",
  sourceUrls: ["https://example.com"],
  description: "Emissions trend compared to the Paris Agreement",
  detailedDescription: "Which places are on track?",
  higherIsBetter: true,
  isBoolean: true,
  booleanLabels: { true: "Meets", false: "Misses" },
  aboveString: "are on track to meet the Paris Agreement",
};

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("TerritoryAnswerCard boolean sentence", () => {
  it("uses a singular verb when one place is on track", () => {
    render(
      <TerritoryAnswerCard
        entities={[
          { name: "Only", meets: true },
          { name: "Other", meets: false },
        ]}
        selectedKPI={kpi}
        entityType="regions"
        translationPrefix="regions.list"
      />,
    );

    expect(
      screen.getByText(
        "1 of 2 regions is on track to meet the Paris Agreement",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the plural verb when more than one place is on track", () => {
    render(
      <TerritoryAnswerCard
        entities={[
          { name: "One", meets: true },
          { name: "Two", meets: true },
        ]}
        selectedKPI={kpi}
        entityType="municipalities"
        translationPrefix="municipalities.list"
      />,
    );

    expect(
      screen.getByText(
        "2 of 2 municipalities are on track to meet the Paris Agreement",
      ),
    ).toBeInTheDocument();
  });
});
