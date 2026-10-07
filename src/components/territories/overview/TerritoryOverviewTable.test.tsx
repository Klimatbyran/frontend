import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TerritoryOverviewTable } from "./TerritoryOverviewTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key.split(".").pop() ?? key,
  }),
}));

const rows = [
  {
    name: "Malmö",
    meetsParis: true,
    historicalEmissionChangePercent: -1,
    climatePlan: true,
  },
  {
    name: "Kiruna",
    meetsParis: false,
    historicalEmissionChangePercent: -8,
    climatePlan: false,
  },
  {
    name: "Uppsala",
    meetsParis: false,
    historicalEmissionChangePercent: 2,
    climatePlan: true,
  },
];

function namesInOrder(): string[] {
  return screen
    .getAllByRole("link")
    .map((link) => link.textContent ?? "")
    .filter((name) => rows.some((row) => row.name === name));
}

describe("TerritoryOverviewTable", () => {
  it("searches by name and sorts by the yearly change", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          storyKey="municipalitiesOverviewPage.story"
          entityType="municipality"
          rows={rows}
          showClimatePlan
        />
      </MemoryRouter>,
    );

    expect(namesInOrder()[0]).toBe("Malmö");

    fireEvent.click(screen.getByRole("button", { name: "colChange" }));

    expect(namesInOrder()).toEqual(["Kiruna", "Malmö", "Uppsala"]);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "upp" },
    });

    expect(namesInOrder()).toEqual(["Uppsala"]);
    expect(screen.queryByText("noResults")).not.toBeInTheDocument();
  });

  it("says when the search matches nothing", () => {
    render(
      <MemoryRouter>
        <TerritoryOverviewTable
          storyKey="regionalOverviewPage.story"
          entityType="region"
          rows={rows}
        />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("noResults")).toBeInTheDocument();
  });
});
