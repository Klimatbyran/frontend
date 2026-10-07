import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RegionalOverviewPage } from "./RegionalOverviewPage";

vi.mock("@/hooks/regions/useRegionKPIs", () => ({
  useRegionsKPIs: () => ({
    regions: ["Skåne län"],
    regionsData: [
      {
        name: "Skåne län",
        meetsParis: false,
        historicalEmissionChangePercent: 0.4,
      },
      {
        name: "Västerbottens län",
        meetsParis: true,
        historicalEmissionChangePercent: -2,
      },
    ],
    loading: false,
    error: null,
  }),
  useRegionalKPIs: () => [
    {
      key: "historicalEmissionChangePercent",
      label: "Change",
      unit: "%",
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
      higherIsBetter: false,
    },
    {
      key: "meetsParis",
      label: "Paris",
      unit: "",
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: { true: "Yes", false: "No" },
    },
  ],
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: () => <div data-testid="territory-map" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

describe("RegionalOverviewPage", () => {
  it("tells the Paris story on the map without a climate-plan chapter", () => {
    render(
      <MemoryRouter initialEntries={["/sv/regions"]}>
        <Routes>
          <Route path="/sv/regions" element={<RegionalOverviewPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("territory-map")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "regionalOverviewPage.title" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "regionalOverviewPage.story.plansTitle",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Västerbottens län" }),
    ).toBeInTheDocument();
  });
});
