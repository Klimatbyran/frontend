import { Text } from "@/components/ui/text";
import useContainerQuery from "@/hooks/useContainerQuery";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

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
      return width >= 512;
    },
  );

  return (
    <div className="@container" ref={containerRef}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between mb-6 @lg:mb-12 gap-4 @lg:gap-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Text variant="h3">{title}</Text>
            <InfoTooltip ariaLabel="Information about this chart">
              <p>{tooltipContent}</p>
            </InfoTooltip>
          </div>
          <Text variant="body">{unit}</Text>
        </div>
        {/* Switch between Tabs and Dropdown based on screen size */}
        {/* FIXME: uncomment when scope and sector graphs are are fixed */}
        {/* <DataViewSelector
          dataView={dataView}
          setDataView={setDataView}
          hasScope3Categories={hasScope3Categories}
          layout={isWide ? "wide" : "narrow"}
        /> */}
      </div>
    </div>
  );
}
