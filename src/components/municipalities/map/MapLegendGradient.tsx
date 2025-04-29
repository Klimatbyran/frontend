import { t } from "i18next";
import { MUNICIPALITY_MAP_COLORS } from "./constants";

export function MapGradientLegend({
  unit,
  leftValue,
  rightValue,
}: {
  unit: string;
  leftValue: number;
  rightValue: number;
  getColor: (value: number) => string;
}) {
  return (
    <div className="absolute bottom-2 right-2 left-2 md:bottom-4 md:right-4 md:left-auto bg-black/60 backdrop-blur-sm p-2 md:p-4 rounded-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-1 space-y-2 md:space-y-0 w-full md:w-auto">
        <div className="flex items-center w-full md:w-auto">
          <span className="text-white/50 text-xs mr-2">
            {leftValue.toFixed(1)}
            {unit}
          </span>
          <div className="relative flex-1 md:w-[160px] h-[20px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  ${MUNICIPALITY_MAP_COLORS.start} 0%,
                  ${MUNICIPALITY_MAP_COLORS.gradientMidLow} 33%,
                  ${MUNICIPALITY_MAP_COLORS.gradientMidHigh} 66%,
                  ${MUNICIPALITY_MAP_COLORS.end} 100%
                )`,
              }}
            />
          </div>
          <span className="text-white/50 text-xs ml-2">
            {rightValue.toFixed(1)}
            {unit}
          </span>
        </div>
        <div className="flex items-center mb-2 md:mb-0 md:ml-4">
          <div className="w-3 h-3 rounded-full bg-gray-400 mr-1" />
          <span className="text-white/50 text-xs italic">
            {t("municipalities.map.legend.null")}
          </span>
        </div>
      </div>
    </div>
  );
}
