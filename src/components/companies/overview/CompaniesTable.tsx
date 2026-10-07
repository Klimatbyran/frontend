import { useMemo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import { localizedPath } from "@/utils/routing";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsoluteCompact,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { latestEmissions } from "@/hooks/companies/parisOverviewUtils";
import type { CompanyWithKPIs } from "@/types/company";
import { cn } from "@/lib/utils";

type SortKey = "index" | "name" | "industry" | "emissions" | "change" | "paris";

const PAGE_SIZE = 12;

/** Default direction per column the first time it is selected. */
const DEFAULT_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  index: "asc",
  name: "asc",
  industry: "asc",
  emissions: "desc",
  change: "asc",
  paris: "desc",
};

function sectorCode(company: CompanyWithKPIs): SectorCode | undefined {
  return company.industry?.industryGics?.sectorCode as SectorCode | undefined;
}

function parisScore(company: CompanyWithKPIs): number {
  if (company.meetsParis === true) return 1;
  if (company.meetsParis === false) return 0;
  return -1;
}

function compareNullableNumber(
  a: number | null | undefined,
  b: number | null | undefined,
  factor: number,
): number {
  const missingA = a == null;
  const missingB = b == null;
  if (missingA && missingB) return 0;
  if (missingA) return 1;
  if (missingB) return -1;
  return factor * (a - b);
}

function compareStringsEmptyLast(
  a: string,
  b: string,
  factor: number,
  locale: string,
): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return factor * a.localeCompare(b, locale);
}

function compareCompanies(
  a: CompanyWithKPIs,
  b: CompanyWithKPIs,
  sortKey: SortKey,
  factor: number,
  locale: string,
  sectorNames: Record<string, string>,
  sourceIndex: Map<string, number>,
): number {
  switch (sortKey) {
    case "index":
      return (
        factor * ((sourceIndex.get(a.id) ?? 0) - (sourceIndex.get(b.id) ?? 0))
      );
    case "name":
      return factor * a.name.localeCompare(b.name, locale);
    case "industry": {
      const labelA = sectorCode(a) ? (sectorNames[sectorCode(a)!] ?? "") : "";
      const labelB = sectorCode(b) ? (sectorNames[sectorCode(b)!] ?? "") : "";
      return compareStringsEmptyLast(labelA, labelB, factor, locale);
    }
    case "emissions":
      return compareNullableNumber(
        latestEmissions(a),
        latestEmissions(b),
        factor,
      );
    case "change":
      return compareNullableNumber(
        a.emissionsChangeFromBaseYear,
        b.emissionsChangeFromBaseYear,
        factor,
      );
    case "paris":
      return factor * (parisScore(a) - parisScore(b));
  }
}

function ParisBadge({ value }: { value: boolean | null | undefined }) {
  const { t } = useTranslation();

  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2 max-md:max-w-full max-md:whitespace-normal max-md:text-left md:whitespace-nowrap">
        <i className="size-1.5 shrink-0 rounded-full bg-blue-3" />
        <span className="max-md:min-w-0">
          {t("companiesOverviewPage.paris.badgeOnTrack")}
        </span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-5/30 px-2.5 py-1 text-xs font-medium text-pink-2 max-md:max-w-full max-md:whitespace-normal max-md:text-left md:whitespace-nowrap">
        <i className="size-1.5 shrink-0 rounded-full bg-pink-3" />
        <span className="max-md:min-w-0">
          {t("companiesOverviewPage.paris.badgeOffTrack")}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45 max-md:max-w-full max-md:whitespace-normal max-md:text-left md:whitespace-nowrap">
      <i className="size-1.5 shrink-0 rounded-full bg-white/25" />
      <span className="max-md:min-w-0">
        {t("companiesOverviewPage.paris.badgeNoData")}
      </span>
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
          "inline-flex w-full min-w-0 items-center gap-1 font-normal transition-colors hover:text-white/70 max-md:whitespace-normal max-md:text-left",
          align === "end" && "justify-end max-md:text-right",
          align === "center" && "justify-center max-md:text-center",
          active ? "text-white/70" : "text-inherit",
        )}
      >
        <span className="max-md:min-w-0">{children}</span>
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
  companies: CompanyWithKPIs[];
}

