import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

interface CompanyOverviewTooltipProps {
  yearOverYearChange: number | null;
}

export function CompanyOverviewTooltip({
  yearOverYearChange,
}: CompanyOverviewTooltipProps) {
  const { t } = useTranslation();

  return (
    <InfoTooltip ariaLabel="Information about emissions change rate">
      {yearOverYearChange != null ? (
        yearOverYearChange <= -0.8 || yearOverYearChange >= 0.8 ? (
          <>
            <p>{t("companies.card.emissionsChangeRateInfo")}</p>
            <p className="my-2">
              {t("companies.card.emissionsChangeRateInfoExtended")}
            </p>
          </>
        ) : (
          <p>{t("companies.card.emissionsChangeRateInfo")}</p>
        )
      ) : (
        <p>{t("companies.card.noData")}</p>
      )}
    </InfoTooltip>
  );
}
