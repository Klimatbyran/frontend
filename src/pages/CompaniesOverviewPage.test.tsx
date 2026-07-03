import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { RankedCompany } from "@/types/company";
import { CompaniesOverviewPage } from "./CompaniesOverviewPage";

const MATERIALS_SECTOR = "15";
const HEALTHCARE_SECTOR = "35";

function createCompany(
  id: string,
  name: string,
  sectorCode: string,
): RankedCompany {
  return {
    id,
    name,
    wikidataId: `Q${id}`,
    baseYear: { year: 2019 },
    industry: {
      industryGics: {
        sectorCode,
      },
    },
    reportingPeriods: [
      {
        endDate: "2024-12-31",
        emissions: { calculatedTotalEmissions: 1000 },
      },
      {
        endDate: "2019-12-31",
        emissions: { calculatedTotalEmissions: 2000 },
      },
    ],
    metrics: {
      emissionsReduction: 50,
      displayReduction: "50.0",
    },
  } as RankedCompany;
}

const mockCompanies = [
  createCompany("1", "Duni AB", MATERIALS_SECTOR),
  createCompany("2", "Materials Two", MATERIALS_SECTOR),
  createCompany("3", "Materials Three", MATERIALS_SECTOR),
  createCompany("4", "Health One", HEALTHCARE_SECTOR),
  createCompany("5", "Health Two", HEALTHCARE_SECTOR),
  createCompany("6", "Health Three", HEALTHCARE_SECTOR),
];

const { mockKpiDefinitions, capturedTopLists } = vi.hoisted(() => ({
  mockKpiDefinitions: [
    {
      key: "emissionsChangeFromBaseYear",
      label: "emissionsChangeFromBaseYear",
      unit: "%",
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
      higherIsBetter: false,
      nullValues: "No data",
    },
  ],
  capturedTopLists: [] as string[][],
}));

vi.mock("@/hooks/companies/useCompanies", () => ({
  useCompanies: () => ({
    companies: mockCompanies,
    companiesLoading: false,
    companiesError: null,
  }),
}));

vi.mock("@/hooks/companies/useCompanyKPIs", () => ({
  useCompanyKPIs: () => mockKpiDefinitions,
  enrichCompanyWithKPIs: (company: RankedCompany) => ({
    ...company,
    emissionsChangeFromBaseYear: -50,
    meetsParis: true,
  }),
}));

vi.mock("@/hooks/useScreenSize", () => ({
  useScreenSize: () => ({ isMobile: false }),
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/ranked/KPIChipSelector", () => ({
  KPIChipSelector: () => <div data-testid="kpi-selector" />,
}));

vi.mock("@/components/ranked/OverviewSplitLayout", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/components/ranked/OverviewSplitLayout")
  >();

  return {
    ...actual,
    OverviewSplitLayout: ({
      visualization,
    }: {
      visualization: React.ReactNode;
    }) => <div data-testid="visualization">{visualization}</div>,
  };
});

vi.mock("@/components/ranked/RankedList", () => ({
  default: () => <div data-testid="ranked-list" />,
}));

vi.mock("@/components/companies/rankedList/CompanyKPIVisualization", () => ({
  CompanyKPIVisualization: () => <div data-testid="kpi-visualization" />,
}));

vi.mock("@/components/companies/rankedList/IndustryFilter", () => ({
  IndustryFilter: ({
    availableSectors,
    selectedSector,
    onSectorChange,
  }: {
    availableSectors: string[];
    selectedSector: string | null;
    onSectorChange: (sector: string) => void;
  }) => (
    <div>
      {availableSectors.map((sector) => (
        <button
          key={sector}
          type="button"
          aria-pressed={selectedSector === sector}
          onClick={() => onSectorChange(sector)}
        >
          {sector}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/companies/rankedList/CompanyInsightsPanel", () => ({
  default: ({
    companyData,
    section,
  }: {
    companyData: Array<{
      name: string;
      industry?: { industryGics?: { sectorCode?: string } };
    }>;
    section?: string;
  }) => {
    if (section === "top") {
      capturedTopLists.push(companyData.map((company) => company.name));
    }

    return <div data-testid={`insights-${section}`} />;
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

describe("CompaniesOverviewPage", () => {
  beforeEach(() => {
    capturedTopLists.length = 0;
  });

  it("keeps the top insights list scoped to the selected sector when switching", async () => {
    render(
      <MemoryRouter initialEntries={["/en/companies?sector=15"]}>
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

    await waitFor(() => {
      expect(capturedTopLists.at(-1)).toEqual([
        "Duni AB",
        "Materials Two",
        "Materials Three",
      ]);
    });

    fireEvent.click(screen.getByRole("button", { name: HEALTHCARE_SECTOR }));

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        `sector=${HEALTHCARE_SECTOR}`,
      );
    });

    await waitFor(() => {
      expect(capturedTopLists.at(-1)).toEqual([
        "Health One",
        "Health Two",
        "Health Three",
      ]);
    });

    expect(capturedTopLists.at(-1)).not.toContain("Duni AB");
  });

  it("preserves the sector from the URL after company data loads", async () => {
    render(
      <MemoryRouter initialEntries={["/en/companies?sector=35"]}>
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

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sector=35",
      );
    });

    expect(
      screen.getByRole("button", { name: HEALTHCARE_SECTOR }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
