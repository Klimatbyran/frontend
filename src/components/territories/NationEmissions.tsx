import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { NationOverviewChart } from "./emissionsGraph/NationOverviewChart";

interface NationEmissionsProps {
  emissionsData: DataPoint[];
}

export const NationEmissions: FC<NationEmissionsProps> = ({
  emissionsData,
}) => {
  const { t } = useTranslation();

  return (
    <SectionWithHelp helpItems={["parisAgreementLine"]}>
      <CardHeader
        title={t("detailPage.emissionsDevelopment")}
        unit={t("detailPage.inTons")}
      />
      <div
        className="mt-8"
        style={{ height: getDynamicChartHeight("overview", false) }}
      >
        <NationOverviewChart projectedData={emissionsData} />
      </div>
    </SectionWithHelp>
  );
};
