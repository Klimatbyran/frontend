import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Text } from "@/components/ui/text";

interface BlockMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  className?: string;
  color?: string;
}

export function BlockMetric({
  label,
  value,
  unit,
  icon,
  className,
  color = "var(--blue-2)",
}: BlockMetricProps) {
  return (
    <div
      className={cn("rounded-level-2 p-4", className)}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2 text-grey mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-light" style={{ color }}>
        {value}
        {unit && <span className="text-xs text-grey ml-1">{unit}</span>}
      </div>
    </div>
  );
}
