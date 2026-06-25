import { cn } from "@/lib/utils";

interface NationStatCalloutProps {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaClassName?: string;
  className?: string;
}

export function NationStatCallout({
  label,
  value,
  unit,
  delta,
  deltaClassName,
  className,
}: NationStatCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-level-3 border border-white/10 bg-black-2/80 p-6 md:p-8",
        className,
      )}
    >
      <p className="text-sm uppercase tracking-wide text-grey mb-2">{label}</p>
      <p className="text-4xl md:text-5xl font-light text-white">
        {value}
        {unit ? (
          <span className="ml-2 text-xl md:text-2xl text-grey">{unit}</span>
        ) : null}
      </p>
      {delta ? (
        <p className={cn("mt-3 text-base", deltaClassName ?? "text-orange-2")}>
          {delta}
        </p>
      ) : null}
    </div>
  );
}
