import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ParisAnswerCard } from "./ParisAnswerCard";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";
import type { CompanyWithKPIs } from "@/types/company";

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

function dotCompany(name: string, meetsParis: boolean | null): CompanyWithKPIs {
  return {
    id: name,
    name,
    wikidataId: `Q${name}`,
    meetsParis,
  } as unknown as CompanyWithKPIs;
}

const judgedCompanies = [
  dotCompany("OnA", true),
  dotCompany("OnB", true),
  dotCompany("OnC", true),
  dotCompany("OffA", false),
  dotCompany("OffB", false),
  dotCompany("OffC", false),
  dotCompany("OffD", false),
  dotCompany("OffE", false),
  dotCompany("UnknownA", null),
  dotCompany("UnknownB", null),
];

function renderCard(
  summary: ParisSummary = baseSummary,
  companies: CompanyWithKPIs[] = judgedCompanies,
) {
  return render(
    <MemoryRouter>
      <ParisAnswerCard
        summary={summary}
        companies={companies}
        industryLabel={null}
      />
    </MemoryRouter>,
  );
}

describe("ParisAnswerCard", () => {
  it("shows one animated dot per judged company and leaves out companies without enough data", () => {
    renderCard();

    expect(
      screen.getByText("companiesOverviewPage.paris.dotNote"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /, / })).toHaveLength(8);
    expect(
      screen.queryByRole("button", { name: /UnknownA/ }),
    ).not.toBeInTheDocument();
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
      screen.getByText("companiesOverviewPage.paris.share:30:10", {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.tooLittle:2", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("talks about the selected sector instead of all of Sweden's largest companies", () => {
    render(
      <MemoryRouter>
        <ParisAnswerCard
          summary={baseSummary}
          companies={judgedCompanies}
          industryLabel="Industrials Sector"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "companiesOverviewPage.paris.shareSector:30:10:Industrials Sector",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.paris.share:30:10"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.tooLittle:2", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("leaves out the too-little sentence when every company can be judged", () => {
    renderCard({ ...baseSummary, unknown: 0 });

    expect(
      screen.queryByText(/companiesOverviewPage\.paris\.tooLittle/),
    ).not.toBeInTheDocument();
  });

  it("names the company under the pointer and links to it", () => {
    renderCard();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByRole("button", { name: /OnA,/ }));

    expect(screen.getByRole("link", { name: "OnA" })).toHaveAttribute(
      "href",
      "/sv/companies/QOnA",
    );
    expect(
      screen.getByText("companiesOverviewPage.paris.badgeOnTrack"),
    ).toBeInTheDocument();
  });

  it("dims the other dots while a verdict row is pressed", () => {
    renderCard();

    const onTrack = screen.getByRole("button", {
      name: /^companiesOverviewPage\.paris\.onTrack/,
    });
    fireEvent.click(onTrack);

    expect(onTrack).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /OffA,/ }).querySelector("span"),
    ).toHaveClass("opacity-25");

    fireEvent.click(onTrack);
    expect(onTrack).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /OffA,/ }).querySelector("span"),
    ).not.toHaveClass("opacity-25");
  });
});
