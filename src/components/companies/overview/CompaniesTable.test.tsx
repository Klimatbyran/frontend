import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import type { PageCompanyOverviewItem } from "@/types/pages";
import { CompaniesTable } from "./CompaniesTable";

const { mockLoadMore, mockListState, capturedListOptions } = vi.hoisted(() => {
  const loadMore = vi.fn();
  const state = {
    companies: [] as PageCompanyOverviewItem[],
    total: 0,
    loading: false,
    fetchingMore: false,
    hasMore: false,
    loadMore,
    error: null as Error | null,
  };
  return {
    mockLoadMore: loadMore,
    mockListState: state,
    capturedListOptions: [] as Array<Record<string, unknown>>,
  };
});

vi.mock("@/hooks/pages/usePageCompaniesOverview", async () => {
  const actual = await vi.importActual<
    typeof import("@/hooks/pages/usePageCompaniesOverview")
  >("@/hooks/pages/usePageCompaniesOverview");
  return {
    ...actual,
    usePageCompaniesOverviewList: (options?: Record<string, unknown>) => {
      capturedListOptions.push(options ?? {});
      return mockListState;
    },
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

vi.mock("@/components/LanguageProvider", () => ({
  useLanguage: () => ({ currentLanguage: "en" }),
}));

vi.mock("@/hooks/companies/useCompanySectors", () => ({
  useSectorNames: () => ({
    "15": "Materials",
    "35": "Health Care",
  }),
}));

function company(
  name: string,
  meetsParis: boolean | null,
  change: number | null,
  emissions: number,
  sectorCode = "15",
): PageCompanyOverviewItem {
  return {
    id: name,
    name,
    wikidataId: `Q-${name}`,
    tags: ["sweden"],
    logoUrl: null,
    sectorCode,
    industryGroupCode: null,
    baseYear: 2019,
    meetsParis,
    emissionsChangeFromBaseYear: change,
    latestYear: 2024,
    latestTotalEmissions: emissions,
  };
}

const companies = [
  company("Alpha", false, 20, 900, "35"),
  company("Bravo", true, -40, 100, "15"),
  company("Charlie", null, null, 500, "35"),
];

function renderTable(sector: "15" | "35" | null = null) {
  return render(
    <MemoryRouter>
      <CompaniesTable sector={sector} />
    </MemoryRouter>,
  );
}

function rowNames(): string[] {
  return within(document.querySelector("tbody")!)
    .queryAllByRole("row")
    .map((row) => row.querySelector("td:nth-child(2) a")?.textContent ?? "");
}

beforeEach(() => {
  mockLoadMore.mockClear();
  capturedListOptions.length = 0;
  mockListState.companies = companies;
  mockListState.total = companies.length;
  mockListState.loading = false;
  mockListState.fetchingMore = false;
  mockListState.hasMore = false;
  mockListState.error = null;
});

describe("CompaniesTable", () => {
  it("renders one row per loaded company", () => {
    renderTable();
    expect(document.querySelectorAll("tbody tr")).toHaveLength(3);
  });

  it("passes sector and default paris sort to the pages list hook", () => {
    renderTable("35");
    expect(capturedListOptions.at(-1)).toMatchObject({
      sector: "35",
      sortBy: "paris",
      sortDir: "desc",
    });
  });

  it("maps industry sort to API sector sort", () => {
    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.colIndustry/,
      }),
    );
    expect(capturedListOptions.at(-1)).toMatchObject({
      sortBy: "sector",
      sortDir: "asc",
    });
  });

  it("debounces search into the list query", async () => {
    renderTable();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "alp" },
    });
    await waitFor(() => {
      expect(capturedListOptions.at(-1)).toMatchObject({ q: "alp" });
    });
  });

  it("shows one extra column on small screens and the rest from md", () => {
    renderTable();
    const table = document.querySelector("table");
    expect(table).toHaveClass("table-fixed");

    const header = (name: RegExp) =>
      screen.getByRole("button", { name }).closest("th")!;

    expect(header(/colOnTrack/)).toHaveClass("table-cell");
    expect(header(/colIndustry/)).toHaveClass("hidden", "md:table-cell");
  });

  it("loads the next page when show more is clicked", () => {
    mockListState.hasMore = true;
    mockListState.total = 20;
    renderTable();

    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.showMoreRows/,
      }),
    );
    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  it("hides show more when every row is loaded", () => {
    mockListState.hasMore = false;
    renderTable();
    expect(
      screen.queryByRole("button", {
        name: /companiesOverviewPage\.paris\.showMoreRows/,
      }),
    ).toBeNull();
  });

  it("shows a loading row while the first page is fetching", () => {
    mockListState.companies = [];
    mockListState.total = 0;
    mockListState.loading = true;
    renderTable();
    expect(
      screen.getByText("companiesOverviewPage.paris.tableLoading"),
    ).toBeInTheDocument();
  });

  it("shows an error row when the list request fails", () => {
    mockListState.companies = [];
    mockListState.total = 0;
    mockListState.error = new Error("failed");
    renderTable();
    expect(
      screen.getByText("companiesOverviewPage.paris.tableError"),
    ).toBeInTheDocument();
  });

  it("links each company to its detail page", () => {
    renderTable();
    expect(screen.getByRole("link", { name: /Bravo/ })).toHaveAttribute(
      "href",
      expect.stringContaining("Q-Bravo"),
    );
  });

  it("does not navigate when a value cell is clicked", () => {
    function LocationProbe() {
      return <div data-testid="location">{useLocation().pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/en/companies-overview"]}>
        <Routes>
          <Route
            element={
              <>
                <Outlet />
                <LocationProbe />
              </>
            }
          >
            <Route
              path="/en/companies-overview"
              element={<CompaniesTable sector={null} />}
            />
            <Route path="/en/companies/:id" element={<div>Detail</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("900"));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/en/companies-overview",
    );
    expect(rowNames()).toContain("Alpha");
  });
});
