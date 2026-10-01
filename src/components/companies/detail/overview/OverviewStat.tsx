import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { AiIcon } from "@/components/ui/ai-icon";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

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
  useFlex1?: boolean;
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
  useFlex1 = true,
}: OverviewStatProps) {
  const isDetailVariant = variant === "detail";

  // Handle label with InfoTooltip support
  const renderLabel = () => {
    if (typeof label === "string") {
      if (isDetailVariant) {
        return (
          <div className="flex gap-2">
            <Text className="text-lg md:text-xl">{label}</Text>
            {info && infoText && (
              <span className="text-grey">
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
      // Detail variant: separate Text components in flex container
      return (
        <div className="flex items-baseline space-x-2">
          <Text className={cn("text-4xl md:text-6xl", valueClassName)}>
            {value}
          </Text>
          {unit && (
            <Text className="text-md md:text-2xl text-grey">{unit}</Text>
          )}
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

  return (
    <div className={cn(useFlex1 && "flex-1", "min-w-0", className)}>
      <div className={isDetailVariant ? "" : "mb-1 md:mb-2"}>
        {renderLabel()}
      </div>
      {renderValue()}
      {caption && (
        <Text className="mt-2 max-w-prose text-base text-grey md:text-lg">
          {caption}
        </Text>
      )}
    </div>
  );
}