/** The overview's own list: one row per company with the two figures the page
 * is about, rather than the card grid used on Explore. */
function companyDetailHref(company: CompanyWithKPIs, language: string): string {
  return localizedPath(language, getCompanyDetailPath(company));
}

function openCompanyDetail(
  company: CompanyWithKPIs,
  language: string,
  navigate: ReturnType<typeof useNavigate>,
  event: Pick<MouseEvent, "metaKey" | "ctrlKey" | "shiftKey" | "button">,
) {
  const href = companyDetailHref(company, language);
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  navigate(href);
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const sectorNames = useSectorNames();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("paris");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const sourceIndex = useMemo(() => {
    const map = new Map<string, number>();
    companies.forEach((company, index) => map.set(company.id, index));
    return map;
  }, [companies]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? companies.filter((c) => c.name.toLowerCase().includes(needle))
      : companies;

    const factor = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) =>
      compareCompanies(
        a,
        b,
        sortKey,
        factor,
        currentLanguage,
        sectorNames,
        sourceIndex,
      ),
    );
  }, [
    companies,
    query,
    sortKey,
    direction,
    currentLanguage,
    sectorNames,
    sourceIndex,
  ]);

  const shown = rows.slice(0, limit);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(DEFAULT_DIRECTION[key]);
    }
    setLimit(PAGE_SIZE);
  };

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
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder={t("companiesOverviewPage.paris.searchPlaceholder")}
          className="h-10 w-full rounded-full bg-black-1 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-blue-3/60"
        />
      </div>

      <div className="mt-4">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <SortableColumnHead
                columnKey="index"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className="w-8 text-white/40 md:w-10"
              >
                #
              </SortableColumnHead>
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
                className="hidden text-white/40 md:table-cell md:w-[18%]"
              >
                {t("companiesOverviewPage.paris.colIndustry")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="emissions"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className="hidden text-white/40 sm:table-cell sm:w-[16%]"
              >
                {t("companiesOverviewPage.paris.colEmissions")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="change"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className="w-[5.75rem] text-white/40 md:w-[6.5rem] lg:w-[9rem]"
              >
                {t("companiesOverviewPage.paris.colChange")}
              </SortableColumnHead>
              <SortableColumnHead
                columnKey="paris"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="center"
                className="w-[7.5rem] text-white/40 md:w-[9.5rem] lg:w-[11.5rem]"
              >
                {t("companiesOverviewPage.paris.colOnTrack")}
              </SortableColumnHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((company, index) => {
              const sector = company.industry?.industryGics?.sectorCode as
                | SectorCode
                | undefined;
              const change = company.emissionsChangeFromBaseYear;
              const emissions = latestEmissions(company);

              const detailPath = getCompanyDetailPath(company);

              const goToDetail = (event: MouseEvent<HTMLTableRowElement>) => {
                if ((event.target as HTMLElement).closest("a")) {
                  return;
                }
                openCompanyDetail(company, currentLanguage, navigate, event);
              };

              return (
                <TableRow
                  key={company.id}
                  className="cursor-pointer border-white/5 hover:bg-white/5"
                  onClick={goToDetail}
                  onAuxClick={goToDetail}
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
                  <TableCell className="hidden py-3 text-grey md:table-cell">
                    {sector && (
                      <span className="inline-flex items-center gap-2">
                        <i
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: sectorColors[sector].base,
                          }}
                        />
                        {sectorNames[sector]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "hidden py-3 text-right tabular-nums sm:table-cell",
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
                  <TableCell className="py-3 text-center">
                    <ParisBadge value={company.meetsParis} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {limit < rows.length && (
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
            className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            {t("companiesOverviewPage.paris.showMoreRows", {
              count: PAGE_SIZE,
            })}
          </button>
        )}
        <span className="text-xs text-grey">
          {t("companiesOverviewPage.paris.showingCount", {
            shown: shown.length,
            total: rows.length,
          })}
        </span>
      </div>
    </section>
  );
}
