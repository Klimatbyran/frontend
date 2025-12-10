interface BeeswarmLegendProps {
  min: number;
  max: number;
  unit: string;
  gradientBackground?: string;
}

export function BeeswarmLegend({
  min,
  max,
  unit,
  gradientBackground,
}: BeeswarmLegendProps) {
  const defaultGradient = `linear-gradient(to right, 
    var(--blue-4) 0%,
    var(--blue-3) 40%,
    var(--pink-3) 50%,
    var(--pink-4) 70%,
    var(--pink-5) 100%
  )`;

  return (
    <div className="flex items-center gap-2 text-xs text-grey">
      <span className="whitespace-nowrap">
        {min.toFixed(1)}
        {unit}
      </span>
      <div className="relative w-[160px] h-4">
        <div
          className="absolute inset-0 rounded"
          style={{
            background: gradientBackground ?? defaultGradient,
          }}
        />
      </div>
      <span className="whitespace-nowrap">
        {max.toFixed(1)}
        {unit}
      </span>
    </div>
  );
}
