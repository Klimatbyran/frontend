import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInstance, type Resource } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ParisExplainer } from "./ParisExplainer";

function loadTranslations(language: "en" | "sv"): Resource {
  const filePath = resolve(
    process.cwd(),
    `src/locales/${language}/translation.json`,
  );
  return {
    [language]: {
      translation: JSON.parse(readFileSync(filePath, "utf8")),
    },
  };
}

async function renderExplainer(language: "en" | "sv") {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng: language,
    resources: loadTranslations(language),
    interpolation: { escapeValue: false },
  });

  render(
    <MemoryRouter initialEntries={[`/${language}/companies`]}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <ParisExplainer />
        </LanguageProvider>
      </I18nextProvider>
    </MemoryRouter>,
  );
}

describe("ParisExplainer", () => {
  it("links the English Carbon Law explainer to the methodology page", async () => {
    await renderExplainer("en");

    fireEvent.click(
      screen.getByRole("button", {
        name: "How do we decide if a company is on track?",
      }),
    );

    expect(screen.getByText(/We use the Carbon Law/)).toHaveTextContent(
      "We use the Carbon Law to calculate whether a company is cutting its emissions fast enough. Read more about the Carbon Law here.",
    );
    expect(screen.getByText(/Fast enough is/)).toHaveTextContent(
      "Fast enough is on track. Too slow, or not cutting at all, is off track. Companies that haven't reported enough years yet are shown as not enough data.",
    );
    expect(screen.getByText("on track").tagName).toBe("STRONG");
    expect(screen.getByText("off track").tagName).toBe("STRONG");
    expect(screen.getByText("not enough data").tagName).toBe("STRONG");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "here" })).toHaveAttribute(
        "href",
        "/en/methodology?view=carbonLaw",
      );
    });
  });

  it("links the Swedish Carbon Law explainer to the methodology page", async () => {
    await renderExplainer("sv");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hur avgör vi om ett företag är på rätt väg?",
      }),
    );

    expect(screen.getByText(/Vi använder Carbon Law/)).toHaveTextContent(
      "Vi använder Carbon Law för att beräkna om ett företag minskar sina utsläpp i tillräckligt snabb takt. Läs mer om Carbon Law här.",
    );
    expect(screen.getByText(/Tillräckligt snabbt är/)).toHaveTextContent(
      "Tillräckligt snabbt är på rätt väg. För långsamt, eller ingen minskning alls, är inte på rätt väg. Företag som ännu inte rapporterat tillräckligt många år visas som för lite data.",
    );
    expect(screen.getByText("på rätt väg").tagName).toBe("STRONG");
    expect(screen.getByText("inte på rätt väg").tagName).toBe("STRONG");
    expect(screen.getByText("för lite data").tagName).toBe("STRONG");
    expect(screen.queryByText(/döljas/)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "här" })).toHaveAttribute(
        "href",
        "/sv/methodology?view=carbonLaw",
      );
    });
  });
});
