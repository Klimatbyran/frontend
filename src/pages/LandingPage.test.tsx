import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageProvider";
import "@/i18n";
import { LandingPage } from "./LandingPage";

vi.mock("@/lib/api", () => ({
  getMunicipalitiesKPIs: vi.fn(() => new Promise(() => {})),
  getRegionsKPIs: vi.fn(() => new Promise(() => {})),
  getAdditionalNationData: vi.fn(() => new Promise(() => {})),
  getCompaniesBySearchTerm: vi.fn(() => new Promise(() => {})),
}));

afterEach(() => {
  cleanup();
});

function renderLandingPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/sv"]}>
          <LanguageProvider>
            <LandingPage />
          </LanguageProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe("LandingPage loading", () => {
  it("shows the page immediately and skeletons only the data visuals", () => {
    renderLandingPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Hur går det med",
    );
    expect(screen.getByAltText("Illustration")).toBeInTheDocument();
    expect(screen.getByText("Hur presterar din kommun?")).toBeInTheDocument();
    expect(
      screen.getByText("Sveriges utsläpp är större än vi tror"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hur går det med företagens utsläpp?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Det som hänt")).toBeInTheDocument();
    expect(screen.getAllByRole("status").length).toBeGreaterThanOrEqual(3);
  });
});
