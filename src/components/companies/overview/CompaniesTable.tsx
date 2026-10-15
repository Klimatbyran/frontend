import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocalizedLink } from "@/components/LocalizedLink";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsoluteCompact,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  latestEmissions,
  overviewSectorCode,
} from "@/hooks/companies/parisOverviewUtils";
import {
  PAGE_OVERVIEW_PAGE_SIZE,
  usePageCompaniesOverviewList,
  type OverviewListSortBy,
} from "@/hooks/pages/usePageCompaniesOverview";
import { cn } from "@/lib/utils";

type SortKey = "name" | "industry" | "emissions" | "change" | "paris";

type MetricColumn = "industry" | "emissions" | "change" | "paris";

const METRIC_COLUMNS: MetricColumn[] = [
  "industry",
  "emissions",
  "change",
  "paris",
];

const METRIC_LABEL: Record<MetricColumn, string> = {
  industry: "companiesOverviewPage.paris.colIndustry",
  emissions: "companiesOverviewPage.paris.colEmissions",
  change: "companiesOverviewPage.paris.colChange",
  paris: "companiesOverviewPage.paris.colOnTrack",
};

/** Default direction per column the first time it is selected. */
const DEFAULT_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  name: "asc",
  industry: "asc",
  emissions: "desc",
  change: "asc",
  paris: "desc",
};

const SEARCH_DEBOUNCE_MS = 300;

function toApiSortBy(sortKey: SortKey): OverviewListSortBy {
  return sortKey === "industry" ? "sector" : sortKey;
}

/** On small screens one metric sits beside the name. The rest return at md. */
function metricColumnClass(
  column: MetricColumn,
  selected: MetricColumn,
  desktopWidth: string,
) {
  return cn(
    column === selected ? "table-cell w-[8.5rem]" : "hidden md:table-cell",
    desktopWidth,
  );
}

function ParisBadge({ value }: { value: boolean | null | undefined }) {
  const { t } = useTranslation();

  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2 sm:whitespace-normal md:whitespace-nowrap">
        <i className="size-1.5 shrink-0 rounded-full bg-blue-3" />
        {t("companiesOverviewPage.paris.badgeOnTrack")}
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-pink-5/30 px-2.5 py-1 text-xs font-medium text-pink-2 sm:whitespace-normal md:whitespace-nowrap">
        <i className="size-1.5 shrink-0 rounded-full bg-pink-3" />
        {t("companiesOverviewPage.paris.badgeOffTrack")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45 sm:whitespace-normal md:whitespace-nowrap">
      <i className="size-1.5 shrink-0 rounded-full bg-white/25" />
      {t("companiesOverviewPage.paris.badgeNoData")}
    </span>
  );
}

function SortableColumnHead({
  columnKey,
  activeKey,
  direction,
  onSort,
  className,
  align = "start",
  children,
}: {
  columnKey: SortKey;
  activeKey: SortKey;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  const active = activeKey === columnKey;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        aria-sort={
          active
            ? direction === "asc"
              ? "ascending"
              : "descending"
            : undefined
        }
        className={cn(
          "inline-flex w-full min-w-0 items-center gap-1 font-normal transition-colors hover:text-white/70",
          align === "end" && "justify-end",
          align === "center" && "justify-center",
          active ? "text-white/70" : "text-inherit",
        )}
      >
        {children}
        {active &&
          (direction === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0 opacity-80" aria-hidden />
          ))}
      </button>
    </TableHead>
  );
}

export interface CompaniesTableProps {
  sector: SectorCode | null;
  /** When false, skip list fetches (e.g. while a URL sector is still validating). */
  enabled?: boolean;
}

