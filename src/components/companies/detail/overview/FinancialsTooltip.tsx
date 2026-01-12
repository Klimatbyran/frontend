import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

// Created as a separate component in case we want to add it to more locations
interface FinancialsTooltipProps {
  className?: string;
}

export function FinancialsTooltip({ className }: FinancialsTooltipProps) {
  const { t } = useTranslation();

  return (
    <InfoTooltip
      ariaLabel="Information about financed emissions reporting"
      className={className}
    >
      <p>{t("companies.overview.financialsTooltip")}</p>
    </InfoTooltip>
  );
}
