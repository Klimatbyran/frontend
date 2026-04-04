import { FC, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import {
  CHART_COLORS,
  getChartContainerProps,
  getResponsiveChartMargin,
  getYAxisProps,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import type { NationDetails } from "@/hooks/nation/useNationDetails";

const COMPARISON_YEARS = [1990, 2024] as const;

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

export type NationalTerritorialBiogenicChartProps = {
  nation: NationDetails;
};

export const NationalTerritorialBiogenicChart: FC<
  NationalTerritorialBiogenicChartProps
> = ({ nation }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  const { chartData, showBiogenic, showTotal } = useMemo(() => {
    const territorial = nation.territorialFossilEmissions;
    const biogenic = nation.biogenicEmissions;

    const hasBiogenicForAnyComparedYear =
      !!biogenic &&
      COMPARISON_YEARS.some((year) => pickYear(biogenic, year) !== undefined);

    const rows = COMPARISON_YEARS.map((year) => {
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
        territorial: terrTons,
        biogenic: bioTons,
        total: totalTons,
      };
    }).filter((row) => row.territorial !== null || row.biogenic !== null);

    const hasBiogenic = rows.some((row) => row.biogenic !== null);

    return {
      chartData: rows,
      showBiogenic: hasBiogenic,
      showTotal: hasBiogenicForAnyComparedYear,
    };
  }, [nation.territorialFossilEmissions, nation.biogenicEmissions]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp helpItems={[]}>
      <CardHeader
        title={t("nation.detailPage.territorialBiogenic.title")}
        description={t("nation.detailPage.territorialBiogenic.description")}
        unit={t("detailPage.inTons")}
      />
      <div className="mt-8 h-[320px] w-full md:h-[400px]">
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
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span className="text-grey text-sm">{value}</span>
              )}
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
      {!showBiogenic ? (
        <p className="mt-4 text-sm text-grey">
          {t("nation.detailPage.territorialBiogenic.biogenicUnavailable")}
        </p>
      ) : null}
    </SectionWithHelp>
  );
};
