export function MapGradientLegend({
  label,
  unit,
  leftValue,
  rightValue,
  getColor,
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
      <div className="flex items-center">
        <span className="text-white/50 text-xs mr-2">
          {leftValue.toFixed(1)}
          {unit}
        </span>
        <div className="relative" style={{ width: 200, height: 20 }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, ${getColor(leftValue)}, ${getColor(rightValue)})`,
            }}
          />
        </div>
        <span className="text-white/50 text-xs ml-2">
          {rightValue.toFixed(1)}
          {unit}
        </span>
      </div>
    </div>
  );
}
