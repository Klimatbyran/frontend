import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompanyWithKPIs } from "@/types/company";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartMotion } from "@/hooks/useChartMotion";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
} from "@/utils/formatting/localization";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import {
  buildEmissionsChangeHistogram,
  type EmissionsChangeCompanyEntry,
} from "@/utils/visualizations/emissionsChangeHistogram";
import { BeeswarmLegend } from "./BeeswarmLegend";

interface EmissionsChangeBarChartProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface ChartRow {
  label: string;
  fullLabel: string;
  totalEmissions: number;
  binMid: number;
  [companyId: string]: number | string;
}

function formatCompactBinLabel(label: string): string {
  const [start] = label.split("–");
  return start.replace("%", "");
}

function getChangeColor(
  changePercent: number,
  minChange: number,
  maxChange: number,
): string {
  return createSymmetricRangeGradient(minChange, maxChange, changePercent);
}

function buildLegendGradient(
  minChange: number,
  maxChange: number,
): string | undefined {
  if (!Number.isFinite(minChange) || !Number.isFinite(maxChange)) {
    return undefined;
  }

  if (minChange === maxChange) {
    return getChangeColor(minChange, minChange, maxChange);
  }

  const steps = 5;
  const stops = Array.from({ length: steps }, (_, index) => {
    const percent = (index / (steps - 1)) * 100;
    const value = minChange + ((maxChange - minChange) * index) / (steps - 1);
    return `${getChangeColor(value, minChange, maxChange)} ${percent}%`;
  });

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function ChartTooltip({
  active,
  payload,
  label,
  companyById,
  currentLanguage,
  t,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  companyById: Map<string, EmissionsChangeCompanyEntry>;
  currentLanguage: ReturnType<typeof useLanguage>["currentLanguage"];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const activeSegment = [...payload]
    .reverse()
    .find((item) => typeof item.value === "number" && item.value > 0);

  if (!activeSegment) {
    return null;
  }

  const company = companyById.get(String(activeSegment.dataKey));
  if (!company) {
    return null;
  }

  return (
    <div className="rounded-level-1 border border-white/10 bg-black-1 px-3 py-2 text-xs text-white shadow-xl">
      <p className="font-medium">{company.name}</p>
      <p className="text-grey">{label}</p>
      <p className="text-grey">
        {t(
          "companiesOverviewPage.visualizations.emissionsChange.tooltip.change",
          { value: company.changePercent.toFixed(1) },
        )}
      </p>
      <p className="text-grey">
        {t(
          "companiesOverviewPage.visualizations.emissionsChange.tooltip.emissions",
          {
            value: formatEmissionsAbsolute(company.emissions, currentLanguage),
          },
        )}
      </p>
    </div>
  );
}

export function EmissionsChangeBarChart({
  companies,
  onCompanyClick,
}: EmissionsChangeBarChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const { reduceMotion, barDuration } = useChartMotion();
  const [mobileSelectedCompanyId, setMobileSelectedCompanyId] = useState<
    string | null
  >(null);

  const histogram = useMemo(
    () => buildEmissionsChangeHistogram(companies),
    [companies],
  );

  const companySourceById = useMemo(() => {
    const map = new Map<string, CompanyWithKPIs>();
    companies.forEach((company) => {
      map.set(company.id, company);
    });
    return map;
  }, [companies]);

  const { chartData, stackCompanies, companyEntryById } = useMemo(() => {
    if (!histogram) {
      return {
        chartData: [] as ChartRow[],
        stackCompanies: [] as EmissionsChangeCompanyEntry[],
        companyEntryById: new Map<string, EmissionsChangeCompanyEntry>(),
      };
    }

    const entries = new Map<string, EmissionsChangeCompanyEntry>();
    histogram.bins.forEach((bin) => {
      bin.companies.forEach((company) => {
        entries.set(company.id, company);
      });
    });

    const stackCompanies = Array.from(entries.values()).sort(
      (a, b) => a.emissions - b.emissions,
    );

    const chartData = histogram.bins.map((bin) => {
      const row: ChartRow = {
        label: formatCompactBinLabel(bin.label),
        fullLabel: bin.label,
        totalEmissions: bin.totalEmissions,
        binMid: (bin.min + bin.max) / 2,
      };

      stackCompanies.forEach((company) => {
        row[company.id] = 0;
      });

      bin.companies.forEach((company) => {
        row[company.id] = company.emissions;
      });

      return row;
    });

    return { chartData, stackCompanies, companyEntryById: entries };
  }, [histogram]);

  const changeRange = useMemo(() => {
    const values = Array.from(companyEntryById.values()).map(
      (company) => company.changePercent,
    );

    if (values.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [companyEntryById]);

  const legendGradient = useMemo(
    () => buildLegendGradient(changeRange.min, changeRange.max),
    [changeRange.max, changeRange.min],
  );

  const handleCompanyClick = useCallback(
    (companyId: string) => {
      const company = companySourceById.get(companyId);
      if (!company) {
        return;
      }

      if (isMobile) {
        if (mobileSelectedCompanyId === companyId) {
          onCompanyClick?.(company);
          setMobileSelectedCompanyId(null);
          return;
        }

        setMobileSelectedCompanyId(companyId);
        return;
      }

      onCompanyClick?.(company);
    },
    [companySourceById, isMobile, mobileSelectedCompanyId, onCompanyClick],
  );

  if (!histogram || histogram.bins.length === 0) {
    return null;
  }

  const maxTotalEmissions = histogram.maxTotalEmissions;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-3">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 4, bottom: 4, left: 0 }}
          >
            <CartesianGrid
              stroke="var(--black-4)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) =>
                formatEmissionsAbsoluteCompact(value, currentLanguage)
              }
              domain={[0, maxTotalEmissions]}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  companyById={companyEntryById}
                  currentLanguage={currentLanguage}
                  t={t}
                />
              )}
            />
            {stackCompanies.map((company, stackIndex) => (
              <Bar
                key={company.id}
                dataKey={company.id}
                stackId="emissions"
                maxBarSize={32}
                radius={
                  stackIndex === stackCompanies.length - 1
                    ? [3, 3, 0, 0]
                    : [0, 0, 0, 0]
                }
                isAnimationActive={!reduceMotion}
                animationBegin={0}
                animationDuration={reduceMotion ? 0 : barDuration * 1000}
                animationEasing="ease-out"
              >
                {chartData.map((row, binIndex) => {
                  const value = row[company.id];
                  if (typeof value !== "number" || value <= 0) {
                    return (
                      <Cell key={`${company.id}-${binIndex}`} fill="none" />
                    );
                  }

                  const bin = histogram.bins[binIndex];
                  const companiesInBin = bin.companies.filter(
                    (entry) => entry.emissions > 0,
                  );
                  const color = getChangeColor(
                    company.changePercent,
                    changeRange.min,
                    changeRange.max,
                  );
                  const hasMultipleCompanies = companiesInBin.length > 1;

                  return (
                    <Cell
                      key={`${company.id}-${binIndex}`}
                      fill={color}
                      stroke={hasMultipleCompanies ? "var(--black-1)" : "none"}
                      strokeWidth={hasMultipleCompanies ? 1.5 : 0}
                      cursor="pointer"
                      onClick={() => handleCompanyClick(company.id)}
                    />
                  );
                })}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 px-1">
        <BeeswarmLegend
          min={changeRange.min}
          max={changeRange.max}
          unit="%"
          gradientBackground={legendGradient}
        />
        <p className="text-center text-xs text-white/40">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.legend.companyDivider",
          )}
        </p>
      </div>

      {isMobile && mobileSelectedCompanyId && (
        <p className="shrink-0 px-1 text-xs text-white/50">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.tooltip.tapAgain",
          )}
        </p>
      )}
    </div>
  );
}
