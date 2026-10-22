import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { sectorBaseColor } from "@/lib/constants/companyColors";
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
import { compareParisTrack } from "@/utils/data/parisTrackSort";
import {
  OverviewMobileColumnSelect,
  OverviewShowMoreFooter,
  OverviewSortableColumnHead,
  OverviewStatusBadge,
  OverviewTableSearch,
  overviewMetricColumnClass,
} from "@/components/overview/overviewTableChrome";

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
  const [sortKey, setSortKey] = useState<SortKey>("emissions");
  const [direction, setDirection] = useState<"asc" | "desc">(
    DEFAULT_DIRECTION.emissions,
  );
  const [mobileColumn, setMobileColumn] = useState<MetricColumn>("emissions");
  const [rowLimit, setRowLimit] = useState(PAGE_OVERVIEW_PAGE_SIZE);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    setRowLimit(PAGE_OVERVIEW_PAGE_SIZE);
  }, [sector, debouncedQuery]);

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

  const ordered = useMemo(() => {
    if (sortKey !== "paris") return companies;
    return [...companies].sort((a, b) =>
      compareParisTrack(a.meetsParis, b.meetsParis, direction),
    );
  }, [companies, sortKey, direction]);

  const shown = ordered.slice(0, rowLimit);
  const remaining = Math.max(total - shown.length, 0);
  const showMoreCount = Math.min(PAGE_OVERVIEW_PAGE_SIZE, remaining);

  const metricColumnClass = (column: MetricColumn, desktopWidth: string) =>
    overviewMetricColumnClass(
      column === mobileColumn,
      desktopWidth,
      "w-[8.5rem]",
    );

  const showingStaleRows = Boolean(refreshing) && companies.length > 0;

  const showMore = () => {
    const nextLimit = rowLimit + PAGE_OVERVIEW_PAGE_SIZE;
    setRowLimit(nextLimit);
    if (
      nextLimit > companies.length &&
      hasMore &&
      !fetchingMore &&
      !loading &&
      !refreshing
    ) {
      loadMore();
    }
  };

  return (
    <section
      className={cn(
        "min-w-0 rounded-level-2 bg-black-2 p-5 md:p-7",
        showingStaleRows && "opacity-60",
      )}
      aria-busy={showingStaleRows || undefined}
    >
      {showingStaleRows && (
        <span className="sr-only" role="status">
          {t("companiesOverviewPage.paris.tableLoading")}
        </span>
      )}
      <div>
        <h2 className="text-xl font-light md:text-[21px]">
          {t("companiesOverviewPage.paris.everyCompanyTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {t("companiesOverviewPage.paris.everyCompanyDescription")}
        </p>
      </div>

      <OverviewTableSearch
        value={query}
        onChange={setQuery}
        placeholder={t("companiesOverviewPage.paris.searchPlaceholder")}
      />

      <OverviewMobileColumnSelect
        id="company-metric-column"
        label={t("companiesOverviewPage.paris.showColumn")}
        value={mobileColumn}
        onChange={(value) => setMobileColumn(value as MetricColumn)}
        options={METRIC_COLUMNS.map((column) => ({
          value: column,
          label: t(METRIC_LABEL[column]),
        }))}
      />

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-8 text-right text-white/40 md:w-10">
                #
              </TableHead>
              <OverviewSortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {t("companiesOverviewPage.paris.colCompany")}
              </OverviewSortableColumnHead>
              <OverviewSortableColumnHead
                columnKey="industry"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className={cn(
                  "text-white/40",
                  metricColumnClass("industry", "md:w-[18%]"),
                )}
              >
                {t("companiesOverviewPage.paris.colIndustry")}
              </OverviewSortableColumnHead>
              <OverviewSortableColumnHead
                columnKey="emissions"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className={cn(
                  "text-white/40",
                  metricColumnClass("emissions", "md:w-[17%]"),
                )}
              >
                {t("companiesOverviewPage.paris.colEmissions")}
              </OverviewSortableColumnHead>
              <OverviewSortableColumnHead
                columnKey="change"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className={cn(
                  "text-white/40",
                  metricColumnClass("change", "md:w-[6.5rem] lg:w-[9.5rem]"),
                )}
              >
                {t("companiesOverviewPage.paris.colChange")}
              </OverviewSortableColumnHead>
              <OverviewSortableColumnHead
                columnKey="paris"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="center"
                className={cn(
                  "text-white/40",
                  metricColumnClass("paris", "md:w-[9.5rem] lg:w-[11.5rem]"),
                )}
              >
                {t("companiesOverviewPage.paris.colOnTrack")}
              </OverviewSortableColumnHead>
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
            {shown.map((company, index) => {
              const sectorCodeValue = overviewSectorCode(company);
              const industryColor = sectorCodeValue
                ? sectorBaseColor(sectorCodeValue)
                : undefined;
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
                      metricColumnClass("industry", "md:w-[18%]"),
                    )}
                  >
                    {sectorCodeValue && industryColor && (
                      <span className="inline-flex items-center gap-2">
                        <i
                          className="size-2 rounded-full"
                          style={{ backgroundColor: industryColor }}
                        />
                        {sectorNames[sectorCodeValue]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-right tabular-nums",
                      metricColumnClass("emissions", "md:w-[16%]"),
                      emissions === null && "text-white/30",
                    )}
                  >
                    {emissions === null ? (
                      t("companiesOverviewPage.paris.noData")
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
                      metricColumnClass("change", "md:w-[6.5rem] lg:w-[9rem]"),
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
                        "md:w-[9.5rem] lg:w-[11.5rem]",
                      ),
                    )}
                  >
                    <OverviewStatusBadge
                      value={company.meetsParis}
                      onLabel={t("companiesOverviewPage.paris.badgeOnTrack")}
                      offLabel={t("companiesOverviewPage.paris.badgeOffTrack")}
                      noDataLabel={t("companiesOverviewPage.paris.badgeNoData")}
                      className="sm:whitespace-normal md:whitespace-nowrap"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OverviewShowMoreFooter
        showMoreLabel={
          remaining > 0
            ? t("companiesOverviewPage.paris.showMoreRows", {
                count: showMoreCount,
              })
            : undefined
        }
        onShowMore={remaining > 0 ? showMore : undefined}
        showMoreDisabled={fetchingMore || loading || refreshing}
        countLabel={t("companiesOverviewPage.paris.showingCount", {
          shown: shown.length,
          total,
        })}
      />
    </section>
  );
}
