import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useTranslation } from "react-i18next";
import { localizeUnit } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { currentLanguage} = useLanguage();

  if (active && payload && payload.length) {
    console.log(payload)
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
                  "companies.tooltip.tonsCO2e"
                )}`;

          return (
            <div key={entry.dataKey} className="text-sm max-w-[320px]">
              <span className="text-grey mr-2">{name}:</span>
              <span style={{ color: entry.color }}>{displayValue}</span>
              {
                entry.payload.year === companyBaseYear
                ? 
                  <span className="text-grey mr-2">
                    <br></br><br></br>
                    The base year refers to a specific year chosen as a reference point against which future emissions are compared.
                  </span>
                : null
                
              }
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};
