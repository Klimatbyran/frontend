import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useScreenSize } from "@/hooks/useScreenSize";

type DataView = "overview" | "sectors";

interface DataViewSelectorProps {
  dataView: DataView;
  setDataView: (view: DataView) => void;
  hasSectorData: boolean;
}

export const DataViewSelector: FC<DataViewSelectorProps> = ({
  dataView,
  setDataView,
  hasSectorData,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  return (
    <>
      {isMobile ? (
        <Select
          value={dataView}
          onValueChange={(value) => setDataView(value as DataView)}
        >
          <SelectTrigger className="w-full bg-black-1 text-white border border-gray-600 px-3 py-2 rounded-md">
            <SelectValue placeholder={t("municipalities.graph.selectView")} />
          </SelectTrigger>
          <SelectContent className="bg-black-1 text-white">
            <SelectItem value="overview">
              {t("municipalities.graph.overview")}
            </SelectItem>
            <SelectItem value="sectors" disabled={!hasSectorData}>
              {t("municipalities.graph.sectors")}
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Tabs
          value={dataView}
          onValueChange={(value) => setDataView(value as DataView)}
        >
          <TabsList className="bg-black-1">
            <TabsTrigger value="overview">
              {t("municipalities.graph.overview")}
            </TabsTrigger>
            <TabsTrigger value="sectors" disabled={!hasSectorData}>
              {t("municipalities.graph.sectors")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </>
  );
};
