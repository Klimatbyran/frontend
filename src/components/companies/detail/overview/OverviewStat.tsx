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
  // Support for DetailStatCard pattern
  variant?: "overview" | "detail";
  info?: boolean;
  infoText?: string;
  /** Short plain-language line under the value. */
  caption?: string;
  /** Slightly smaller type so four headline numbers fit on one desktop row. */
  dense?: boolean;
  useFlex1?: boolean;
  /** Comparison that shows whether the number is high, low, good, or bad. */
  benchmark?: KpiBenchmarkView | null;
  /** Reserve a caption row and pin benchmark bars to the same baseline in a grid row. */
  alignBenchmarks?: boolean;
  /** Keep caption row height even when this stat has no caption (for peer columns). */
  reserveCaptionRow?: boolean;
}

const DETAIL_VALUE = "text-4xl font-light leading-none tracking-tighter tabular-nums xl:text-5xl";
const DETAIL_VALUE_RELAXED = "text-4xl font-light leading-none tracking-tighter tabular-nums md:text-5xl";
const DETAIL_UNIT = "text-lg text-grey";

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
  reserveCaptionRow = false,
}: OverviewStatProps) {
  const isDetailVariant = variant === "detail";
  const valueSizeClass = dense ? DETAIL_VALUE : DETAIL_VALUE_RELAXED;
  const showCaptionRow =
    isDetailVariant && (caption || (alignBenchmarks && reserveCaptionRow));

  // Handle label with InfoTooltip support
  const renderLabel = () => {
    if (typeof label === "string") {
      if (isDetailVariant) {
        return (
          <div className="flex gap-2">
            <Text
              className={dense ? "text-base md:text-lg" : "text-lg md:text-xl"}
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
      return <Text className="lg:text-lg md:text-base text-sm">{label}</Text>;
    }
    return label;
  };

  // Handle value and unit rendering
  const renderValue = () => {
    if (isDetailVariant && unit) {
      return (
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Text className={cn(valueSizeClass, valueClassName)}>{value}</Text>
          <Text className={cn(DETAIL_UNIT, dense ? "" : "md:text-xl")}>
            {unit}
          </Text>
        </div>
      );
    }

    if (isDetailVariant) {
      return (
        <div className="flex items-end gap-2">
          <Text className={cn(valueSizeClass, valueClassName)}>{value}</Text>
          {showAiIcon && <AiIcon size="md" />}
        </div>
      );
    }

    // Overview variant: inline unit
    return (
      <div className="flex items-start gap-2">
        <Text
          className={cn(
            "text-4xl md:text-6xl font-light tracking-tighter leading-none",
            valueClassName,
          )}
        >
          {value}
          {unit && (
            <span className="text-lg lg:text-2xl md:text-lg sm:text-sm ml-2 text-grey">
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
        isDetailVariant && alignBenchmarks && "min-h-[2.75rem] md:min-h-[3rem]",
      )}
    >
      <div className={isDetailVariant ? "" : "mb-1 md:mb-2"}>{renderLabel()}</div>
    </div>
  );

  const valueBlock = (
    <div
      className={cn(
        isDetailVariant &&
          alignBenchmarks &&
          "flex min-h-[3.25rem] items-end xl:min-h-[3.5rem]",
      )}
    >
      {renderValue()}
    </div>
  );

  const captionBlock = showCaptionRow ? (
    <Text
      className={cn(
        "text-sm text-grey md:text-base",
        alignBenchmarks && "min-h-[2.5rem] md:min-h-[2.75rem]",
        !caption && "invisible",
      )}
      aria-hidden={!caption}
    >
      {caption || "\u00a0"}
    </Text>
  ) : caption ? (
    <Text className="mt-2 text-sm text-grey md:text-base">{caption}</Text>
  ) : null;

  const benchmarkBlock = benchmark ? (
    <KpiBenchmarkChart
      benchmark={benchmark}
      className={alignBenchmarks ? "mt-0" : undefined}
    />
  ) : null;

  if (isDetailVariant && alignBenchmarks) {
    return (
      <div className={cn(useFlex1 && "flex-1", "flex h-full min-w-0 flex-col", className)}>
        {labelBlock}
        {valueBlock}
        {captionBlock}
        <div className="mt-auto min-h-[2.625rem]">{benchmarkBlock}</div>
      </div>
    );
  }

  return (
    <div className={cn(useFlex1 && "flex-1", "min-w-0", className)}>
      {labelBlock}
      {valueBlock}
      {captionBlock}
      {benchmarkBlock}
    </div>
  );
}
