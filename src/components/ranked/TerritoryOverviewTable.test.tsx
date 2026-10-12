import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/i18n";
import {
  TerritoryOverviewTable,
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

describe("TerritoryOverviewTable", () => {
  it("keeps the measure rank when the list is searched or sorted by name", () => {
    renderTable();

    expect(rankFor("Beta")).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Municipality" }));
    expect(rankFor("Beta")).toBe("2");

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "beta" },
    });
    expect(rankFor("Beta")).toBe("2");
    expect(
      screen.queryByRole("row", { name: /Alpha/ }),
    ).not.toBeInTheDocument();
  });

  it("leaves missing values unranked", () => {
    renderTable();
    expect(rankFor("Gamma")).toBe("–");
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
