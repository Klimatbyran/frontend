import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MunicipalitiesOverviewPage } from "./MunicipalitiesOverviewPage";

vi.mock("i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("i18next")>();
  return {
    ...actual,
    t: (key: string) => key,
  };
});

const { mockKpiDefinitions } = vi.hoisted(() => ({
  mockKpiDefinitions: [
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

vi.mock("@/hooks/municipalities/useMunicipalityKPIs", () => ({
  useMunicipalityKPIs: () => ({
    municipalitiesData: [],
    municipalities: [],
    loading: false,
    error: null,
  }),
  useMunicipalityKPIDefinitions: () => mockKpiDefinitions,
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
    <div data-testid="territory-map">{String(selectedKPI.key)}</div>
  ),
}));

vi.mock(
  "@/components/municipalities/rankedList/MunicipalityInsightsPanel",
  () => ({
    default: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
      <div data-testid="insights-panel">{String(selectedKPI.key)}</div>
    ),
  }),
);

vi.mock("@/components/ranked/DataChipSelector", () => ({
  DataChipSelector: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
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
