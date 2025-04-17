import { MUNICIPALITY_MAP_COLORS } from "./constants";

export function MapGradientLegend({
  label,
  unit,
  leftValue,
  rightValue,
}: {
  label: string;
  unit: string;
  leftValue: number;
  rightValue: number;
  getColor: (value: number) => string;
}) {
  return (
    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
      <p className="text-white/70 text-sm mb-2">{label}</p>
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <span className="text-white/50 text-xs mr-2">
            {leftValue.toFixed(1)}
            {unit}
          </span>
          <div className="relative" style={{ width: 200, height: 20 }}>
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
      </div>
    </div>
  );
}
