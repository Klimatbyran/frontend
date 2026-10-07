import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { getEntityDetailPath, localizedPath } from "@/utils/routing";
import { formatAnnualChange } from "@/utils/territories/territoryOverviewStory";
import type { TerritoryStoryRow } from "@/utils/territories/territoryOverviewStory";

type SortKey = "name" | "change" | "paris" | "plan";
type Direction = "asc" | "desc";

const PAGE_SIZE = 12;

const DEFAULT_DIRECTION: Record<SortKey, Direction> = {
  name: "asc",
  change: "asc",
  paris: "desc",
  plan: "desc",
};

export type TerritoryTableRow = TerritoryStoryRow & {
  climatePlan?: boolean;
};

function parisScore(row: TerritoryTableRow): number {
  if (row.meetsParis === true) return 1;
  if (row.meetsParis === false) return 0;
  return -1;
}

function compareRows(
  a: TerritoryTableRow,
  b: TerritoryTableRow,
  sortKey: SortKey,
  factor: number,
  locale: string,
): number {
  switch (sortKey) {
    case "name":
      return factor * a.name.localeCompare(b.name, locale);
    case "change": {
      const aMissing = a.historicalEmissionChangePercent == null;
      const bMissing = b.historicalEmissionChangePercent == null;
      if (aMissing && bMissing) return a.name.localeCompare(b.name, locale);
      if (aMissing) return 1;
      if (bMissing) return -1;
      const delta =
        factor *
        ((a.historicalEmissionChangePercent as number) -
          (b.historicalEmissionChangePercent as number));
      return delta === 0 ? a.name.localeCompare(b.name, locale) : delta;
    }
    case "paris": {
      const delta = factor * (parisScore(a) - parisScore(b));
      return delta === 0 ? a.name.localeCompare(b.name, locale) : delta;
    }
    case "plan": {
      const delta =
        factor *
        (Number(a.climatePlan === true) - Number(b.climatePlan === true));
      return delta === 0 ? a.name.localeCompare(b.name, locale) : delta;
    }
  }
}

function ParisBadge({
  value,
  storyKey,
}: {
  value: boolean | null;
  storyKey: string;
}) {
  const { t } = useTranslation();

  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2">
        <i className="size-1.5 rounded-full bg-blue-3" />
        {t(`${storyKey}.badgeOnTrack`)}
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-5/30 px-2.5 py-1 text-xs font-medium text-pink-2">
        <i className="size-1.5 rounded-full bg-pink-3" />
        {t(`${storyKey}.badgeOffTrack`)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45">
      <i className="size-1.5 rounded-full bg-white/25" />
      {t(`${storyKey}.badgeUnknown`)}
    </span>
  );
}

function PlanBadge({ value, storyKey }: { value: boolean; storyKey: string }) {
  const { t } = useTranslation();

  if (value) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2">
        <i className="size-1.5 rounded-full bg-blue-3" />
        {t(`${storyKey}.badgePlan`)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/55">
      <i className="size-1.5 rounded-full bg-white/25" />
      {t(`${storyKey}.badgeNoPlan`)}
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
  direction: Direction;
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "start" | "end" | "center";
  children: ReactNode;
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
          "inline-flex w-full items-center gap-1 font-normal transition-colors hover:text-white/70",
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

export function TerritoryOverviewTable({
  storyKey,
  entityType,
  rows,
  showClimatePlan = false,
}: {
  storyKey: string;
  entityType: "municipality" | "region";
  rows: TerritoryTableRow[];
  showClimatePlan?: boolean;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("paris");
  const [direction, setDirection] = useState<Direction>("desc");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) => row.name.toLowerCase().includes(needle))
      : rows;
    const factor = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) =>
      compareRows(a, b, sortKey, factor, currentLanguage),
    );
  }, [rows, query, sortKey, direction, currentLanguage]);

  const shown = sorted.slice(0, limit);
  const columnCount = showClimatePlan ? 4 : 3;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(DEFAULT_DIRECTION[key]);
    }
    setLimit(PAGE_SIZE);
  };

  const openRow = (
    row: TerritoryTableRow,
    event: Pick<MouseEvent, "metaKey" | "ctrlKey" | "shiftKey" | "button">,
  ) => {
    const href = localizedPath(
      currentLanguage,
      getEntityDetailPath(entityType, row.name),
    );
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button === 1
    ) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(href);
  };

  return (
    <section className="rounded-level-2 bg-black-2 p-5 md:p-7">
      <div>
        <h2 className="text-xl font-light md:text-[21px]">
          {t(`${storyKey}.tableTitle`)}
        </h2>
        <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-white/60">
          {t(`${storyKey}.tableDescription`)}
        </p>
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder={t(`${storyKey}.searchPlaceholder`)}
          className="h-10 w-full rounded-full bg-black-1 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-blue-3/60"
        />
      </div>

      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <SortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {t(`${storyKey}.colName`)}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="change"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className="text-white/40"
              >
                {t(`${storyKey}.colChange`)}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="paris"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="center"
                className="text-white/40"
              >
                {t(`${storyKey}.colOnTrack`)}
              </SortableColumnHead>
              {showClimatePlan && (
                <SortableColumnHead
                  columnKey="plan"
                  activeKey={sortKey}
                  direction={direction}
                  onSort={toggleSort}
                  align="center"
                  className="hidden text-white/40 sm:table-cell"
                >
                  {t(`${storyKey}.colPlan`)}
                </SortableColumnHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="py-8 text-center text-white/45"
                >
                  {t(`${storyKey}.noResults`)}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((row, index) => {
                const change = row.historicalEmissionChangePercent;
                const detailPath = getEntityDetailPath(entityType, row.name);

                return (
                  <TableRow
                    key={row.name}
                    className="cursor-pointer border-white/5 hover:bg-white/5"
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("a")) return;
                      openRow(row, event);
                    }}
                    onAuxClick={(event) => {
                      if ((event.target as HTMLElement).closest("a")) return;
                      openRow(row, event);
                    }}
                  >
                    <TableCell className="py-3">
                      <span className="mr-3 font-mono text-xs text-white/30">
                        {index + 1}
                      </span>
                      <LocalizedLink
                        to={detailPath}
                        className="hover:underline"
                      >
                        {row.name}
                      </LocalizedLink>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-3 text-right tabular-nums",
                        change == null
                          ? "text-white/30"
                          : change < 0
                            ? "text-blue-2"
                            : "text-pink-3",
                      )}
                    >
                      {change == null
                        ? t(`${storyKey}.noComparableData`)
                        : formatAnnualChange(change, currentLanguage)}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <ParisBadge value={row.meetsParis} storyKey={storyKey} />
                    </TableCell>
                    {showClimatePlan && (
                      <TableCell className="hidden py-3 text-center sm:table-cell">
                        <PlanBadge
                          value={row.climatePlan === true}
                          storyKey={storyKey}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
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
            {t(`${storyKey}.showMoreRows`, { count: PAGE_SIZE })}
          </button>
        )}
        <span className="text-xs text-grey">
          {t(`${storyKey}.showingCount`, {
            shown: shown.length,
            total: sorted.length,
          })}
        </span>
      </div>
    </section>
  );
}
