import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface BeeswarmTooltipProps {
  companyName: string;
  value: number;
  unit: string;
  position: { x: number; y: number } | null;
  formatValue?: (value: number, unit: string) => string;
  rawValue?: number;
  isCapped?: boolean;
  capThreshold?: number;
  meetsParis?: boolean | null;
  budgetValue?: number;
  rank?: number | null;
  total?: number;
  isMobile?: boolean;
  wikidataId?: string;
}

function formatNumericValue(
  value: number,
  unit: string,
  formatValue?: (value: number, unit: string) => string,
): string {
  if (formatValue) return formatValue(value, unit);
  return `${value < 0 ? "-" : "+"}${Math.abs(value).toFixed(1)}${unit}`;
}

function useTooltipPosition(
  position: { x: number; y: number } | null,
  tooltipRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!position || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x + 10;
    let top = position.y + 10;

    if (left + rect.width > viewportWidth) {
      left = position.x - rect.width - 10;
    }
    if (top + rect.height > viewportHeight) {
      top = position.y - rect.height - 10;
    }

    left = Math.max(10, left);
    top = Math.max(10, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [position, tooltipRef]);
}

function TooltipShell({
  tooltipRef,
  companyName,
  onClick,
  children,
}: {
  tooltipRef: React.RefObject<HTMLDivElement>;
  companyName: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-auto bg-black/40 backdrop-blur-sm p-4 rounded-2xl"
    >
      <button
        onClick={onClick}
        className="w-full text-left hover:opacity-80 transition-opacity"
      >
        <p className="text-white font-medium text-xl">{companyName}</p>
      </button>
      <div className="space-y-1 mt-2">{children}</div>
    </div>
  );
}

function MeetsParisTooltipContent({
  meetsParis,
  budgetValue,
  unit,
  formatValue,
  t,
}: {
  meetsParis: boolean | null;
  budgetValue: number;
  unit: string;
  formatValue?: (value: number, unit: string) => string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const meetsParisLabel =
    meetsParis === true
      ? t("companies.list.kpis.meetsParis.booleanLabels.true")
      : meetsParis === false
        ? t("companies.list.kpis.meetsParis.booleanLabels.false")
        : t("companies.list.kpis.meetsParis.nullValues");

  const budgetDisplay = formatNumericValue(budgetValue, unit, formatValue);

  const budgetStatus =
    budgetValue < 0
      ? t("companiesOverviewPage.visualizations.meetsParis.tooltip.underBudget")
      : budgetValue > 0
        ? t("companiesOverviewPage.visualizations.meetsParis.tooltip.overBudget")
        : t("companiesOverviewPage.visualizations.meetsParis.tooltip.onBudget");

  return (
    <>
      <p className="text-white/70">
        <span className="text-orange-2">{meetsParisLabel}</span>
      </p>
      <p className="text-white/50 text-sm">
        {budgetDisplay} {budgetStatus}
      </p>
    </>
  );
}

function DefaultTooltipContent({
  value,
  unit,
  formatValue,
  rank,
  total,
  isCapped,
  rawValue,
  capThreshold,
  t,
}: {
  value: number;
  unit: string;
  formatValue?: (value: number, unit: string) => string;
  rank?: number | null;
  total?: number;
  isCapped?: boolean;
  rawValue?: number;
  capThreshold?: number;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const displayValue =
    isCapped && rawValue !== undefined && capThreshold !== undefined
      ? formatNumericValue(rawValue, unit, formatValue)
      : formatValue
        ? formatValue(value, unit)
        : `${value.toFixed(1)}${unit}`;

  return (
    <>
      <p className="text-white/70">
        <span className="text-orange-2">{displayValue}</span>
      </p>
      {rank !== null && rank !== undefined && total !== undefined && (
        <p className="text-white/50 text-sm">
          {t("rankedList.rank", {
            rank: String(rank),
            total: String(total),
          })}
        </p>
      )}
      {isCapped && rawValue !== undefined && capThreshold !== undefined && (
        <p className="text-white/50 text-sm">
          {t("companiesOverviewPage.visualizations.beeswarm.tooltip.cappedAt")}{" "}
          {formatValue
            ? formatValue(capThreshold, unit)
            : `${capThreshold.toFixed(1)}${unit}`}{" "}
          {t(
            "companiesOverviewPage.visualizations.beeswarm.tooltip.forChartVisibility",
          )}
        </p>
      )}
    </>
  );
}

export function BeeswarmTooltip({
  companyName,
  value,
  unit,
  position,
  formatValue,
  rawValue,
  isCapped,
  capThreshold,
  meetsParis,
  budgetValue,
  rank,
  total,
  isMobile,
  wikidataId,
}: BeeswarmTooltipProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useTooltipPosition(position, tooltipRef);

  const handleTooltipMobileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile && wikidataId) {
      navigate(`/companies/${wikidataId}`);
    }
  };

  if (!position) return null;

  const isMeetsParisMode =
    meetsParis !== undefined && budgetValue !== undefined;

  return (
    <TooltipShell
      tooltipRef={tooltipRef}
      companyName={companyName}
      onClick={handleTooltipMobileClick}
    >
      {isMeetsParisMode ? (
        <MeetsParisTooltipContent
          meetsParis={meetsParis}
          budgetValue={budgetValue}
          unit={unit}
          formatValue={formatValue}
          t={t}
        />
      ) : (
        <DefaultTooltipContent
          value={value}
          unit={unit}
          formatValue={formatValue}
          rank={rank}
          total={total}
          isCapped={isCapped}
          rawValue={rawValue}
          capThreshold={capThreshold}
          t={t}
        />
      )}
    </TooltipShell>
  );
}
