import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BeeswarmTooltipProps {
  companyName: string;
  value: number;
  unit: string;
  position: { x: number; y: number } | null;
  formatValue?: (value: number, unit: string) => string;
  rawValue?: number;
  isCapped?: boolean;
  capThreshold?: number;
  // For MeetsParis visualization
  meetsParis?: boolean | null;
  budgetValue?: number; // Raw budget value in tonnes
  // For EmissionsChange visualization
  rank?: number | null;
  total?: number;
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
}: BeeswarmTooltipProps) {
  const { t } = useTranslation();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x + 10;
    let top = position.y + 10;

    // Adjust if tooltip would go off right edge
    if (left + rect.width > viewportWidth) {
      left = position.x - rect.width - 10;
    }

    // Adjust if tooltip would go off bottom edge
    if (top + rect.height > viewportHeight) {
      top = position.y - rect.height - 10;
    }

    // Ensure tooltip doesn't go off left or top edges
    left = Math.max(10, left);
    top = Math.max(10, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [position]);

  if (!position) return null;

  // MeetsParis mode: Show "Meets Paris" or "Fails Paris" + budget status
  if (meetsParis !== undefined && budgetValue !== undefined) {
    const meetsParisLabel =
      meetsParis === true
        ? t("companies.list.kpis.meetsParis.booleanLabels.true")
        : meetsParis === false
          ? t("companies.list.kpis.meetsParis.booleanLabels.false")
          : t("companies.list.kpis.meetsParis.nullValues");

    const budgetDisplay = formatValue
      ? formatValue(budgetValue, unit)
      : `${budgetValue < 0 ? "-" : "+"}${Math.abs(budgetValue).toFixed(1)}${unit}`;

    const budgetStatus =
      budgetValue < 0
        ? t("companiesRankedPage.visualizations.meetsParis.tooltip.underBudget")
        : budgetValue > 0
          ? t(
              "companiesRankedPage.visualizations.meetsParis.tooltip.overBudget",
            )
          : t("companiesRankedPage.visualizations.meetsParis.tooltip.onBudget");

    return (
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none bg-black/40 backdrop-blur-sm p-4 rounded-2xl"
      >
        <p className="text-white font-medium text-xl">{companyName}</p>
        <div className="space-y-1 mt-2">
          <p className="text-white/70">
            <span className="text-orange-2">{meetsParisLabel}</span>
          </p>
          <p className="text-white/50 text-sm">
            {budgetDisplay} {budgetStatus}
          </p>
        </div>
      </div>
    );
  }

  // Default mode: Show value, optionally with rank
  const displayValue =
    isCapped && rawValue !== undefined && capThreshold !== undefined
      ? formatValue
        ? formatValue(rawValue, unit)
        : `${rawValue < 0 ? "-" : "+"}${Math.abs(rawValue).toFixed(1)}${unit}`
      : formatValue
        ? formatValue(value, unit)
        : `${value.toFixed(1)}${unit}`;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-none bg-black/40 backdrop-blur-sm p-4 rounded-2xl"
    >
      <p className="text-white font-medium text-xl">{companyName}</p>
      <div className="space-y-1 mt-2">
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
            {t("companiesRankedPage.visualizations.beeswarm.tooltip.cappedAt")}{" "}
            {formatValue
              ? formatValue(capThreshold, unit)
              : `${capThreshold.toFixed(1)}${unit}`}{" "}
            {t(
              "companiesRankedPage.visualizations.beeswarm.tooltip.forChartVisibility",
            )}
          </p>
        )}
      </div>
    </div>
  );
}
