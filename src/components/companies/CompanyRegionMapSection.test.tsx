import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import "@/i18n";
import type { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { CompanyRegionMapSection } from "./CompanyRegionMapSection";

vi.mock("@/hooks/regions/useRegionsForExplore", () => ({
  useRegionsForExplore: () => ({
    regions: [
      {
        name: "Skåne län",
        logoUrl: null,
        emissions: { "2023": 200 },
        meetsParis: false,
        historicalEmissionChangePercent: -1,
        municipalityCount: 33,
      },
      {
        name: "Stockholms län",
        logoUrl: null,
        emissions: { "2023": 800 },
        meetsParis: false,
        historicalEmissionChangePercent: -1,
        municipalityCount: 26,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: ({
    data,
    onAreaClick,
  }: {
    data: { name: string }[];
    onAreaClick?: (id: string) => void;
  }) => (
    <div>
      {data.map((item) => (
        <button
          key={item.name}
          type="button"
          onClick={() => onAreaClick?.(item.name)}
        >
          {item.name}
        </button>
      ))}
    </div>
  ),
}));

const companies = [
  {
    id: "1",
    name: "Skånebolaget",
    wikidataId: "Q1",
    tags: ["sweden"],
    municipality: "Malmö",
    reportingPeriods: [
      {
        endDate: "2024-12-31",
        emissions: { calculatedTotalEmissions: 50 },
      },
    ],
    metrics: { emissionsReduction: 0, displayReduction: "0" },
  } as CompanyWithKPIs,
];

describe("CompanyRegionMapSection", () => {
  it("shows the regional comparison when a county is selected", () => {
    render(
      <MemoryRouter>
        <CompanyRegionMapSection companies={companies} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Företagsrapporter och territoriella utsläpp",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Inga företag placerade")).toBeInTheDocument();
    expect(screen.getByText(/800/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skåne" }));

    expect(screen.getByText("1 företag")).toBeInTheDocument();
    expect(screen.getByText(/rapporterar 50 ton CO₂e/)).toBeInTheDocument();
    expect(screen.getByText(/200 ton CO₂e 2023/)).toBeInTheDocument();
  });
});
