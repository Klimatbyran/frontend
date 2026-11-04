import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/i18n";
import {
  TerritoryOverviewTable,
  territoryOverviewSortsByLargest,
  type TerritoryTableRow,
} from "./TerritoryOverviewTable";

const rows: TerritoryTableRow[] = [
  {
    id: "alpha",
    name: "Alpha",
    href: "/municipalities/alpha",
    county: "A län",
    kpiValue: -4,
    paris: true,
  },
  {
    id: "beta",
    name: "Beta",
    href: "/municipalities/beta",
    county: "B län",
    kpiValue: 2,
    paris: false,
  },
  {
    id: "gamma",
    name: "Gamma",
    href: "/municipalities/gamma",
    county: "C län",
    kpiValue: null,
    paris: null,
  },
];

function renderTable() {
  return render(
    <MemoryRouter>
      <TerritoryOverviewTable
        rows={rows}
        entityType="municipalities"
        kpiLabel="Emissions"
        unit="%"
        higherIsBetter={false}
        showParis
      />
    </MemoryRouter>,
  );
}

function rankFor(name: string): string {
  const row = screen.getByRole("row", { name: new RegExp(name) });
  return row.querySelector("td")?.textContent?.trim() ?? "";
}

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("territoryOverviewSortsByLargest", () => {
  it("is true only for the emissions columns", () => {
    expect(
      territoryOverviewSortsByLargest("historicalEmissionChangePercent"),
    ).toBe(true);
    expect(territoryOverviewSortsByLargest("totalConsumptionEmission")).toBe(
      true,
    );
    expect(territoryOverviewSortsByLargest("meetsParis")).toBe(false);
    expect(territoryOverviewSortsByLargest("bicycleMetrePerCapita")).toBe(
      false,
    );
  });
});

describe("TerritoryOverviewTable", () => {
  it("keeps a lower-is-better measure smallest-first", () => {
    renderTable();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["Alpha", "Beta", "Gamma"],
    );
  });

  it("starts an emissions measure with the largest figures", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          rows={rows}
          entityType="municipalities"
          kpiLabel="Emissions"
          unit="%"
          higherIsBetter={false}
          sortLargestFirst
          showParis
        />
      </MemoryRouter>,
    );

    const names = () =>
      screen.getAllByRole("link").map((link) => link.textContent);
    expect(names()).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(rankFor("Beta")).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Emissions" }));
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(rankFor("Beta")).toBe("2");
  });

  it("updates ranking based on the sorted column and keeps the ranking when the list is searched", () => {
    renderTable();

    expect(rankFor("Gamma")).toBe("–");

    fireEvent.click(screen.getByRole("button", { name: "Municipality" }));

    expect(rankFor("Gamma")).toBe("3");

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "gamma" },
    });
    expect(rankFor("Gamma")).toBe("3");
    expect(
      screen.queryByRole("row", { name: /Alpha/ }),
    ).not.toBeInTheDocument();
  });

  it("leaves missing values unranked", () => {
    renderTable();
    expect(rankFor("Gamma")).toBe("–");
  });

  it("keeps missing Paris status at the bottom in both directions", () => {
    renderTable();
    const names = () =>
      screen.getAllByRole("link").map((link) => link.textContent);

    fireEvent.click(
      screen.getByRole("button", { name: "On track for Paris?" }),
    );
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);

    fireEvent.click(
      screen.getByRole("button", { name: "On track for Paris?" }),
    );
    expect(names()).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  it("puts the sort state on the column header", () => {
    renderTable();
    const nameHeader = screen.getByRole("columnheader", {
      name: "Municipality",
    });
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    fireEvent.click(screen.getByRole("button", { name: "Municipality" }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("keeps a missing yes or no measure at the bottom in both directions", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          rows={[
            {
              id: "alpha",
              name: "Alpha",
              href: "/municipalities/alpha",
              kpiValue: null,
            },
            {
              id: "beta",
              name: "Beta",
              href: "/municipalities/beta",
              kpiValue: false,
            },
            {
              id: "gamma",
              name: "Gamma",
              href: "/municipalities/gamma",
              kpiValue: true,
            },
          ]}
          entityType="municipalities"
          kpiLabel="Paris"
          unit=""
          isBoolean
          higherIsBetter
          booleanLabels={{ true: "On track", false: "Off track" }}
          showParis={false}
        />
      </MemoryRouter>,
    );

    const names = () =>
      screen.getAllByRole("link").map((link) => link.textContent);
    expect(names()).toEqual(["Gamma", "Beta", "Alpha"]);

    fireEvent.click(screen.getByRole("button", { name: "Paris" }));
    expect(names()).toEqual(["Beta", "Gamma", "Alpha"]);
  });

  it("does not rank yes or no measures", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          rows={[
            {
              id: "alpha",
              name: "Alpha",
              href: "/municipalities/alpha",
              kpiValue: true,
            },
            {
              id: "beta",
              name: "Beta",
              href: "/municipalities/beta",
              kpiValue: false,
            },
          ]}
          entityType="municipalities"
          kpiLabel="Paris"
          unit=""
          isBoolean
          higherIsBetter
          booleanLabels={{ true: "Meets", false: "Misses" }}
          showParis={false}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("columnheader", { name: "#" })).toBeNull();
    expect(screen.getByText("Meets")).toBeInTheDocument();
    expect(screen.getByText("Misses")).toBeInTheDocument();
  });

  it("uses the measure's own label for a missing number", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          rows={[
            {
              id: "alpha",
              name: "Alpha",
              href: "/municipalities/alpha",
              kpiValue: null,
            },
          ]}
          entityType="municipalities"
          kpiLabel="Chargers"
          unit=""
          higherIsBetter={false}
          nullLabel="No charging points"
          showParis={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("No charging points")).toBeInTheDocument();
  });
});