/** Server-paged overview table: sort/search/show-more hit `/pages/companies-overview`. */
export function CompaniesTable({
  sector,
  enabled = true,
}: CompaniesTableProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const sectorNames = useSectorNames();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("paris");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [mobileColumn, setMobileColumn] = useState<MetricColumn>("paris");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  const {
    companies,
    total,
    loading,
    refreshing,
    fetchingMore,
    hasMore,
    loadMore,
    error,
  } = usePageCompaniesOverviewList({
    sector,
    q: debouncedQuery,
    sortBy: toApiSortBy(sortKey),
    sortDir: direction,
    enabled,
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(DEFAULT_DIRECTION[key]);
    }
  };

  const remaining = Math.max(total - companies.length, 0);
  const showMoreCount = Math.min(PAGE_OVERVIEW_PAGE_SIZE, remaining);

  return (
    <section className="min-w-0 rounded-level-2 bg-black-2 p-5 md:p-7">
      <div>
        <h2 className="text-xl font-light md:text-[21px]">
          {t("companiesOverviewPage.paris.everyCompanyTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {t("companiesOverviewPage.paris.everyCompanyDescription")}
        </p>
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("companiesOverviewPage.paris.searchPlaceholder")}
          className="h-10 w-full rounded-full bg-black-1 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-blue-3/60"
        />
      </div>

      <label
        htmlFor="company-metric-column"
        className="mt-4 flex items-center gap-3 text-sm text-white/60 md:hidden"
      >
        <span className="shrink-0">
          {t("companiesOverviewPage.paris.showColumn")}
        </span>
        <select
          id="company-metric-column"
          value={mobileColumn}
          onChange={(event) =>
            setMobileColumn(event.target.value as MetricColumn)
          }
          className="h-10 min-w-0 flex-1 rounded-full bg-black-1 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-3/60"
        >
          {METRIC_COLUMNS.map((column) => (
            <option key={column} value={column}>
              {t(METRIC_LABEL[column])}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-8 text-right text-white/40 md:w-10">
                #
              </TableHead>
              <SortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {t("companiesOverviewPage.paris.colCompany")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="industry"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className={cn(
                  "text-white/40",
                  metricColumnClass("industry", mobileColumn, "md:w-[18%]"),
                )}
              >
                {t("companiesOverviewPage.paris.colIndustry")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="emissions"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className={cn(
                  "text-white/40",
                  metricColumnClass("emissions", mobileColumn, "md:w-[16%]"),
                )}
              >
                {t("companiesOverviewPage.paris.colEmissions")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="change"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className={cn(
                  "text-white/40",
                  metricColumnClass(
                    "change",
                    mobileColumn,
                    "md:w-[6.5rem] lg:w-[9.5rem]",
                  ),
                )}
              >
                {t("companiesOverviewPage.paris.colChange")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="paris"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="center"
                className={cn(
                  "text-white/40",
                  metricColumnClass(
                    "paris",
                    mobileColumn,
                    "md:w-[9.5rem] lg:w-[11.5rem]",
                  ),
                )}
              >
                {t("companiesOverviewPage.paris.colOnTrack")}
              </SortableColumnHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && companies.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-white/45"
                >
                  {t("companiesOverviewPage.paris.tableLoading")}
                </TableCell>
              </TableRow>
            )}
            {!loading && error && companies.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-red-400"
                >
                  {t("companiesOverviewPage.paris.tableError")}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && companies.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-white/45"
                >
                  {t("companiesOverviewPage.paris.tableEmpty")}
                </TableCell>
              </TableRow>
            )}
            {companies.map((company, index) => {
              const sectorCodeValue = overviewSectorCode(company);
              const change = company.emissionsChangeFromBaseYear;
              const emissions = latestEmissions(company);
              const detailPath = getCompanyDetailPath(company);

              return (
                <TableRow
                  key={company.id}
                  className="border-white/5 hover:bg-white/5"
                >
                  <TableCell className="py-3 text-right font-mono text-xs text-white/30">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-0 overflow-hidden py-3">
                    <LocalizedLink
                      to={detailPath}
                      className="block truncate hover:underline"
                    >
                      {company.name}
                    </LocalizedLink>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-grey",
                      metricColumnClass("industry", mobileColumn, "md:w-[18%]"),
                    )}
                  >
                    {sectorCodeValue && (
                      <span className="inline-flex items-center gap-2">
                        <i
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: sectorColors[sectorCodeValue].base,
                          }}
                        />
                        {sectorNames[sectorCodeValue]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-right tabular-nums",
                      metricColumnClass(
                        "emissions",
                        mobileColumn,
                        "md:w-[16%]",
                      ),
                      emissions === null && "text-white/30",
                    )}
                  >
                    {emissions === null ? (
                      t("companiesOverviewPage.paris.noComparableData")
                    ) : (
                      <>
                        {formatEmissionsAbsoluteCompact(
                          emissions,
                          currentLanguage,
                        )}
                        <span className="ml-1 text-xs text-grey">
                          {t("emissionsUnit")}
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-right tabular-nums",
                      metricColumnClass(
                        "change",
                        mobileColumn,
                        "md:w-[6.5rem] lg:w-[9rem]",
                      ),
                      change === null || change === undefined
                        ? "text-white/30"
                        : change < 0
                          ? "text-blue-2"
                          : "text-pink-3",
                    )}
                  >
                    {change === null || change === undefined ? (
                      t("companiesOverviewPage.paris.noComparableData")
                    ) : (
                      <span className="whitespace-nowrap">
                        {formatPercentChange(change, currentLanguage, false)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-center",
                      metricColumnClass(
                        "paris",
                        mobileColumn,
                        "md:w-[9.5rem] lg:w-[11.5rem]",
                      ),
                    )}
                  >
                    <ParisBadge value={company.meetsParis} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={fetchingMore || loading || refreshing}
            className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {t("companiesOverviewPage.paris.showMoreRows", {
              count: showMoreCount,
            })}
          </button>
        )}
        <span className="text-xs text-grey">
          {t("companiesOverviewPage.paris.showingCount", {
            shown: companies.length,
            total,
          })}
        </span>
      </div>
    </section>
  );
}
