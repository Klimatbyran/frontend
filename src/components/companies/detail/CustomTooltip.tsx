import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsolute, localizeUnit } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  companyBaseYear: number | undefined;
}

export const CustomTooltip = ({
  active,
  payload,
  label,
  companyBaseYear,
}: CustomTooltipProps) => {
  const { t } = useTranslation();
  const { getCategoryName } = useCategoryMetadata();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  if (active && payload && payload.length) {
    if (payload.length === 3) {
      const totalEmissions = payload[0]?.payload.total;

      const companyTotal = {
        dataKey: "total",
        name: t("companies.emissionsHistory.total"),
        color: "white",
        payload: {
          year: payload[0]?.payload.year,
          total: totalEmissions,
        },
        value: totalEmissions,
      };
      payload = [companyTotal, ...payload];
    }

    const isBaseYear = companyBaseYear === payload[0].payload.year;

    return (
      <div
        className={`${isMobile ? "max-w-[280px]" : "max-w-[400px]"} bg-black-1 px-4 py-3 rounded-level-2 `}
      >
        <div className="text-sm font-medium mb-2">
          {label}
          {isBaseYear ? "*" : ""}
        </div>
        {payload.map((entry: any) => {
          if (entry.dataKey === "gap") return null;

          let name = entry.name;
          if (entry.dataKey.startsWith("cat")) {
            const categoryId = parseInt(entry.dataKey.replace("cat", ""));
            name = getCategoryName(categoryId);
          }

          // Extract the original value from payload
          const originalValue = entry.payload?.originalValues?.[entry.dataKey];

          // Correctly display "No Data Available" if original value was null
          const displayValue =
            originalValue === null
              ? t("companies.tooltip.noDataAvailable")
              : `${formatEmissionsAbsolute(Math.round(entry.value), currentLanguage)} ${t(
                  "companies.tooltip.tonsCO2e",
                )}`;

          return (
            <div
              key={entry.dataKey}
              className={`
              ${entry.dataKey === "total" ? "my-2 font-medium" : "my-0"} 
              text-grey mr-2 text-sm
            `}
            >
              <span className="text-grey mr-2">{name}:</span>
              <span style={{ color: entry.color }}>{displayValue}</span>
            </div>
          );
        })}
        {isBaseYear ? (
          <span className="text-grey mr-2 text-sm">
            <br></br>*{t("companies.emissionsHistory.baseYearInfo")}
          </span>
        ) : null}
      </div>
    );
  }
  return null;
};
