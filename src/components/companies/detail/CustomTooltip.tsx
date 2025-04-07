import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useTranslation } from "react-i18next";
import { localizeUnit } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  const { t } = useTranslation();
  const { getCategoryName } = useCategoryMetadata();
  const { currentLanguage } = useLanguage();

  if (active && payload && payload.length) {
    if (payload.length === 3) {
      const totalEmissions = payload[0]?.payload.total;

      const companyTotal = {
        dataKey: "total",
        name: t("companies.emissionsHistory.total"),
        color: "white",
        payload: {
          total: totalEmissions,
        },
        value: totalEmissions,
      };
      payload = [companyTotal, ...payload];
    }

    return (
      <div className="bg-black-1 px-4 py-3 rounded-level-2">
        <div className="text-sm font-medium mb-2">{label}</div>
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
              : `${localizeUnit(Math.round(entry.value), currentLanguage)} ${t(
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
      </div>
    );
  }
  return null;
};
