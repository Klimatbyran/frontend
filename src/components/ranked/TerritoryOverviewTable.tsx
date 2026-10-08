import { useMemo, useState } from "react";
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
import { useLanguage } from "@/components/LanguageProvider";
import { getSearchTerms } from "@/hooks/explore/exploreFilterUtils";
import { buildSearchRegex } from "@/utils/data/search";
import {
  createStatisticalGradient,
  DEFAULT_STATISTICAL_GRADIENT_COLORS,
} from "@/utils/ui/colorGradients";
import { cn } from "@/lib/utils";

type SortKey = "name" | "county" | "value" | "paris";
type MetricColumn = "county" | "value" | "paris";

const PAGE_SIZE = 12;

const DEFAULT_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  name: "asc",
  county: "asc",
  value: "asc",
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
  /** Hide the Paris column when the selected measure already is Paris. */
  showParis: boolean;
}

function parisScore(value: boolean | null | undefined): number {
  if (value === true) return 1;
  if (value === false) return 0;
  return -1;
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

function StatusBadge({
  value,
  onLabel,
  offLabel,
}: {
  value: boolean | null | undefined;
  onLabel: string;
  offLabel: string;
}) {
  const { t } = useTranslation();
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2">
        <i className="size-1.5 shrink-0 rounded-full bg-blue-3" />
        {onLabel}
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-pink-5/30 px-2.5 py-1 text-xs font-medium text-pink-2">
        <i className="size-1.5 shrink-0 rounded-full bg-pink-3" />
        {offLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45">
      <i className="size-1.5 shrink-0 rounded-full bg-white/25" />
      {t("territoryOverview.badgeNoData")}
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

function formatKpi(
  value: number | boolean | null,
  unit: string,
  isBoolean: boolean | undefined,
  labels: { true: string; false: string } | undefined,
  noData: string,
): string {
  if (typeof value === "boolean") {
    return value ? (labels?.true ?? "") : (labels?.false ?? "");
  }
  if (typeof value === "number" && !Number.isNaN(value)) {
    const formatted = `${value.toFixed(1)}${isBoolean ? "" : unit}`.replace(
      "-",
      "−",
    );
    return formatted;
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
          case "county":
            return (
              factor *
              (a.county ?? "").localeCompare(b.county ?? "", currentLanguage)
            );
          case "value":
            return compareNullableNumber(
              numericValue(a.kpiValue),
              numericValue(b.kpiValue),
              factor,
            );
          case "paris":
            return factor * (parisScore(a.paris) - parisScore(b.paris));
        }
      };

    const factor = direction === "asc" ? 1 : -1;
    const sortedRows = [...filtered].sort(compare(factor));
    // Rank follows the measure's better-first order, even when another column is sorted.
    const rankRows = [...filtered].sort((a, b) =>
      compareNullableNumber(
        numericValue(a.kpiValue),
        numericValue(b.kpiValue),
        higherIsBetter ? -1 : 1,
      ),
    );

    return {
      sorted: sortedRows,
      rankById: new Map(rankRows.map((row, index) => [row.id, index + 1])),
    };
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
    cn(
      column === mobileColumn ? "table-cell" : "hidden md:table-cell",
      desktop,
    );

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

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder={t(searchKey)}
          className="h-10 w-full rounded-full bg-black-1 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-blue-3/60"
        />
      </div>

      {metricColumns.length > 1 && (
        <label
          htmlFor="territory-metric-column"
          className="mt-4 flex items-center gap-3 text-sm text-white/60 md:hidden"
        >
          <span className="shrink-0">{t("territoryOverview.showColumn")}</span>
          <select
            id="territory-metric-column"
            value={mobileColumn}
            onChange={(event) =>
              setMobileColumn(event.target.value as MetricColumn)
            }
            className="h-10 min-w-0 flex-1 rounded-full bg-black-1 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-3/60"
          >
            {metricColumns.map((column) => (
              <option key={column} value={column}>
                {column === "county"
                  ? t("territoryOverview.colCounty")
                  : column === "paris"
                    ? t("territoryOverview.colOnTrack")
                    : kpiLabel}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-10 text-right text-white/40">#</TableHead>
              <SortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {nameLabel}
              </SortableColumnHead>
              {showCounty && (
                <SortableColumnHead
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
                </SortableColumnHead>
              )}
              <SortableColumnHead
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
              </SortableColumnHead>
              {showParis && (
                <SortableColumnHead
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
                </SortableColumnHead>
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
                  <TableCell className="py-3 text-right font-mono text-xs text-white/30">
                    {rankById.get(row.id)}
                  </TableCell>
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
                        "py-3 text-grey",
                        columnClass("county", ""),
                      )}
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
                      <StatusBadge
                        value={
                          typeof row.kpiValue === "boolean"
                            ? row.kpiValue
                            : null
                        }
                        onLabel={booleanLabels?.true ?? ""}
                        offLabel={booleanLabels?.false ?? ""}
                      />
                    ) : (
                      formatKpi(
                        row.kpiValue,
                        unit,
                        isBoolean,
                        booleanLabels,
                        noData,
                      )
                    )}
                  </TableCell>
                  {showParis && (
                    <TableCell
                      className={cn(
                        "py-3 text-center",
                        columnClass("paris", ""),
                      )}
                    >
                      <StatusBadge
                        value={row.paris}
                        onLabel={t("territoryOverview.badgeOnTrack")}
                        offLabel={t("territoryOverview.badgeOffTrack")}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {limit < sorted.length && (
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
            className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            {t("territoryOverview.showMoreRows", { count: PAGE_SIZE })}
          </button>
        )}
        <span className="text-xs text-grey">
          {sorted.length === 0
            ? t("territoryOverview.noMatches")
            : t(showingKey, { shown: shown.length, total: sorted.length })}
        </span>
      </div>
    </section>
  );
}
