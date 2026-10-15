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
  summaryState,
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

  const summaryState = {
    loading: false,
    error: null as Error | null,
  };

  return {
    mockCompanies: companies,
    buildSummary: summaryFor,
    summaryState,
    capturedLists: [] as string[][],
    capturedPieSectors: [] as string[][],
    capturedPieSelected: [] as Array<string | null>,
  };
});

vi.mock("@/hooks/pages/usePageCompaniesOverview", () => ({
  usePageCompaniesOverviewSummary: (options?: { sector?: string | null }) => ({
    summary:
      summaryState.loading || summaryState.error
        ? undefined
        : buildSummary(options?.sector ?? null),
    loading: summaryState.loading,
    error: summaryState.error,
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
  CompaniesTable: ({ sector }: { sector: string | null }) => {
    const names = (
      sector
        ? mockCompanies.filter((company) => company.sectorCode === sector)
        : mockCompanies
    ).map((company) => company.name);
    capturedLists.push(names);
    return <div data-testid="companies-table" data-sector={sector ?? "all"} />;
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
    summaryState.loading = false;
    summaryState.error = null;
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

  it("keeps the selected sector chip without painting another sector's paris stats", async () => {
    summaryState.loading = true;
    renderPage(`/companies?sector=${MATERIALS_SECTOR}`);

    await waitFor(() => {
      expect(
        screen.getByText("companiesOverviewPage.paris.allIndustries"),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Materials/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.paris.kicker"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.errorTitle"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("companies-table")).toHaveAttribute(
      "data-sector",
      MATERIALS_SECTOR,
    );
    expect(capturedPieSelected.at(-1)).toBe(MATERIALS_SECTOR);
  });
});
