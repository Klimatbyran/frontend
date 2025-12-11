import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useScreenSize } from "@/hooks/useScreenSize";

// Generic view option interface
export interface ViewOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Generic data view selector props
interface DataViewSelectorProps<T extends string> {
  dataView: T;
  setDataView: (value: T) => void;
  availableViews: ViewOption<T>[];
  placeholder?: string;
  layout?: "wide" | "narrow";
  className?: string;
}

/**
 * Generic data view selector component that can handle any type of data views.
 * Automatically switches between tabs (wide) and dropdown (narrow) based on screen size.
 */
export const DataViewSelector = <T extends string>({
  dataView,
  setDataView,
  availableViews,
  placeholder = "Select view",
  layout = "wide",
  className = "",
}: DataViewSelectorProps<T>): React.ReactElement => {
  const { isMobile } = useScreenSize();

  // Don't render if no views are available
  if (!availableViews || availableViews.length === 0) {
    return <></>;
  }

  // Determine layout based on screen size and props
  const effectiveLayout = layout === "narrow" || isMobile ? "narrow" : "wide";

  return (
    <div className={className}>
      {effectiveLayout === "wide" ? (
        <Tabs
          value={dataView}
          onValueChange={(value) => setDataView(value as T)}
        >
          <TabsList className="bg-black-1 light:bg-grey/10">
            {availableViews.map((view) => (
              <TabsTrigger
                key={view.value}
                value={view.value}
                disabled={view.disabled}
              >
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <Select
          value={dataView}
          onValueChange={(value) => setDataView(value as T)}
        >
          <SelectTrigger className="w-full bg-black-1 light:bg-grey/10 text-white light:text-black-3 border border-gray-600 light:border-grey px-3 py-2 rounded-md">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-black-1 light:bg-grey/10 text-white light:text-black-3">
            {availableViews.map((view) => (
              <SelectItem
                key={view.value}
                value={view.value}
                disabled={view.disabled}
              >
                {view.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DataViewSelector;
