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

type SortKey = "paris" | "emissions" | "name";

const PAGE_SIZE = 12;

/** Descending reads as "best first" for a verdict, "biggest first" for a
 * quantity, and A–Z only makes sense ascending. */
const DEFAULT_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  paris: "desc",
  emissions: "desc",
  name: "asc",
};

function ParisBadge({ value }: { value: boolean | null | undefined }) {
  const { t } = useTranslation();

  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-5/40 px-2.5 py-1 text-xs font-medium text-blue-2">
        <i className="size-1.5 rounded-full bg-blue-3" />
        {t("companiesOverviewPage.paris.badgeOnTrack")}
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-5/30 px-2.5 py-1 text-xs font-medium text-pink-2">
        <i className="size-1.5 rounded-full bg-pink-3" />
        {t("companiesOverviewPage.paris.badgeOffTrack")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45">
      <i className="size-1.5 rounded-full bg-white/25" />
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

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? companies.filter((c) => c.name.toLowerCase().includes(needle))
      : companies;

    const factor = direction === "asc" ? 1 : -1;
    const score = (company: CompanyWithKPIs) => {
      if (sortKey === "emissions") return latestEmissions(company);
      // Unjudged companies sort below both verdicts rather than with "off".
      if (company.meetsParis === true) return 1;
      if (company.meetsParis === false) return 0;
      return -1;
    };

    return [...filtered].sort((a, b) =>
      sortKey === "name"
        ? factor * a.name.localeCompare(b.name, currentLanguage)
        : factor * (score(a) - score(b)),
    );
  }, [companies, query, sortKey, direction, currentLanguage]);

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
    <section className="rounded-level-2 bg-black-2 p-5 md:p-7">
      <div>
        <h2 className="text-xl font-light md:text-[21px]">
          {t("companiesOverviewPage.paris.everyCompanyTitle")}
        </h2>
        <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-white/60">
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
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-10 text-white/40">#</TableHead>
              <SortableColumnHead
                columnKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-white/40"
              >
                {t("companiesOverviewPage.paris.colCompany")}
              </SortableColumnHead>
              <TableHead className="hidden text-white/40 md:table-cell">
                {t("companiesOverviewPage.paris.colIndustry")}
              </TableHead>
              <SortableColumnHead
                columnKey="emissions"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="end"
                className="hidden text-white/40 sm:table-cell"
              >
                {t("companiesOverviewPage.paris.colEmissions")}
              </SortableColumnHead>
              <TableHead className="text-right text-white/40">
                {t("companiesOverviewPage.paris.colChange")}
              </TableHead>
              <SortableColumnHead
                columnKey="paris"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                align="center"
                className="text-white/40"
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
                  <TableCell className="py-3">
                    <LocalizedLink
                      to={detailPath}
                      className="truncate hover:underline"
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
                  <TableCell className="hidden py-3 text-right tabular-nums sm:table-cell">
                    {formatEmissionsAbsoluteCompact(
                      latestEmissions(company),
                      currentLanguage,
                    )}
                    <span className="ml-1 text-xs text-grey">
                      {t("emissionsUnit")}
                    </span>
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
                    {change === null || change === undefined
                      ? t("companiesOverviewPage.paris.noComparableData")
                      : formatPercentChange(change, currentLanguage, false)}
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
