import { useMemo, useState } from "react";
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
import { useLanguage } from "@/components/LanguageProvider";
import { getSearchTerms } from "@/hooks/explore/exploreFilterUtils";
import { buildSearchRegex } from "@/utils/data/search";
import {
  createStatisticalGradient,
  DEFAULT_STATISTICAL_GRADIENT_COLORS,
} from "@/utils/ui/colorGradients";
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

type SortKey = "name" | "county" | "value" | "paris";
type MetricColumn = "county" | "value" | "paris";

const PAGE_SIZE = 12;

const DEFAULT_DIRECTION: Record<Exclude<SortKey, "value">, "asc" | "desc"> = {
  name: "asc",
  county: "asc",
  paris: "desc",
};

export interface TerritoryTableRow {
  id: string;
  name: string;
  href: string;
  county?: string | null;
  kpiValue: number | boolean | null;
  paris?: boolean | null;
}

interface TerritoryOverviewTableProps {
  rows: TerritoryTableRow[];
  /** municipalities | regions, used for titles and the search field. */
  entityType: "municipalities" | "regions";
  kpiLabel: string;
  unit: string;
  isBoolean?: boolean;
  higherIsBetter: boolean;
  booleanLabels?: { true: string; false: string };
  /** Shown for a missing number, e.g. "no charging points". */
  nullLabel?: string;
  /** Hide the Paris column when the selected measure already is Paris. */
  showParis: boolean;
}

function numericValue(value: number | boolean | null): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
}

function compareNullableNumber(
  a: number | null,
  b: number | null,
  factor: number,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return factor * (a - b);
}

function formatKpi(
  value: number | boolean | null,
  unit: string,
  noData: string,
): string {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return `${value.toFixed(1)}${unit}`.replace("-", "−");
  }
  return noData;
}

