import { t } from "i18next";
import { DEFAULT_STATISTICAL_GRADIENT_COLORS } from "@/utils/ui/colorGradients";
import { KPIValue, MapEntityType } from "@/types/rankings";

export function MapLegend({
  entityType,
  unit,
  leftValue,
  rightValue,
  selectedKPI,
  hasNullValues,
}: {
  entityType: MapEntityType;
  unit: string;
  leftValue: number;
  rightValue: number;
  selectedKPI: KPIValue;
  hasNullValues: boolean;
}) {
  const booleanItem = (color: string, label: string) => (
    <div className="flex items-center">
      <div
        className="w-3 h-3 rounded-sm mr-1"
        style={{
          backgroundColor: color,
        }}
      />
      <span className="text-gray-500 text-xs">
        {t(`${entityType}.list.kpis.${selectedKPI.key}.booleanLabels.${label}`)}
      </span>
    </div>
  );

  return (
    <div className="absolute bottom-2 right-2 left-2 md:bottom-4 md:right-4 md:left-auto bg-black/60 backdrop-blur-sm p-2 md:p-4 rounded-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 w-full md:w-auto">
        <div className="flex items-center w-full md:w-auto gap-2">
          {selectedKPI.isBoolean ? (
            <>
              {booleanItem(
                DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd,
                "true",
              )}
              {booleanItem(
                DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow,
                "false",
              )}
            </>
          ) : (
            <>
              <span className="text-gray-500 text-xs mr-2">
                {leftValue.toFixed(1)}
                {unit}
              </span>
              <div className="relative flex-1 md:w-[160px] h-[20px]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, 
                        ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart} 0%,
                        ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow} 33%,
                        ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh} 66%,
                        ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd} 100%
                      )`,
                  }}
                />
              </div>
              <span className="text-gray-500 text-xs ml-2">
                {rightValue.toFixed(1)}
                {unit}
              </span>
            </>
          )}
        </div>
        {hasNullValues && (
          <div className="flex items-center mb-2 md:mb-0 md:ml-6">
            <div className="w-3 h-3 rounded-full bg-gray-600 mr-1" />
            <span className="text-gray-500 text-xs italic">
              {t(`${entityType}.map.legend.null`)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
