import { useMemo } from "react";
import { render } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { getTranslation } from "./translation";

function TranslationDuringRender() {
  const { t } = useTranslation();
  // New object every render, same failure mode as an unstable SEO dependency.
  const unstable = { label: t("common.company") };
  const text = useMemo(() => getTranslation("common.company", "en"), [unstable]);
  return <p>{text}</p>;
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
      ).toBe("Se utsläppsdata och klimatomställning för Tele2 på Klimatkollen.");
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
