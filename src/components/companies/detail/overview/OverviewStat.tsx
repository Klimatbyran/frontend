import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { AiIcon } from "@/components/ui/ai-icon";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { KpiBenchmarkChart } from "@/components/detail/KpiBenchmarkChart";
import type { KpiBenchmarkView } from "@/utils/detail/kpiBenchmark";

interface OverviewStatProps {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  unit?: string;
  showAiIcon?: boolean;
  className?: string;
  variant?: "overview" | "detail";
  info?: boolean;
  infoText?: string;
  /** Short plain-language line under the value. Hidden when a benchmark is shown. */
  caption?: string;
  /** Slightly smaller type so four headline numbers fit on one desktop row. */
  dense?: boolean;
  useFlex1?: boolean;
  benchmark?: KpiBenchmarkView | null;
  alignBenchmarks?: boolean;
}

export function OverviewStat({
  label,
  value,
  valueClassName,
  unit,
  showAiIcon = false,
  className,
  variant = "overview",
  info = false,
  infoText,
  caption,
  dense = false,
  useFlex1 = true,
  benchmark,
  alignBenchmarks = false,
}: OverviewStatProps) {
  const isDetailVariant = variant === "detail";
  const showCaption = Boolean(caption) && !(isDetailVariant && benchmark);

  const renderLabel = () => {
    if (typeof label === "string") {
      if (isDetailVariant) {
        return (
          <div className="flex gap-2">
            <Text
              className={
                dense ? "text-sm md:text-base" : "text-base md:text-lg"
              }
            >
              {label}
            </Text>
            {info && infoText && (
              <span className="shrink-0 text-grey">
                <InfoTooltip ariaLabel="Additional information">
                  <p>{infoText}</p>
                </InfoTooltip>
              </span>
            )}
          </div>
        );
      }
      return <Text className="lg:text-base md:text-sm text-sm">{label}</Text>;
    }
    return label;
  };

  const detailValueClassName = cn(
    dense ? "text-3xl xl:text-4xl" : "text-3xl md:text-5xl",
    "max-w-full break-words [overflow-wrap:anywhere]",
    valueClassName,
  );

  const renderValue = () => {
    if (isDetailVariant) {
      return (
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Text className={detailValueClassName}>{value}</Text>
          {unit && (
            <Text
              className={cn(
                "text-grey",
                dense ? "text-base" : "text-sm md:text-xl",
              )}
            >
              {unit}
            </Text>
          )}
          {showAiIcon && <AiIcon size="md" />}
        </div>
      );
    }

    return (
      <div className="flex items-start gap-2">
        <Text
          className={cn(
            "text-3xl md:text-5xl font-light tracking-tighter leading-none max-w-full break-words [overflow-wrap:anywhere]",
            valueClassName,
          )}
        >
          {value}
          {unit && (
            <span className="text-base lg:text-xl md:text-base sm:text-sm ml-2 text-grey">
              {unit}
            </span>
          )}
        </Text>
        {showAiIcon && <AiIcon size="md" />}
      </div>
    );
  };

  const labelBlock = (
    <div
      className={cn(
        isDetailVariant &&
          alignBenchmarks &&
          "min-h-[2.25rem] md:min-h-[2.5rem]",
      )}
    >
      <div className={isDetailVariant ? "" : "mb-1 md:mb-2"}>
        {renderLabel()}
      </div>
    </div>
  );

  const valueBlock = (
    <div
      className={cn(
        isDetailVariant &&
          alignBenchmarks &&
          "flex min-h-[2.75rem] items-end md:min-h-[3.25rem]",
      )}
    >
      {renderValue()}
    </div>
  );

  const captionBlock = showCaption ? (
    <Text className="mt-2 text-xs text-grey md:text-sm">{caption}</Text>
  ) : null;

  const benchmarkBlock = benchmark ? (
    <KpiBenchmarkChart
      benchmark={benchmark}
      className={alignBenchmarks ? "mt-2" : undefined}
    />
  ) : null;

  return (
    <div
      className={cn(
        useFlex1 && "flex-1",
        "min-w-0 max-w-full",
        isDetailVariant && alignBenchmarks && "flex h-full flex-col",
        className,
      )}
    >
      {labelBlock}
      {valueBlock}
      {captionBlock}
      {benchmarkBlock}
    </div>
  );
}
