import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { cn } from "@/lib/utils";

export interface IndustryChipOption {
  code: SectorCode;
  companyCount: number;
}

export interface IndustryChipFilterProps {
  options: IndustryChipOption[];
  selected: SectorCode | null;
  totalCount: number;
  onSelect: (code: SectorCode | null) => void;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors",
        active
          ? "border-blue-3/60 bg-blue-5/40 text-blue-2"
          : "border-white/10 bg-black-1 text-white/80 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Collapsed to "All industries" plus whatever is selected, so the bar stays
 * one quiet row until someone asks for the full set. The selected chip and
 * the "all" chip both survive collapsing, keeping the way back one click away.
 */
export function IndustryChipFilter({
  options,
  selected,
  totalCount,
  onSelect,
}: IndustryChipFilterProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded
    ? options
    : options.filter((option) => option.code === selected);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] uppercase tracking-[0.06em] text-white/40">
        {t("companiesOverviewPage.paris.industryLabel")}
      </span>

      <Chip active={selected === null} onClick={() => onSelect(null)}>
        {t("companiesOverviewPage.paris.allIndustries")}
        <span className="text-[11px] text-white/45 tabular-nums">
          {totalCount}
        </span>
      </Chip>

      {visible.map((option) => (
        <Chip
          key={option.code}
          active={selected === option.code}
          onClick={() => onSelect(selected === option.code ? null : option.code)}
        >
          <i
            className="size-2 rounded-full"
            style={{ backgroundColor: sectorColors[option.code].base }}
          />
          {sectorNames[option.code]}
          <span className="text-[11px] text-white/45 tabular-nums">
            {option.companyCount}
          </span>
        </Chip>
      ))}

      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white/45 transition-colors hover:text-white"
      >
        {expanded
          ? t("companiesOverviewPage.paris.showLess")
          : t("companiesOverviewPage.paris.showMore")}
        <ChevronDown
          className={cn("size-3 transition-transform", expanded && "rotate-180")}
        />
      </button>
    </div>
  );
}
