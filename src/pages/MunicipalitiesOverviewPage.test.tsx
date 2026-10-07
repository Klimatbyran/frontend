import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MunicipalitiesOverviewPage } from "./MunicipalitiesOverviewPage";

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
    default: ({
      selectedKPI,
      section,
    }: {
      selectedKPI: { key: unknown };
      section?: string;
    }) => (
      <div data-testid={`insights-${section ?? "all"}`}>
        {String(selectedKPI.key)}
      </div>
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
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
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
    expect(screen.getByTestId("territory-map")).toBeInTheDocument();
    expect(screen.getByTestId("ranked-list")).toBeInTheDocument();
    expect(screen.getByTestId("insights-stats")).toBeInTheDocument();
    expect(screen.getByTestId("insights-top")).toBeInTheDocument();
    expect(screen.getByTestId("insights-bottom")).toBeInTheDocument();
    expect(
      screen.queryByTestId("insights-distribution"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("municipalities.list.viewToggle.showList"),
    ).not.toBeInTheDocument();
  });
});
