import { Text } from "@/components/ui/text";
import { DataViewSelector } from "./DataViewSelector";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-12 gap-4 md:gap-0">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Text variant="h3">{title}</Text>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-grey" />
              </TooltipTrigger>
              <TooltipContent>
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
      />
    </div>
  );
}
