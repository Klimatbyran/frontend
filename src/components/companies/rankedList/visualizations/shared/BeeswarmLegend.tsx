interface BeeswarmLegendProps {
  min: number;
  max: number;
  unit: string;
  leftLabel?: string;
  rightLabel?: string;
}

export function BeeswarmLegend({
  min,
  max,
  unit,
  leftLabel,
  rightLabel,
}: BeeswarmLegendProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-grey">
      <span className="whitespace-nowrap">
        {leftLabel ?? `${min.toFixed(1)}${unit}`}
      </span>
      <div className="relative w-[160px] h-4">
        <div
          className="absolute inset-0 rounded"
          style={{
            background: `linear-gradient(to right, 
              var(--blue-4) 0%,
              var(--blue-3) 40%,
              var(--pink-3) 50%,
              var(--pink-4) 70%,
              var(--pink-5) 100%
            )`,
          }}
        />
      </div>
      <span className="whitespace-nowrap">
        {rightLabel ?? `${max.toFixed(1)}${unit}`}
      </span>
    </div>
  );
}