export function TerritoryOverviewTable({
  rows,
  entityType,
  kpiLabel,
  unit,
  isBoolean,
  higherIsBetter,
  booleanLabels,
  nullLabel,
  showParis,
}: TerritoryOverviewTableProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const showCounty = rows.some((row) => row.county);
  const metricColumns: MetricColumn[] = [
    ...(showCounty ? (["county"] as const) : []),
    "value",
    ...(showParis ? (["paris"] as const) : []),
  ];

  const defaultDirection: "asc" | "desc" = higherIsBetter ? "desc" : "asc";

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [direction, setDirection] = useState<"asc" | "desc">(defaultDirection);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [mobileColumn, setMobileColumn] = useState<MetricColumn>("value");

  const { sorted, rankById } = useMemo(() => {
    const patterns = getSearchTerms(query).map((term) =>
      buildSearchRegex(term, currentLanguage, true),
    );
    const filtered = patterns.length
      ? rows.filter((row) =>
          patterns.some(
            (pattern) =>
              pattern.test(row.name) ||
              (row.county ? pattern.test(row.county) : false),
          ),
        )
      : rows;

    const compare =
      (factor: number) => (a: TerritoryTableRow, b: TerritoryTableRow) => {
        switch (sortKey) {
          case "name":
            return factor * a.name.localeCompare(b.name, currentLanguage);
          case "county": {
            const aCounty = a.county ?? "";
            const bCounty = b.county ?? "";
            if (!aCounty && !bCounty) return 0;
            if (!aCounty) return 1;
            if (!bCounty) return -1;
            return factor * aCounty.localeCompare(bCounty, currentLanguage);
          }
          case "value":
            return compareNullableNumber(
              numericValue(a.kpiValue),
              numericValue(b.kpiValue),
              factor,
            );
          case "paris":
            return compareParisTrack(a.paris, b.paris, direction);
        }
      };

    const factor = direction === "asc" ? 1 : -1;
    const sortedRows = [...filtered].sort(compare(factor));
    // Rank is the place among every territory on this measure, so search and
    // column sorts keep the number. Missing values stay unranked.
    const rankRows = [...rows].sort((a, b) =>
      compareNullableNumber(
        numericValue(a.kpiValue),
        numericValue(b.kpiValue),
        higherIsBetter ? -1 : 1,
      ),
    );
    const rankById = new Map<string, number>();
    let place = 1;
    for (const row of rankRows) {
      if (numericValue(row.kpiValue) == null) continue;
      rankById.set(row.id, place);
      place += 1;
    }

    return { sorted: sortedRows, rankById };
  }, [rows, query, sortKey, direction, currentLanguage, higherIsBetter]);

  const shown = sorted.slice(0, limit);
  const numbers = rows
    .map((row) => row.kpiValue)
    .filter((value): value is number => typeof value === "number");

  const titleKey =
    entityType === "regions"
      ? "territoryOverview.everyTitleRegions"
      : "territoryOverview.everyTitleMunicipalities";
  const searchKey =
    entityType === "regions"
      ? "territoryOverview.searchRegion"
      : "territoryOverview.searchMunicipality";
  const showingKey =
    entityType === "regions"
      ? "territoryOverview.showingRegions"
      : "territoryOverview.showingMunicipalities";
  const nameLabel =
    entityType === "regions"
      ? t("territoryOverview.colRegion")
      : t("territoryOverview.colMunicipality");

  const columnClass = (column: MetricColumn, desktop: string) =>
    overviewMetricColumnClass(column === mobileColumn, desktop);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "value" ? defaultDirection : DEFAULT_DIRECTION[key]);
    }
  };

  const noData = t("territoryOverview.badgeNoData");

  return (
    <section className="min-w-0 rounded-level-2 bg-black-2 p-5 md:p-7">
      <h2 className="text-xl font-light md:text-[21px]">{t(titleKey)}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {t("territoryOverview.everyDescription")}
      </p>

      <OverviewTableSearch
        value={query}
        onChange={(value) => {
          setQuery(value);
          setLimit(PAGE_SIZE);
        }}
        placeholder={t(searchKey)}
      />

      {metricColumns.length > 1 && (
        <OverviewMobileColumnSelect
          id="territory-metric-column"
          label={t("territoryOverview.showColumn")}
          value={mobileColumn}
          onChange={(value) => setMobileColumn(value as MetricColumn)}
          options={metricColumns.map((column) => ({
            value: column,
            label:
              column === "county"
                ? t("territoryOverview.colCounty")
                : column === "paris"
                  ? t("territoryOverview.colOnTrack")
                  : kpiLabel,
          }))}
        />
      )}

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {!isBoolean && (
                <TableHead className="w-10 text-right text-white/40">
                  #
                </TableHead>
              )}
              <OverviewSortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {nameLabel}
              </OverviewSortableColumnHead>
              {showCounty && (
                <OverviewSortableColumnHead
                  columnKey="county"
                  activeKey={sortKey}
                  direction={direction}
                  onSort={toggleSort}
                  className={cn(
                    "text-white/40",
                    columnClass("county", "md:w-[22%]"),
                  )}
                >
                  {t("territoryOverview.colCounty")}
                </OverviewSortableColumnHead>
              )}
              <OverviewSortableColumnHead
                columnKey="value"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align={isBoolean ? "center" : "end"}
                className={cn(
                  "text-white/40",
                  columnClass("value", "md:w-[9.5rem]"),
                )}
              >
                {kpiLabel}
              </OverviewSortableColumnHead>
              {showParis && (
                <OverviewSortableColumnHead
                  columnKey="paris"
                  activeKey={sortKey}
                  direction={direction}
                  onSort={toggleSort}
                  align="center"
                  className={cn(
                    "text-white/40",
                    columnClass("paris", "md:w-[11rem]"),
                  )}
                >
                  {t("territoryOverview.colOnTrack")}
                </OverviewSortableColumnHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row) => {
              const valueNumber = numericValue(row.kpiValue);
              const valueColor =
                typeof row.kpiValue === "number"
                  ? createStatisticalGradient(
                      numbers,
                      row.kpiValue,
                      higherIsBetter,
                      DEFAULT_STATISTICAL_GRADIENT_COLORS,
                    )
                  : undefined;
              return (
                <TableRow key={row.id} className="border-white/5">
                  {!isBoolean && (
                    <TableCell className="py-3 text-right font-mono text-xs text-white/30">
                      {rankById.get(row.id) ?? "–"}
                    </TableCell>
                  )}
                  <TableCell className="py-3">
                    <LocalizedLink
                      to={row.href}
                      className="block truncate hover:underline"
                    >
                      {row.name}
                    </LocalizedLink>
                  </TableCell>
                  {showCounty && (
                    <TableCell
                      className={cn(
                        "truncate py-3 text-grey",
                        columnClass("county", ""),
                      )}
                      title={row.county ?? undefined}
                    >
                      {row.county}
                    </TableCell>
                  )}
                  <TableCell
                    className={cn(
                      "py-3 tabular-nums",
                      isBoolean ? "text-center" : "text-right",
                      columnClass("value", ""),
                      valueNumber == null && "text-white/30",
                    )}
                    style={valueColor ? { color: valueColor } : undefined}
                  >
                    {isBoolean ? (
                      <OverviewStatusBadge
                        value={
                          typeof row.kpiValue === "boolean"
                            ? row.kpiValue
                            : null
                        }
                        onLabel={booleanLabels?.true ?? ""}
                        offLabel={booleanLabels?.false ?? ""}
                        noDataLabel={noData}
                      />
                    ) : (
                      formatKpi(row.kpiValue, unit, nullLabel || noData)
                    )}
                  </TableCell>
                  {showParis && (
                    <TableCell
                      className={cn(
                        "py-3 text-center",
                        columnClass("paris", ""),
                      )}
                    >
                      <OverviewStatusBadge
                        value={row.paris}
                        onLabel={t("territoryOverview.badgeOnTrack")}
                        offLabel={t("territoryOverview.badgeOffTrack")}
                        noDataLabel={noData}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OverviewShowMoreFooter
        showMoreLabel={
          limit < sorted.length
            ? t("territoryOverview.showMoreRows", { count: PAGE_SIZE })
            : undefined
        }
        onShowMore={
          limit < sorted.length
            ? () => setLimit((value) => value + PAGE_SIZE)
            : undefined
        }
        countLabel={
          sorted.length === 0
            ? t("territoryOverview.noMatches")
            : t(showingKey, { shown: shown.length, total: sorted.length })
        }
      />
    </section>
  );
}
