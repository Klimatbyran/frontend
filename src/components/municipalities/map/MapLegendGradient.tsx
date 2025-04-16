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
  // Define the colors directly
  const pink4 = "var(--pink-3)";
  const pink3 = "var(--pink-4)";
  const blue4 = "var(--blue-4)";
  const blue3 = "var(--blue-3)";

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
                  ${pink4} 0%,
                  ${pink3} 33%,
                  ${blue4} 66%,
                  ${blue3} 100%
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
