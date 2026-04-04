import { FC, useMemo } from "react";
import type { TFunction } from "i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import {
  type LegendItem,
  CHART_COLORS,
  ChartFooter,
  ChartWrapper,
  EnhancedLegend,
  getChartContainerProps,
  getResponsiveChartMargin,
  getYAxisProps,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { NationDetails } from "@/hooks/nation/useNationDetails";
import type { SupportedLanguage } from "@/lib/languageDetection";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";

const COMPARISON_YEARS = [1990, 2024] as const;

const YEAR_TOTAL_TEXT_CLASS: Record<number, string> = {
  1990: "text-orange-2",
  2024: "text-green-3",
};

type ChartRow = {
  year: string;
  territorial: number | null;
  biogenic: number | null;
  total: number | null;
};

type NationTerritorialChartModel = {
  chartData: ChartRow[];
  showBiogenic: boolean;
  showTotal: boolean;
  comparisonTotals: { year: number; totalTons: number | null }[];
};

function kgToTons(kg: number | undefined): number | null {
  if (kg === undefined || kg === null || Number.isNaN(kg)) return null;
  return kg / 1000;
}

function pickYear(
  record: Record<string, number>,
  year: number,
): number | undefined {
  const v = record[String(year)];
  return v !== undefined ? v : undefined;
}

function computeNationTerritorialChartModel(
  nation: NationDetails,
): NationTerritorialChartModel {
  const territorial = nation.territorialFossilEmissions;
  const biogenic = nation.biogenicEmissions;

  const hasBiogenicForAnyComparedYear =
    !!biogenic &&
    COMPARISON_YEARS.some((year) => pickYear(biogenic, year) !== undefined);

  const allRows = COMPARISON_YEARS.map((year) => {
    const terrKg = pickYear(territorial, year);
    const bioKg = biogenic ? pickYear(biogenic, year) : undefined;
    const terrTons = kgToTons(terrKg);
    const bioTons = bioKg !== undefined ? kgToTons(bioKg) : null;
    const hasPoint = terrTons !== null || bioTons !== null;
    const totalTons =
      hasBiogenicForAnyComparedYear && hasPoint
        ? (terrTons ?? 0) + (bioTons ?? 0)
        : null;

    return {
      year: String(year),
      yearNum: year,
      territorial: terrTons,
      biogenic: bioTons,
      total: totalTons,
    };
  });

  const chartData = allRows
    .filter((row) => row.territorial !== null || row.biogenic !== null)
    .map(({ yearNum, ...chartRow }) => chartRow);

  const hasBiogenic = chartData.some((row) => row.biogenic !== null);

  const comparisonTotals = allRows.map((row) => {
    const hasData = row.territorial !== null || row.biogenic !== null;
    const displayTotal =
      hasData && hasBiogenicForAnyComparedYear
        ? (row.territorial ?? 0) + (row.biogenic ?? 0)
        : hasData
          ? row.territorial
          : null;
    return {
      year: row.yearNum,
      totalTons: displayTotal ?? null,
    };
  });

  return {
    chartData,
    showBiogenic: hasBiogenic,
    showTotal: hasBiogenicForAnyComparedYear,
    comparisonTotals,
  };
}

function buildLegendItems(
  t: TFunction,
  showBiogenic: boolean,
  showTotal: boolean,
): LegendItem[] {
  const items: LegendItem[] = [
    {
      name: t("nation.detailPage.territorialBiogenic.territorial"),
      color: CHART_COLORS.primary,
    },
  ];
  if (showBiogenic) {
    items.push({
      name: t("nation.detailPage.territorialBiogenic.biogenic"),
      color: "var(--orange-2)",
    });
  }
  if (showTotal) {
    items.push({
      name: t("nation.detailPage.territorialBiogenic.total"),
      color: CHART_COLORS.paris,
    });
  }
  return items;
}

