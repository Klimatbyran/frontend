import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ParisAnswerCard } from "./ParisAnswerCard";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && "count" in options) {
        return `${key}:${options.count}`;
      }
      if (options && "onTrack" in options && "offTrack" in options) {
        return `${key}:${options.onTrack}:${options.offTrack}`;
      }
      return key;
    },
  }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    fadeDuration: 0,
    stagger: () => 0,
    ease: [0, 0, 1, 1],
  }),
}));

const baseSummary: ParisSummary = {
  total: 10,
  onTrack: 3,
  offTrack: 5,
  unknown: 2,
  reducingNotOnTrack: 2,
  onTrackPercent: 30,
};

describe("ParisAnswerCard", () => {
  it("shows chart caption with info helper when some companies are excluded", () => {
    render(<ParisAnswerCard summary={baseSummary} industryLabel={null} />);

    expect(
      screen.getByText("companiesOverviewPage.paris.chartCaption"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "companiesOverviewPage.paris.unknownNoteAria",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/companiesOverviewPage.paris.unknownNote/),
    ).not.toBeInTheDocument();
  });

  it("renders a vertical bar chart for on track and off track", () => {
    render(<ParisAnswerCard summary={baseSummary} industryLabel={null} />);

    expect(
      screen.getByRole("img", {
        name: "companiesOverviewPage.paris.chartAria:3:5",
      }),
    ).toBeInTheDocument();
  });
});
