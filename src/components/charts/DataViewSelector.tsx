import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";

// Data view types
export type CompanyDataView = "overview" | "scopes" | "categories";
export type MunicipalityDataView = "overview" | "sectors";

// Generic data view selector props
interface DataViewSelectorProps {
  dataView: string;
  setDataView: (value: string) => void;
  hasAdditionalData: boolean;
  layout?: "wide" | "narrow";
  type?: "company" | "municipality";
  className?: string;
}

/**
 * Shared data view selector component that can handle both company and municipality data views.
 * Automatically switches between tabs (wide) and dropdown (narrow) based on screen size.
 */
export const DataViewSelector: React.FC<DataViewSelectorProps> = ({
  dataView,
  setDataView,
  hasAdditionalData,
  layout = "wide",
  type = "company",
  className = "",
}) => {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  // Don't render if no additional data is available
  if (!hasAdditionalData) {
    return null;
  }

  // Determine layout based on type and props
  const shouldUseMobile =
    type === "municipality" ? isMobile : layout === "narrow";
  const effectiveLayout = shouldUseMobile ? "narrow" : "wide";

  // Get translation keys based on type
  const getTranslationKey = (view: string) => {
    if (type === "company") {
      switch (view) {
        case "overview":
          return "companies.dataView.overview";
        case "scopes":
          return "companies.dataView.scopes";
        case "categories":
          return "companies.dataView.categories";
        default:
          return `companies.dataView.${view}`;
      }
    } else {
      switch (view) {
        case "overview":
          return "municipalities.graph.overview";
        case "sectors":
          return "municipalities.graph.sectors";
        default:
          return `municipalities.graph.${view}`;
      }
    }
  };

  // Get placeholder text based on type
  const getPlaceholderText = () => {
    if (type === "company") {
      return t("companies.dataView.selectView");
    } else {
      return t("municipalities.graph.selectView");
    }
  };

  // Get available views based on type
  const getAvailableViews = () => {
    if (type === "company") {
      return ["overview", "scopes", "categories"];
    } else {
      return ["overview", "sectors"];
    }
  };

  const availableViews = getAvailableViews();

  return (
    <div className={className}>
      {effectiveLayout === "wide" ? (
        <Tabs
          value={dataView}
          onValueChange={(value) => setDataView(value as any)}
        >
          <TabsList className="bg-black-1">
            {availableViews.map((view) => (
              <TabsTrigger
                key={view}
                value={view}
                disabled={
                  view === "categories" && type === "company"
                    ? !hasAdditionalData
                    : view === "sectors" && type === "municipality"
                      ? !hasAdditionalData
                      : false
                }
              >
                {t(getTranslationKey(view))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <Select
          value={dataView}
          onValueChange={(value) => setDataView(value as any)}
        >
          <SelectTrigger className="w-full bg-black-1 text-white border border-gray-600 px-3 py-2 rounded-md">
            <SelectValue placeholder={getPlaceholderText()} />
          </SelectTrigger>
          <SelectContent className="bg-black-1 text-white">
            {availableViews.map((view) => (
              <SelectItem
                key={view}
                value={view}
                disabled={
                  view === "categories" && type === "company"
                    ? !hasAdditionalData
                    : view === "sectors" && type === "municipality"
                      ? !hasAdditionalData
                      : false
                }
              >
                {t(getTranslationKey(view))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DataViewSelector;
