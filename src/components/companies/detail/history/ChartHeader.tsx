import { Text } from "@/components/ui/text";
import { DataViewSelector } from "./DataViewSelector";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useContainerQuery from "@/hooks/useContainerQuery";

interface ChartHeaderProps {
  title: string;
  tooltipContent: string;
  unit: string;
  dataView: "overview" | "scopes" | "categories";
  setDataView: (value: "overview" | "scopes" | "categories") => void;
  hasScope3Categories: boolean;
}

export default function ChartHeader({
  title,
  tooltipContent,
  unit,
  dataView,
  setDataView,
  hasScope3Categories,
}: ChartHeaderProps) {
  const [containerRef, isWide] = useContainerQuery<HTMLDivElement>(
    ({ width }) => {
      // Matches container size @lg
      return width >= 512;
    },
  );

  return (
    <div className="@container" ref={containerRef}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between mb-6 @lg:mb-12 gap-4 @lg:gap-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Text variant="h3">{title}</Text>
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
          </div>
          <Text variant="body">{unit}</Text>
        </div>
        {/* Switch between Tabs and Dropdown based on screen size */}
        <DataViewSelector
          dataView={dataView}
          setDataView={setDataView}
          hasScope3Categories={hasScope3Categories}
          layout={isWide ? "wide" : "narrow"}
        />
      </div>
    </div>
  );
}
