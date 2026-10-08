import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { PageCompanyOverviewItem } from "@/types/pages";
import { CompaniesOverviewPage } from "./CompaniesOverviewPage";

const MATERIALS_SECTOR = "15";
const HEALTHCARE_SECTOR = "35";

const {
  mockCompanies,
  buildSummary,
  capturedLists,
  capturedPieSectors,
  capturedPieSelected,
} = vi.hoisted(() => {
  const MATERIALS = "15";
  const HEALTHCARE = "35";

  function createCompany(
    id: string,
    name: string,
    sectorCode: string,
    meetsParis: boolean | null,
  ): PageCompanyOverviewItem {
    return {
      id,
      name,
      wikidataId: `Q${id}`,
      tags: ["sweden"],
      logoUrl: null,
      sectorCode,
      industryGroupCode: null,
      baseYear: 2019,
      meetsParis,
      emissionsChangeFromBaseYear: -50,
      latestYear: 2024,
      latestTotalEmissions: 1000,
    };
  }

  const companies = [
    createCompany("1", "Duni AB", MATERIALS, true),
    createCompany("2", "Materials Two", MATERIALS, false),
    createCompany("3", "Health One", HEALTHCARE, true),
    createCompany("4", "Health Two", HEALTHCARE, false),
  ];

  function summaryFor(sector: string | null) {
    const inView = sector
      ? companies.filter((company) => company.sectorCode === sector)
      : companies;
    const judged = inView.filter((c) => typeof c.meetsParis === "boolean");
    const onTrack = judged.filter((c) => c.meetsParis === true).length;
    return {
      paris: {
        total: inView.length,
        onTrack,
        offTrack: judged.length - onTrack,
        unknown: inView.length - judged.length,
        onTrackPercent: inView.length
          ? Math.round((onTrack / inView.length) * 100)
          : 0,
      },
      reporting: {
        total: inView.length,
        enough: judged.length,
        tooLittle: inView.length - judged.length,
      },
      industries: [],
      industryFilters: [
        {
          code: MATERIALS,
          companyCount: 2,
          emissions: 2000,
          onTrackShare: 50,
        },
        {
          code: HEALTHCARE,
          companyCount: 2,
          emissions: 2000,
          onTrackShare: 50,
        },
      ],
      companyCount: companies.length,
      doingWell: [],
      fallingBehind: [],
      parisDots: judged.map((company) => ({
        id: company.id,
        wikidataId: company.wikidataId,
        name: company.name,
        onTrack: company.meetsParis === true,
      })),
    };
  }

  return {
    mockCompanies: companies,
    buildSummary: summaryFor,
    capturedLists: [] as string[][],
    capturedPieSectors: [] as string[][],
    capturedPieSelected: [] as Array<string | null>,
  };
});

vi.mock("@/hooks/pages/usePageCompaniesOverview", () => ({
  usePageCompaniesOverviewList: (options?: { sector?: string | null }) => ({
    companies: options?.sector
      ? mockCompanies.filter((company) => company.sectorCode === options.sector)
      : mockCompanies,
    loading: false,
    error: null,
  }),
  usePageCompaniesOverviewSummary: (options?: { sector?: string | null }) => ({
    summary: buildSummary(options?.sector ?? null),
    loading: false,
    error: null,
  }),
  usePageCompaniesOverviewChrome: () => ({
    summary: buildSummary(null),
    loading: false,
    error: null,
  }),
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/companies/overview/IndustryEmissionsPie", () => ({
  IndustryEmissionsPie: ({
    rows,
    selected,
  }: {
    rows: Array<{ code: string }>;
    selected: string | null;
  }) => {
    capturedPieSectors.push(rows.map((row) => row.code));
    capturedPieSelected.push(selected);
    return <div data-testid="industry-pie" />;
  },
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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock("@/hooks/companies/useCompanySectors", () => ({
  useSectorTitles: () => ({
    [MATERIALS_SECTOR]: "Materials",
    [HEALTHCARE_SECTOR]: "Health Care",
  }),
  useSectorNames: () => ({
    [MATERIALS_SECTOR]: "Materials",
    [HEALTHCARE_SECTOR]: "Health Care",
  }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
}

function renderPage(initialEntry = "/companies") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/companies"
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
    capturedPieSectors.length = 0;
    capturedPieSelected.length = 0;
  });

  it("loads page companies into the table and full industry pie", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("companies-table")).toBeInTheDocument();
    });

    expect(capturedLists.at(-1)).toEqual([
      "Duni AB",
      "Materials Two",
      "Health One",
      "Health Two",
    ]);
    expect(capturedPieSectors.at(-1)).toEqual([
      MATERIALS_SECTOR,
      HEALTHCARE_SECTOR,
    ]);
    expect(capturedPieSelected.at(-1)).toBeNull();
  });

  it("scopes the table when a sector is already in the URL", async () => {
    renderPage(`/companies?sector=${MATERIALS_SECTOR}`);

    await waitFor(() => {
      expect(screen.getByTestId("companies-table")).toBeInTheDocument();
    });

    expect(capturedLists.at(-1)).toEqual(["Duni AB", "Materials Two"]);
    expect(capturedPieSelected.at(-1)).toBe(MATERIALS_SECTOR);
  });
});
