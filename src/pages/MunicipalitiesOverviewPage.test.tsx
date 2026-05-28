import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MunicipalitiesOverviewPage } from "./MunicipalitiesOverviewPage";

vi.mock("@/hooks/municipalities/useMunicipalityKPIs", () => ({
  useMunicipalityKPIs: () => ({
    municipalitiesData: [],
    municipalities: [],
    loading: false,
    error: null,
  }),
  useMunicipalityKPIDefinitions: () => [
    {
      key: "bicycleMetrePerCapita",
      label: "bicycleMetrePerCapita",
      unit: "",
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
      higherIsBetter: false,
    },
  ],
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
    <div data-testid="territory-map">{String(selectedKPI.key)}</div>
  ),
}));

vi.mock("@/components/municipalities/MunicipalityRankedList", () => ({
  MunicipalityRankedList: ({
    selectedKPI,
  }: {
    selectedKPI: { key: unknown };
  }) => <div data-testid="ranked-list">{String(selectedKPI.key)}</div>,
}));

vi.mock(
  "@/components/municipalities/rankedList/MunicipalityInsightsPanel",
  () => ({
    default: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
      <div data-testid="insights-panel">{String(selectedKPI.key)}</div>
    ),
  }),
);

vi.mock("@/components/ranked/KPIDataSelector", () => ({
  KPIDataSelector: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
    <div data-testid="kpi-selector">{String(selectedKPI.key)}</div>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("MunicipalitiesOverviewPage", () => {
  it("selects municipality KPI from the URL using the stable KPI key", () => {
    render(
      <MemoryRouter
        initialEntries={["/explore/municipalities?kpi=bicycleMetrePerCapita"]}
      >
        <Routes>
          <Route
            path="/explore/municipalities"
            element={<MunicipalitiesOverviewPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("kpi-selector")).toHaveTextContent(
      "bicycleMetrePerCapita",
    );
  });
});
