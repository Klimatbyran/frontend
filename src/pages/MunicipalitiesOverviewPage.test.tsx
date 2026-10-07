import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { MunicipalitiesOverviewPage } from "./MunicipalitiesOverviewPage";

const municipalities = [
  {
    name: "Malmö",
    meetsParis: true,
    historicalEmissionChangePercent: -4,
    climatePlan: true,
    electricVehiclePerChargePoints: null,
    bicycleMetrePerCapita: 2,
    totalConsumptionEmission: 6,
    electricCarChangePercent: 1,
  },
  {
    name: "Kiruna",
    meetsParis: false,
    historicalEmissionChangePercent: 1.5,
    climatePlan: false,
    electricVehiclePerChargePoints: 3,
    bicycleMetrePerCapita: 1,
    totalConsumptionEmission: 8,
    electricCarChangePercent: 0.2,
  },
];

const { kpiState } = vi.hoisted(() => ({
  kpiState: {
    loading: false,
    error: null as Error | null,
    municipalitiesData: [] as typeof municipalities,
  },
}));

vi.mock("@/hooks/municipalities/useMunicipalityKPIs", () => ({
  useMunicipalityKPIs: () => ({
    municipalities: kpiState.municipalitiesData.map((row) => row.name),
    municipalitiesData: kpiState.municipalitiesData,
    loading: kpiState.loading,
    error: kpiState.error,
  }),
  useMunicipalityKPIDefinitions: () => [
    {
      key: "meetsParisGoal",
      label: "Paris",
      unit: "",
      source: "",
      sourceUrls: [],
      description: "",
      detailedDescription: "",
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: { true: "On track", false: "Off track" },
    },
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
  ],
}));

vi.mock("@/components/maps/TerritoryMap", () => ({
  default: ({ selectedKPI }: { selectedKPI: { key: string } }) => (
    <div data-testid="territory-map">{selectedKPI.key}</div>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options && typeof options.count === "number"
        ? `${key}:${options.count}`
        : key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderPage(path = "/sv/municipalities") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/sv/municipalities"
          element={
            <>
              <MunicipalitiesOverviewPage />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("MunicipalitiesOverviewPage", () => {
  beforeEach(() => {
    kpiState.loading = false;
    kpiState.error = null;
    kpiState.municipalitiesData = municipalities;
  });

  it("opens on the Paris map and tells the plan story", () => {
    renderPage();

    expect(screen.getByTestId("territory-map")).toHaveTextContent(
      "meetsParisGoal",
    );
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: "municipalitiesOverviewPage.story.plansTitle",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Malmö" }).length,
    ).toBeGreaterThan(0);
  });

  it("switches the map to pace and keeps the choice in the URL", () => {
    kpiState.municipalitiesData = municipalities;
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "municipalitiesOverviewPage.story.lensPace",
      }),
    );

    expect(screen.getByTestId("territory-map")).toHaveTextContent(
      "historicalEmissionChangePercent",
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "lens=pace",
    );
  });

  it("treats the old kpi link as the pace lens", () => {
    kpiState.municipalitiesData = municipalities;
    renderPage("/sv/municipalities?kpi=historicalEmissionChangePercent");

    expect(screen.getByTestId("territory-map")).toHaveTextContent(
      "historicalEmissionChangePercent",
    );
  });

  it("shows an error instead of an empty story when the request fails", () => {
    kpiState.error = new Error("nope");
    kpiState.municipalitiesData = [];

    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "municipalitiesOverviewPage.errorTitle",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("territory-map")).not.toBeInTheDocument();
  });
});
