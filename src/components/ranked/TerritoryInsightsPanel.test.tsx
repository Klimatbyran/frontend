import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import type { KPIValue } from "@/types/rankings";
import type { Region } from "@/types/region";
import { TerritoryInsightsPanel } from "./TerritoryInsightsPanel";

vi.mock("@/components/LocalizedLink", () => ({
  LocalizedLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}));

const emissionsKpi = {
  label: "Utsläppen",
  key: "historicalEmissionChangePercent",
  unit: "%",
  source: "",
  sourceUrls: [],
  description: "",
  detailedDescription: "",
  higherIsBetter: false,
} as KPIValue<Region>;

beforeAll(async () => {
  await i18n.changeLanguage("sv");
});

describe("TerritoryInsightsPanel", () => {
  it("keeps the municipality empty-state copy", () => {
    render(
      <TerritoryInsightsPanel
        entities={[]}
        selectedKPI={emissionsKpi}
        entityType="municipalities"
        translationPrefix="municipalities.list"
        section="top"
      />,
    );

    expect(
      screen.getByText("Ingen kommundata tillgänglig"),
    ).toBeInTheDocument();
  });

  it("falls back to the generic empty state for regions", () => {
    render(
      <TerritoryInsightsPanel
        entities={[]}
        selectedKPI={emissionsKpi}
        entityType="regions"
        translationPrefix="regions.list"
        section="top"
      />,
    );

    expect(screen.getByText("Ingen data tillgänglig")).toBeInTheDocument();
  });

  it("ranks regions with the shared list and links to the region page", () => {
    const regions: Region[] = [
      {
        id: "västra götaland",
        name: "Västra Götaland",
        emissions: null,
        historicalEmissionChangePercent: -12,
        meetsParis: true,
      },
      {
        id: "stockholm",
        name: "Stockholm",
        emissions: null,
        historicalEmissionChangePercent: 4,
        meetsParis: false,
      },
    ];

    render(
      <TerritoryInsightsPanel
        entities={regions}
        selectedKPI={emissionsKpi}
        entityType="regions"
        translationPrefix="regions.list"
        section="top"
        listDescription="Lägst utsläppsökning"
      />,
    );

    expect(screen.getByRole("heading", { name: "Topp 2 län" })).toBeVisible();
    expect(screen.getByText("Lägst utsläppsökning")).toBeVisible();
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/regions/västra götaland");
    expect(links[0]).toHaveTextContent("Västra Götaland");
    expect(links[1]).toHaveTextContent("Stockholm");
  });
});
