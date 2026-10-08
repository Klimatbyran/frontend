import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ParisAnswerCard } from "./ParisAnswerCard";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (
        options &&
        "percent" in options &&
        "count" in options &&
        "sector" in options
      ) {
        return `${key}:${options.percent}:${options.count}:${options.sector}`;
      }
      if (options && "percent" in options && "count" in options) {
        return `${key}:${options.percent}:${options.count}`;
      }
      if (options && "count" in options) {
        return `${key}:${options.count}`;
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
  onTrackPercent: 30,
};

describe("ParisAnswerCard", () => {
  it("shows one animated dot per judged company and leaves out companies without enough data", () => {
    const { container } = render(
      <ParisAnswerCard summary={baseSummary} industryLabel={null} />,
    );

    expect(
      screen.getByText("companiesOverviewPage.paris.dotNote"),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-hidden="true"]')?.querySelectorAll("span"),
    ).toHaveLength(8);
    expect(
      screen.getByText("companiesOverviewPage.paris.onTrack"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.offTrack"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.paris.notEnoughData"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    // 3 and 5 judged companies, so the two rows add up to 100.
    expect(screen.getByText("38%")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.share:30:10"),
    ).toBeInTheDocument();
  });

  it("talks about the selected sector instead of all of Sweden's largest companies", () => {
    render(
      <ParisAnswerCard
        summary={baseSummary}
        industryLabel="Industrials"
        sectorTitle="Industrials Sector"
      />,
    );

    expect(
      screen.getByText(
        "companiesOverviewPage.paris.shareSector:30:10:Industrials Sector",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.paris.share:30:10"),
    ).not.toBeInTheDocument();
  });
});
