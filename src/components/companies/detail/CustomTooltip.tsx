import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsolute } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { AiIcon } from "@/components/ui/ai-icon";

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
    // Add deduplication logic before mapping
    const filterDuplicatesByValue = (entries: any[]) => {
      const valueGroups = new Map<number, any[]>();

      // Group entries by their value
      entries.forEach((entry) => {
        if (entry.value != null && !isNaN(entry.value)) {
          const roundedValue = Math.round(entry.value);
          if (!valueGroups.has(roundedValue)) {
            valueGroups.set(roundedValue, []);
          }
          valueGroups.get(roundedValue)!.push(entry);
        }
      });

      const filteredEntries: any[] = [];

      valueGroups.forEach((groupEntries) => {
        if (groupEntries.length === 1) {
          // No duplicates, include the entry
          filteredEntries.push(groupEntries[0]);
        } else {
          // Keep the first entry when there are duplicates
          filteredEntries.push(groupEntries[0]);
        }
      });

      return filteredEntries;
    };

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

    // Apply deduplication filter
    const filteredPayload = filterDuplicatesByValue(payload);

    const isBaseYear = companyBaseYear === filteredPayload[0]?.payload.year;

    return (
      <div
        className={`${isMobile ? "max-w-[280px]" : "max-w-[400px]"} bg-black-1 px-4 py-3 rounded-level-2 `}
      >
        <div className="text-sm font-medium mb-2">
          {label}
          {isBaseYear ? "*" : ""}
        </div>
        {filteredPayload.map((entry: any) => {
          if (entry.dataKey === "gap") {
            return null;
          }

          let { name } = entry;
          if (entry.dataKey.startsWith("cat")) {
            const categoryId = parseInt(entry.dataKey.replace("cat", ""));
            name = getCategoryName(categoryId);
          }

          // Extract the original value from payload
          const originalValue = entry.payload?.originalValues?.[entry.dataKey];

          // Check if data is AI-generated
          let isDataAI = false;
          if (entry.dataKey === "scope1.value") {
            isDataAI = entry.payload.scope1?.isAIGenerated;
          } else if (entry.dataKey === "scope2.value") {
            isDataAI = entry.payload.scope2?.isAIGenerated;
          } else if (entry.dataKey === "scope3.value") {
            isDataAI = entry.payload.scope3?.isAIGenerated;
          } else if (entry.dataKey && entry.dataKey.startsWith("cat")) {
            const catId = parseInt(entry.dataKey.replace("cat", ""));
            isDataAI = entry.payload.scope3Categories?.find(
              (c: any) => c.category === catId,
            )?.isAIGenerated;
          } else if (entry.dataKey === "total") {
            isDataAI = entry.payload.isAIGenerated;
          }

          // Correctly display "No Data Available" if original value was null or undefined
          const displayValue =
            originalValue == null &&
            (entry.value == null || isNaN(entry.value) || entry.value == 0)
              ? t("companies.tooltip.noDataAvailable")
              : `${formatEmissionsAbsolute(Math.round(entry.value ?? 0), currentLanguage)} ${t(
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
              {isDataAI && (
                <span className="ml-2">
                  <AiIcon size="sm" />
                </span>
              )}
            </div>
          );
        })}
        {isBaseYear && (
          <span className="text-grey mr-2 text-sm">
            <br />*{t("companies.emissionsHistory.baseYearInfo")}
          </span>
        )}
      </div>
    );
  }
  return null;
};
