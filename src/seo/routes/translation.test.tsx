import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageProvider";
import i18n from "@/i18n";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage";
import { getTranslation } from "./translation";

afterEach(() => {
  cleanup();
});

vi.mock("@/lib/pagesApi", () => ({
  getPageCompanyHeader: vi.fn(() => new Promise(() => {})),
  getPageCompanyOverview: vi.fn(() => new Promise(() => {})),
  getPageCompanyEmissionsHistory: vi.fn(() => new Promise(() => {})),
  getPageCompanyTurnoverHistory: vi.fn(() => new Promise(() => {})),
  getPageCompanyScope3: vi.fn(() => new Promise(() => {})),
}));

function TranslationDuringRender() {
  const { t } = useTranslation();
  // New object every render, same failure mode as company detail's sector names.
  const unstable = { label: t("common.company") };
  const text = useMemo(
    () => getTranslation("common.company", "en"),
    [unstable],
  );
  return <p>{text}</p>;
}

function companyPage(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <Routes>
            <Route
              path="/:lang/companies/:id"
              element={<CompanyDetailPage />}
            />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("getTranslation", () => {
  it("translates in the requested language without switching i18n", async () => {
    await i18n.changeLanguage("sv");
    const events: string[] = [];
    const onLanguageChanged = (language: string) => {
      events.push(language);
    };
    i18n.on("languageChanged", onLanguageChanged);

    try {
      expect(getTranslation("common.company", "en")).toBe("Company");
      expect(getTranslation("common.company", "sv")).toBe("Företag");
      expect(
        getTranslation("companyDetailPage.metaDescription", "sv", {
          company: "Tele2",
        }),
      ).toBe(
        "Se utsläppsdata och klimatomställning för Tele2 på Klimatkollen.",
      );
      expect(i18n.language).toBe("sv");
      expect(events).toEqual([]);
    } finally {
      i18n.off("languageChanged", onLanguageChanged);
    }
  });

  it("does not re-render forever when route SEO is built during render", () => {
    expect(() => {
      const view = render(<TranslationDuringRender />);
      view.rerender(<TranslationDuringRender />);
    }).not.toThrow();
  });
});

describe("CompanyDetailPage loading", () => {
  it.each(["/sv/companies/Q123", "/en/companies/Q123"])(
    "does not crash while company data is still loading (%s)",
    (path) => {
      const view = render(companyPage(path));
      view.rerender(companyPage(path));
      expect(view.container.querySelector(".animate-pulse")).not.toBeNull();
    },
  );
});
