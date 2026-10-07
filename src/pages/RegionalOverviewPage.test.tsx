import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RegionalOverviewPage } from "./RegionalOverviewPage";

const { mockKpis } = vi.hoisted(() => ({
  mockKpis: [
    {
      key: "historicalEmissionChangePercent",
      label: "emissions",
      unit: "%",
      higherIsBetter: false,
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
    },
    {
      key: "meetsParis",
      label: "paris",
      unit: "",
      higherIsBetter: true,
      isBoolean: true,
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
    },
  ],
}));

vi.mock("@/hooks/regions/useRegionKPIs", () => ({
  useRegionsKPIs: () => ({
    regionsData: [],
    loading: false,
    error: null,
  }),
  useRegionalKPIs: () => mockKpis,
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div />,
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: ({ selectedKPI }: { selectedKPI: { key: unknown } }) => (
    <div data-testid="territory-map">{String(selectedKPI.key)}</div>
  ),
}));

vi.mock("@/components/regions/RegionalRankedList", () => ({
  RegionalRankedList: () => <div data-testid="ranked-list" />,
}));

vi.mock("@/components/regions/RegionalInsightsPanel", () => ({
  default: ({ section }: { section?: string }) => (
    <div data-testid={`insights-${section ?? "all"}`} />
  ),
}));

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

function renderPage(search = "") {
  render(
    <MemoryRouter initialEntries={[`/regions${search}`]}>
      <Routes>
        <Route path="/regions" element={<RegionalOverviewPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RegionalOverviewPage", () => {
  it("shows the map, summary, best and worst, and the full list", () => {
    renderPage();

    expect(screen.getByTestId("territory-map")).toHaveTextContent(
      "historicalEmissionChangePercent",
    );
    expect(screen.getByTestId("ranked-list")).toBeInTheDocument();
    expect(screen.getByTestId("insights-stats")).toBeInTheDocument();
    expect(screen.getByTestId("insights-top")).toBeInTheDocument();
    expect(screen.getByTestId("insights-bottom")).toBeInTheDocument();
    expect(
      screen.queryByTestId("insights-distribution"),
    ).not.toBeInTheDocument();
  });

  it("keeps the list when a boolean indicator hides the best and worst", () => {
    renderPage("?kpi=meetsParis");

    expect(screen.getByTestId("kpi-selector")).toHaveTextContent("meetsParis");
    expect(screen.getByTestId("territory-map")).toBeInTheDocument();
    expect(screen.getByTestId("ranked-list")).toBeInTheDocument();
    expect(screen.getByTestId("insights-stats")).toBeInTheDocument();
    expect(screen.queryByTestId("insights-top")).not.toBeInTheDocument();
    expect(screen.queryByTestId("insights-bottom")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("insights-distribution"),
    ).not.toBeInTheDocument();
  });
});
