import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TwoFuturesTooltip } from "./TwoFuturesTooltip";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/LanguageProvider", () => ({
  useLanguage: () => ({ currentLanguage: "en" }),
}));

const labels = {
  history: "What has happened",
  historyEstimated: "Approximated",
  trend: "Trend",
  paris: "Paris",
};

describe("TwoFuturesTooltip", () => {
  it("shows the AI icon only beside an AI-extracted reported value", () => {
    const { rerender } = render(
      <TwoFuturesTooltip
        active
        label={2022}
        unit="t"
        labels={labels}
        payload={[
          {
            dataKey: "history",
            value: 100,
            color: "#fff",
            payload: { year: 2022, historyIsAIGenerated: true },
          },
        ]}
      />,
    );

    expect(screen.getByAltText("AI Icon")).toBeInTheDocument();

    rerender(
      <TwoFuturesTooltip
        active
        label={2023}
        unit="t"
        labels={labels}
        payload={[
          {
            dataKey: "history",
            value: 90,
            color: "#fff",
            payload: { year: 2023, historyIsAIGenerated: false },
          },
        ]}
      />,
    );

    expect(screen.queryByAltText("AI Icon")).toBeNull();
  });
});
