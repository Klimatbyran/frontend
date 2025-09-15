import React from "react";
import { Text } from "@/components/ui/text";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useContainerQuery from "@/hooks/useContainerQuery";
import { DataViewSelector } from "./DataViewSelector";

// Generic data view types
export type CompanyDataView = "overview" | "scopes" | "categories";
export type MunicipalityDataView = "overview" | "sectors";

// Chart header props with optional fields
interface ChartHeaderProps {
  // Required fields
  title: string;

  // Optional fields with defaults
  tooltipContent?: string;
  unit?: string;
  dataView?: string;
  setDataView?: (value: string) => void;
  hasAdditionalData?: boolean;

  // Data view selector type
  dataViewType?: "company" | "municipality";

  // Custom data view selector (if provided, overrides default behavior)
  customDataViewSelector?: React.ReactNode;

  // Layout options
  layout?: "wide" | "narrow";
  className?: string;
}

/**
 * Shared chart header component that can be used by both companies and municipalities.
 * All fields except title are optional to accommodate different use cases.
 */
export const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  tooltipContent,
  unit,
  dataView,
  setDataView,
  hasAdditionalData = false,
  dataViewType = "company",
  customDataViewSelector,
  layout = "wide",
  className = "",
}) => {
  const [containerRef, isWide] = useContainerQuery<HTMLDivElement>(
    ({ width }) => {
      return width >= 512;
    },
  );

  // Determine if we should show the data view selector
  const showDataViewSelector = dataView && setDataView && hasAdditionalData;
  const effectiveLayout =
    layout === "narrow" ? "narrow" : isWide ? "wide" : "narrow";

  return (
    <div className={`@container ${className}`} ref={containerRef}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between mb-6 @lg:mb-12 gap-4 @lg:gap-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Text variant="h3">{title}</Text>
            {tooltipContent && (
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-grey" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-96">
                    <p>{tooltipContent}</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            )}
          </div>
          {unit && <Text variant="body">{unit}</Text>}
        </div>

        {/* Data view selector - either custom or default */}
        {showDataViewSelector && (
          <div>
            {customDataViewSelector || (
              <DataViewSelector
                dataView={dataView}
                setDataView={setDataView}
                hasAdditionalData={hasAdditionalData}
                type={dataViewType}
                layout={effectiveLayout}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartHeader;
