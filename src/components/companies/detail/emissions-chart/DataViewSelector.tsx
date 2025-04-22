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

interface DataViewSelectorProps {
  dataView: "overview" | "scopes" | "categories";
  setDataView: (value: "overview" | "scopes" | "categories") => void;
  hasScope3Categories: boolean;
}

export function DataViewSelector({
  dataView,
  setDataView,
  hasScope3Categories,
}: DataViewSelectorProps) {
  const { t } = useTranslation();
  const screenSize = useScreenSize();

  return (
    <div className="w-full max-w-xs">
      {!screenSize.isMobile ? (
        <Tabs
          value={dataView}
          onValueChange={(value) => setDataView(value as any)}
        >
          <TabsList className="bg-black-1">
            <TabsTrigger value="overview">
              {t("companies.dataView.overview")}
            </TabsTrigger>
            <TabsTrigger value="scopes">
              {t("companies.dataView.scopes")}
            </TabsTrigger>
            <TabsTrigger value="categories" disabled={!hasScope3Categories}>
              {t("companies.dataView.categories")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Select
          value={dataView}
          onValueChange={(value) => setDataView(value as any)}
        >
          <SelectTrigger className="w-full bg-black-1 text-white border border-gray-600 px-3 py-2 rounded-md">
            <SelectValue placeholder={t("companies.dataView.selectView")} />
          </SelectTrigger>
          <SelectContent className="bg-black-1 text-white">
            <SelectItem value="overview">
              {t("companies.dataView.overview")}
            </SelectItem>
            <SelectItem value="scopes">
              {t("companies.dataView.scopes")}
            </SelectItem>
            <SelectItem value="categories" disabled={!hasScope3Categories}>
              {t("companies.dataView.categories")}
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