type TotalEmissionsBoxProps = {
  comparisonTotals: NationTerritorialChartModel["comparisonTotals"];
  showTotal: boolean;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

const TotalEmissionsComparisonBox: FC<TotalEmissionsBoxProps> = ({
  comparisonTotals,
  showTotal,
  currentLanguage,
  t,
}) => (
  <div className="rounded-level-2 border border-black-1 bg-black-1/40 px-4 py-5 md:px-6 md:py-6">
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-grey">
      {t("nation.detailPage.territorialBiogenic.totalEmissionsComparisonTitle")}
    </p>
    <p className="mb-5 text-sm text-grey">
      {showTotal
        ? t(
            "nation.detailPage.territorialBiogenic.totalEmissionsComparisonSubline",
          )
        : t(
            "nation.detailPage.territorialBiogenic.totalEmissionsComparisonSublineFossilOnly",
          )}
    </p>
    <div className="grid grid-cols-2 gap-4 md:gap-8">
      {comparisonTotals.map(({ year, totalTons }) => (
        <div key={year} className="min-w-0">
          <p className="mb-2 text-sm text-grey">{year}</p>
          <p
            className={`text-3xl font-light tabular-nums tracking-tight md:text-4xl ${YEAR_TOTAL_TEXT_CLASS[year] ?? "text-white"}`}
          >
            {totalTons != null
              ? formatEmissionsAbsolute(totalTons, currentLanguage)
              : "—"}
          </p>
          <p className="mt-2 text-xs text-grey">{t("emissionsUnit")}</p>
        </div>
      ))}
    </div>
  </div>
);

type BarChartPanelProps = {
  chartData: ChartRow[];
  showBiogenic: boolean;
  showTotal: boolean;
  legendItems: LegendItem[];
  isMobile: boolean;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

const NationalTerritorialBarChartPanel: FC<BarChartPanelProps> = ({
  chartData,
  showBiogenic,
  showTotal,
  legendItems,
  isMobile,
  currentLanguage,
  t,
}) => (
  <div className="min-h-0 min-w-0 w-full">
    <ChartWrapper>
      <div className="h-[280px] w-full md:h-[340px]">
        <ResponsiveContainer {...getChartContainerProps("100%", "100%")}>
          <BarChart
            data={chartData}
            margin={getResponsiveChartMargin(isMobile)}
            barGap={2}
            barCategoryGap="12%"
            barSize={28}
          >
            <CartesianGrid
              stroke="var(--black-1)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--grey)", fontSize: 12 }}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />
            <Tooltip
              cursor={{ fill: "var(--black-1)", opacity: 0.35 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-md border border-black-1 bg-black-2 px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-medium text-white">{label}</p>
                    {payload.map((entry) => {
                      const v = entry.value as number | null;
                      if (v == null) return null;
                      return (
                        <p
                          key={String(entry.dataKey)}
                          className="text-sm"
                          style={{ color: entry.color }}
                        >
                          {entry.name}:{" "}
                          {formatEmissionsAbsolute(v, currentLanguage)}{" "}
                          {t("emissionsUnit")}
                        </p>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="territorial"
              name={t("nation.detailPage.territorialBiogenic.territorial")}
              fill={CHART_COLORS.primary}
              stroke="var(--grey)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
            {showBiogenic ? (
              <Bar
                dataKey="biogenic"
                name={t("nation.detailPage.territorialBiogenic.biogenic")}
                fill="var(--orange-2)"
                radius={[4, 4, 0, 0]}
              />
            ) : null}
            {showTotal ? (
              <Bar
                dataKey="total"
                name={t("nation.detailPage.territorialBiogenic.total")}
                fill={CHART_COLORS.paris}
                stroke="var(--grey)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartFooter>
        <EnhancedLegend items={legendItems} />
      </ChartFooter>
    </ChartWrapper>
  </div>
);

export type NationalTerritorialBiogenicChartProps = {
  nation: NationDetails;
};

export const NationalTerritorialBiogenicChart: FC<
  NationalTerritorialBiogenicChartProps
> = ({ nation }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  const model = useMemo(
    () => computeNationTerritorialChartModel(nation),
    [nation.territorialFossilEmissions, nation.biogenicEmissions],
  );

  const legendItems = useMemo(
    () => buildLegendItems(t, model.showBiogenic, model.showTotal),
    [t, model.showBiogenic, model.showTotal],
  );

  if (model.chartData.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp helpItems={[]}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <CardHeader
            title={t("nation.detailPage.territorialBiogenic.title")}
            description={t("nation.detailPage.territorialBiogenic.description")}
            unit={t("detailPage.inTons")}
            className="[&>div]:!mb-0"
          />
          <TotalEmissionsComparisonBox
            comparisonTotals={model.comparisonTotals}
            showTotal={model.showTotal}
            currentLanguage={currentLanguage}
            t={t}
          />
          {!model.showBiogenic ? (
            <p className="text-sm text-grey">
              {t("nation.detailPage.territorialBiogenic.biogenicUnavailable")}
            </p>
          ) : null}
        </div>
        <NationalTerritorialBarChartPanel
          chartData={model.chartData}
          showBiogenic={model.showBiogenic}
          showTotal={model.showTotal}
          legendItems={legendItems}
          isMobile={isMobile}
          currentLanguage={currentLanguage}
          t={t}
        />
      </div>
    </SectionWithHelp>
  );
};
