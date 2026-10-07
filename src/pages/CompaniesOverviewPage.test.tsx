import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { RankedCompany } from "@/types/company";
import { CompaniesOverviewPage } from "./CompaniesOverviewPage";

const MATERIALS_SECTOR = "15";
const HEALTHCARE_SECTOR = "35";

function createCompany(
  id: string,
  name: string,
  sectorCode: string,
  tags: string[],
  meetsParis: boolean | null,
): RankedCompany {
  return {
    id,
    name,
    wikidataId: `Q${id}`,
    tags,
    baseYear: { year: 2019 },
    industry: { industryGics: { sectorCode } },
    reportingPeriods: [
      { endDate: "2024-12-31", emissions: { calculatedTotalEmissions: 1000 } },
      { endDate: "2019-12-31", emissions: { calculatedTotalEmissions: 2000 } },
    ],
    metrics: { emissionsReduction: 50, displayReduction: "50.0" },
    meetsParis,
  } as unknown as RankedCompany;
}

const mockCompanies = [
  createCompany("1", "Duni AB", MATERIALS_SECTOR, ["sweden"], true),
  createCompany("2", "Materials Two", MATERIALS_SECTOR, ["sweden"], false),
  createCompany("3", "Health One", HEALTHCARE_SECTOR, ["sweden"], true),
  createCompany("4", "Health Two", HEALTHCARE_SECTOR, ["sweden"], false),
  createCompany("5", "Oslo Corp", MATERIALS_SECTOR, ["norway"], true),
];

const { capturedLists } = vi.hoisted(() => ({
  capturedLists: [] as string[][],
}));

vi.mock("@/hooks/companies/useCompanies", () => ({
  useCompanies: () => ({
    companies: mockCompanies,
    companiesLoading: false,
    companiesError: null,
  }),
}));

// The page reads meetsParis straight off the enriched company, so the fixture
// carries the verdict and enrichment just passes it through.
vi.mock("@/hooks/companies/useCompanyKPIs", () => ({
  useCompanyKPIs: () => [],
  enrichCompanyWithKPIs: (company: RankedCompany) => ({
    ...company,
    emissionsChangeFromBaseYear: -50,
  }),
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/companies/overview/IndustryEmissionsPie", () => ({
  IndustryEmissionsPie: () => <div data-testid="industry-pie" />,
}));

vi.mock("@/components/ranked/InsightsList", () => ({
  default: () => <div data-testid="insights-list" />,
}));

vi.mock("@/components/companies/overview/CompaniesTable", () => ({
  CompaniesTable: ({ companies }: { companies: Array<{ name: string }> }) => {
    capturedLists.push(companies.map((company) => company.name));
    return <div data-testid="companies-table" />;
  },
}));

vi.mock("@/hooks/regions/useRegionsForExplore", () => ({
  useRegionsForExplore: () => ({
    regions: [],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: () => <div data-testid="sweden-company-map" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/en/companies"
          element={
            <>
              <CompaniesOverviewPage />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CompaniesOverviewPage", () => {
  beforeEach(() => {
    capturedLists.length = 0;
  });

  it("shows only Swedish companies", async () => {
    renderPage("/en/companies");

    await waitFor(() => {
      expect(capturedLists.at(-1)).toEqual([
        "Duni AB",
        "Materials Two",
        "Health One",
        "Health Two",
      ]);
    });
    expect(capturedLists.at(-1)).not.toContain("Oslo Corp");
  });

  it("scopes the page to an industry picked from the chips", async () => {
    renderPage("/en/companies");

    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.showMore/,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /sector\.healthCare\.name/ }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        `sector=${HEALTHCARE_SECTOR}`,
      );
    });
    await waitFor(() => {
      expect(capturedLists.at(-1)).toEqual(["Health One", "Health Two"]);
    });
  });

  it("preserves the industry from the URL after company data loads", async () => {
    renderPage(`/en/companies?sector=${MATERIALS_SECTOR}`);

    await waitFor(() => {
      expect(capturedLists.at(-1)).toEqual(["Duni AB", "Materials Two"]);
    });
    expect(
      screen.getByRole("button", { name: /sector\.materials\.name/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the county map under the company list", async () => {
    renderPage("/en/companies");

    expect(
      await screen.findByRole("heading", {
        name: "companiesOverviewPage.regionMap.title",
      }),
    ).toBeInTheDocument();
  });
});
