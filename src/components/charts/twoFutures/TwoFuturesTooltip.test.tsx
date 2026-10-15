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

  it("marks only the reported history row when trend and Paris share the point", () => {
    render(
      <TwoFuturesTooltip
        active
        label={2026}
        unit="t"
        labels={labels}
        payload={[
          {
            dataKey: "history",
            value: 80,
            color: "#fff",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
          {
            dataKey: "trend",
            value: 80,
            color: "pink",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
          {
            dataKey: "paris",
            value: 60,
            color: "green",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
          {
            dataKey: "historyEstimated",
            value: 80,
            color: "#fff",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
        ]}
      />,
    );

    expect(screen.getAllByAltText("AI Icon")).toHaveLength(1);
    expect(screen.queryByText("Approximated")).toBeNull();
  });

  it("does not mark an approximated year", () => {
    render(
      <TwoFuturesTooltip
        active
        label={2026}
        unit="t"
        labels={labels}
        payload={[
          {
            dataKey: "historyEstimated",
            value: 80,
            color: "#fff",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
          {
            dataKey: "trend",
            value: 80,
            color: "pink",
            payload: { year: 2026, historyIsAIGenerated: true },
          },
        ]}
      />,
    );

    expect(screen.queryByAltText("AI Icon")).toBeNull();
    expect(screen.getByText("Approximated")).toBeInTheDocument();
  });
});
