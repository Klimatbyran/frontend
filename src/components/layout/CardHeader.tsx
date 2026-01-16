import React from "react";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import useContainerQuery from "@/hooks/useContainerQuery";
import {
  DataViewSelector,
  ViewOption,
} from "@/components/charts/DataViewSelector";

// Generic card header props
interface CardHeaderProps<T extends string = string> {
  // Required fields
  title: string;

  // Optional fields with defaults
  tooltipContent?: string;
  unit?: string |React.ReactNode;
  description?: string;

  // Data view selector options (for charts)
  dataView?: T;
  setDataView?: (value: T) => void;
  dataViewOptions?: ViewOption<T>[];
  dataViewPlaceholder?: string;

  // Custom data view selector (if provided, overrides default behavior)
  customDataViewSelector?: React.ReactNode;

  // Layout options
  layout?: "wide" | "narrow" | "page";
  className?: string;
}

/**
 * Unified card header component that can be used for charts, data displays, and other card-like components.
 * All fields except title are optional to accommodate different use cases.
 */
export const CardHeader = <T extends string = string>({
  title,
  tooltipContent,
  unit,
  description,
  dataView,
  setDataView,
  dataViewOptions,
  dataViewPlaceholder,
  customDataViewSelector,
  layout = "wide",
  className = "",
}: CardHeaderProps<T>): React.ReactElement => {
  const [containerRef, isWide] = useContainerQuery<HTMLDivElement>(
    ({ width }) => {
      return width >= 512;
    },
  );

  // Determine if we should show the data view selector
  const showDataViewSelector =
    (dataView &&
      setDataView &&
      dataViewOptions &&
      dataViewOptions.length > 0) ||
    customDataViewSelector;
  const effectiveLayout =
    layout === "narrow"
      ? "narrow"
      : layout === "page"
        ? "page"
        : isWide
          ? "wide"
          : "narrow";

  // Different layouts for different use cases
  if (layout === "page") {
    return (
      <div className={className}>
        <h1 className="text-3xl font-light mb-2">{title}</h1>
        {description && <p className="text-sm text-grey">{description}</p>}
      </div>
    );
  }

  return (
    <div className={`@container ${className}`} ref={containerRef}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between mb-6 @lg:mb-12 gap-4 @lg:gap-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Text variant="h3">{title}</Text>
            {tooltipContent && (
              <InfoTooltip ariaLabel="Information about this data">
                <p>{tooltipContent}</p>
              </InfoTooltip>
            )}
          </div>
          {typeof unit === "string" ? (
            <Text variant="body" className="text-grey">
              {unit}
            </Text>
          ) : unit != null ? (
            <div className="text-grey text-sm">{unit}</div>
          ) : null}
          {description && (
            <Text variant="body" className="text-grey">
              {description}
            </Text>
          )}
        </div>

        {/* Data view selector - either custom or default */}
        {showDataViewSelector && (
          <div>
            {customDataViewSelector || (
              <DataViewSelector
                dataView={dataView!}
                setDataView={setDataView!}
                availableViews={dataViewOptions!}
                placeholder={dataViewPlaceholder}
                layout={effectiveLayout === "page" ? "wide" : effectiveLayout}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardHeader;
