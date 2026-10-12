import type { ReactNode } from "react";
import { OverviewPageRoot } from "@/components/layout/OverviewPageRoot";
import { PageHeader } from "@/components/layout/PageHeader";

interface TerritoryOverviewLayoutProps {
  title: string;
  description: string;
  selector: ReactNode;
  map: ReactNode;
  answer: ReactNode;
  /** Omitted for boolean KPIs, which have no best/worst lists. */
  bestList?: ReactNode;
  worstList?: ReactNode;
  table: ReactNode;
}

/** Shared municipality and region overview: title, chips, map, short answer, lists, table. */
export function TerritoryOverviewLayout({
  title,
  description,
  selector,
  map,
  answer,
  bestList,
  worstList,
  table,
}: TerritoryOverviewLayoutProps) {
  return (
    <OverviewPageRoot>
      <div className="space-y-5 md:space-y-7">
        <PageHeader
          className="mx-0 mb-0 max-w-none p-0 md:mb-0"
          title={title}
          description={description}
        />
        {selector}
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <div className="relative h-[28rem] lg:h-[calc(100dvh-13.5rem)]">
            <div className="absolute inset-0">{map}</div>
          </div>
          {answer}
        </div>
      </div>

      {bestList && worstList && (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {bestList}
          {worstList}
        </div>
      )}

      {table}
    </OverviewPageRoot>
  );
}
