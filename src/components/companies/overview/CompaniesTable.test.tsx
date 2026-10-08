import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import type { CompanyWithKPIs } from "@/types/company";
import { CompaniesTable } from "./CompaniesTable";

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
): CompanyWithKPIs {
  return {
    id: name,
    name,
    wikidataId: `Q-${name}`,
    industry: { industryGics: { sectorCode } },
    reportingPeriods: [{ emissions: { calculatedTotalEmissions: emissions } }],
    meetsParis,
    emissionsChangeFromBaseYear: change,
  } as unknown as CompanyWithKPIs;
}

const companies = [
  company("Alpha", false, 20, 900, "35"),
  company("Bravo", true, -40, 100, "15"),
  company("Charlie", null, null, 500, "35"),
];

function renderTable(list: CompanyWithKPIs[] = companies) {
  return render(
    <MemoryRouter>
      <CompaniesTable companies={list} />
    </MemoryRouter>,
  );
}

function rowNames(): string[] {
  return within(document.querySelector("tbody")!)
    .getAllByRole("row")
    .map((row) => row.querySelector("td:nth-child(2) a")?.textContent ?? "");
}

describe("CompaniesTable", () => {
  it("renders one row per company", () => {
    renderTable();
    expect(document.querySelectorAll("tbody tr")).toHaveLength(3);
  });

  it("scrolls a wider table inside the card below the sm breakpoint", () => {
    renderTable();
    const table = document.querySelector("table");
    expect(table).toHaveClass("min-w-[36rem]", "sm:min-w-0", "sm:table-fixed");
    expect(table?.parentElement?.parentElement).toHaveClass("overflow-x-auto");
  });

  it("sorts on-track companies first by default", () => {
    renderTable();
    // Bravo meets Paris, Alpha does not, Charlie can't be judged.
    expect(rowNames()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("sorts by emissions when the column header is clicked", () => {
    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.colEmissions/,
      }),
    );
    expect(rowNames()).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("flips the sort direction when the active column header is clicked again", () => {
    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.colOnTrack/,
      }),
    );
    expect(rowNames()).toEqual(["Charlie", "Alpha", "Bravo"]);
  });

  it("sorts by industry name when the column header is clicked", () => {
    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.colIndustry/,
      }),
    );
    expect(rowNames()).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("sorts by emissions change with missing values last", () => {
    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.colChange/,
      }),
    );
    expect(rowNames()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("sorts by source list order when # is clicked", () => {
    renderTable();
    fireEvent.click(screen.getByRole("button", { name: /^#$/ }));
    expect(rowNames()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("filters by search query", () => {
    renderTable();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "brav" },
    });
    expect(rowNames()).toEqual(["Bravo"]);
  });

  it("paginates with show more", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      company(`Co ${String(i).padStart(2, "0")}`, true, -30, 100 - i),
    );
    renderTable(many);

    expect(document.querySelectorAll("tbody tr")).toHaveLength(12);
    fireEvent.click(
      screen.getByRole("button", {
        name: /companiesOverviewPage\.paris\.showMoreRows/,
      }),
    );
    expect(document.querySelectorAll("tbody tr")).toHaveLength(20);
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
              element={<CompaniesTable companies={companies} />}
            />
            <Route path="/en/companies/:id" element={<div>Detail</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const bravoRow = screen.getByRole("link", { name: /Bravo/ }).closest("tr")!;
    fireEvent.click(within(bravoRow).getAllByRole("cell")[0]);

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/en/companies-overview",
    );
    expect(screen.queryByText("Detail")).not.toBeInTheDocument();
  });
});
