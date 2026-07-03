import React from "react";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import useContainerQuery from "@/hooks/useContainerQuery";
import {
  DataViewSelector,
  ViewOption,
} from "@/components/charts/DataViewSelector";

interface CardHeaderProps<T extends string = string> {
  title: string;
  tooltipContent?: string;
  unit?: string;
  description?: string;
  dataView?: T;
  setDataView?: (value: T) => void;
  dataViewOptions?: ViewOption<T>[];
  dataViewPlaceholder?: string;
  customDataViewSelector?: React.ReactNode;
  layout?: "wide" | "narrow" | "page";
  className?: string;
}

function getEffectiveLayout<T extends string>(
  layout: CardHeaderProps<T>["layout"],
  isWide: boolean,
): "wide" | "narrow" | "page" {
  if (layout === "narrow") {
    return "narrow";
  }
  if (layout === "page") {
    return "page";
  }
  return isWide ? "wide" : "narrow";
}

function CardHeaderPageLayout({
  title,
  description,
  className = "",
}: Pick<CardHeaderProps, "title" | "description" | "className">) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-light mb-2">{title}</h1>
      {description && <p className="text-sm text-grey">{description}</p>}
    </div>
  );
}

function CardHeaderContent<T extends string>({
  title,
  tooltipContent,
  unit,
  description,
  dataView,
  setDataView,
  dataViewOptions,
  dataViewPlaceholder,
  customDataViewSelector,
  effectiveLayout,
}: {
  title: string;
  tooltipContent?: string;
  unit?: string;
  description?: string;
  dataView?: T;
  setDataView?: (value: T) => void;
  dataViewOptions?: ViewOption<T>[];
  dataViewPlaceholder?: string;
  customDataViewSelector?: React.ReactNode;
  effectiveLayout: "wide" | "narrow" | "page";
}) {
  const showDataViewSelector =
    (dataView && setDataView && dataViewOptions && dataViewOptions.length > 0) ||
    customDataViewSelector;

  return (
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
        {unit && (
          <Text variant="body" className="text-grey">
            {unit}
          </Text>
        )}
        {description && (
          <Text variant="body" className="text-grey">
            {description}
          </Text>
        )}
      </div>

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
  );
}

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
    ({ width }) => width >= 512,
  );

  if (layout === "page") {
    return (
      <CardHeaderPageLayout
        title={title}
        description={description}
        className={className}
      />
    );
  }

  const effectiveLayout = getEffectiveLayout(layout, isWide);

  return (
    <div className={`@container ${className}`} ref={containerRef}>
      <CardHeaderContent
        title={title}
        tooltipContent={tooltipContent}
        unit={unit}
        description={description}
        dataView={dataView}
        setDataView={setDataView}
        dataViewOptions={dataViewOptions}
        dataViewPlaceholder={dataViewPlaceholder}
        customDataViewSelector={customDataViewSelector}
        effectiveLayout={effectiveLayout}
      />
    </div>
  );
};

export default CardHeader;
