import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { ClimatePlanView } from "./ClimatePlanView";
import { downloadClimatePlanDocx } from "./climatePlanDocument";
import { CLIMATE_PLAN_STEPS } from "./climatePlanContent";

const uppsala = {
  name: "Uppsala",
  region: "Uppsala län",
  logoUrl: null,
  totalTrend: 1,
  totalCarbonLaw: 1,
  historicalEmissionChangePercent: -18,
  electricCarChangePercent: 24,
  climatePlanLink: null,
  climatePlanYear: 2022,
  climatePlanComment: null,
  bicycleMetrePerCapita: 3.4,
  totalConsumptionEmission: 6.2,
  electricVehiclePerChargePoints: 8,
  procurementScore: 2,
  procurementLink: null,
  politicalRule: [],
  politicalKSO: "",
  emissions: [{ year: "2023", value: 480000 }],
  approximatedHistoricalEmission: [],
  trend: [],
};

vi.mock("@/lib/api", () => ({
  getMunicipalities: vi.fn(async () => [uppsala]),
}));

vi.mock("./climatePlanDocument", async () => {
  const actual = await vi.importActual<typeof import("./climatePlanDocument")>(
    "./climatePlanDocument",
  );
  return {
    ...actual,
    downloadClimatePlanDocx: vi.fn(async () => {}),
  };
});

afterEach(() => {
  cleanup();
});

function renderWizard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ClimatePlanView />
    </QueryClientProvider>,
  );
}

describe("ClimatePlanView", () => {
  it("loads a municipality, shows its emissions, and downloads the answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          sectors: {
            "2023": { Transporter: 50, Jordbruk: 50 },
          },
        }),
      })),
    );

    renderWizard();

    const next = screen.getByRole("button", { name: "Nästa" });
    expect(next).toBeDisabled();

    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("button", { name: "Uppsala" }));

    expect(next).toBeEnabled();
    fireEvent.click(next);

    expect(
      await screen.findByText((_, element) => {
        const text = element?.textContent?.replace(/\s/g, "") ?? "";
        return element?.tagName === "P" && text === "480000";
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Transporter")).toBeInTheDocument();
    expect(screen.getByText("Jordbruk")).toBeInTheDocument();

    for (let index = 1; index < CLIMATE_PLAN_STEPS.length - 1; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Nästa" }));
    }

    expect(
      screen.getByRole("button", { name: "Ladda ner Word" }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Ladda ner Word" }));

    expect(downloadClimatePlanDocx).toHaveBeenCalledWith(
      expect.objectContaining({
        municipalityName: "Uppsala",
        answers: expect.objectContaining({
          "kpi-total": formatEmissionsAbsolute(480000, "sv"),
          "kpi-climate-plan": "Antagen 2022",
          "consumption-per-capita": "6,2",
        }),
      }),
    );
  });

  it("shows a one-field question once, and clears the figures when the municipality is removed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ sectors: {} }),
      })),
    );

    renderWizard();
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("button", { name: "Uppsala" }));
    expect(screen.getByText(/8 av \d+ ifyllda/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );

    fireEvent.click(screen.getByRole("button", { name: "Nästa" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
      transform: `scaleX(${2 / CLIMATE_PLAN_STEPS.length})`,
    });

    const yearStep = CLIMATE_PLAN_STEPS.findIndex(
      (step) => step.id === "net-zero-year",
    );
    for (let index = 1; index < yearStep; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Nästa" }));
    }
    expect(screen.getAllByText("År för nettonoll")).toHaveLength(1);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(yearStep + 1),
    );

    for (let index = 0; index < yearStep; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Tillbaka" }));
    }
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect(screen.getByText(/0 av \d+ ifyllda/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });
});
