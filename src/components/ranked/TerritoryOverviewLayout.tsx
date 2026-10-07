import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  OverviewExplainer,
  OverviewSectionIntro,
} from "@/components/ranked/OverviewExplainer";
import {
  OVERVIEW_PANEL_HEIGHT,
  OVERVIEW_PANEL_MD_HEIGHT,
} from "@/components/ranked/overviewPanel";

interface TerritoryOverviewLayoutProps {
  title: string;
  lead: string;
  explainerTitle: string;
  explainer: ReactNode;
  selector: ReactNode;
  mapTitle: string;
  mapDescription: string;
  map: ReactNode;
  stats: ReactNode;
  comparisonTitle?: string;
  comparisonDescription?: string;
  comparison?: ReactNode;
  listTitle: string;
  listDescription: string;
  list: ReactNode;
}

/**
 * Municipal and regional overviews share this stack: a lead and folded
 * explainer, the map beside the summary, optional best/worst lists, and the
 * full list at the bottom.
 */
export function TerritoryOverviewLayout({
  title,
  lead,
  explainerTitle,
  explainer,
  selector,
  mapTitle,
  mapDescription,
  map,
  stats,
  comparisonTitle,
  comparisonDescription,
  comparison,
  listTitle,
  listDescription,
  list,
}: TerritoryOverviewLayoutProps) {
  return (
    <div className="space-y-8 md:space-y-10">
      <div className="space-y-5">
        {/* Layout already applies container padding; PageHeader's own max-width
            would inset the title past the cards. */}
        <PageHeader
          className="mx-0 mb-0 max-w-none p-0 md:mb-0"
          title={title}
          description={lead}
        />
        <OverviewExplainer title={explainerTitle}>
          {explainer}
        </OverviewExplainer>
      </div>

      {selector}

      <section className="space-y-4 md:space-y-5">
        <OverviewSectionIntro title={mapTitle} description={mapDescription} />
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          <div className={`min-w-0 ${OVERVIEW_PANEL_HEIGHT}`}>{map}</div>
          <div
            className={`min-h-0 h-full min-w-0 overflow-visible ${OVERVIEW_PANEL_MD_HEIGHT}`}
          >
            {stats}
          </div>
        </div>
      </section>

      {comparison && comparisonTitle && comparisonDescription && (
        <section className="space-y-4 md:space-y-5">
          <OverviewSectionIntro
            title={comparisonTitle}
            description={comparisonDescription}
          />
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {comparison}
          </div>
        </section>
      )}

      <section className="space-y-4 md:space-y-5">
        <OverviewSectionIntro title={listTitle} description={listDescription} />
        {list}
      </section>
    </div>
  );
}
