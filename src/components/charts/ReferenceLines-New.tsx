import React from "react";
import { ReferenceLine } from "recharts";
import { useTranslation } from "react-i18next";

interface BaseYearReferenceLineProps {
  baseYear: number;
  isFirstYear?: boolean;
}

export const BaseYearReferenceLine: React.FC<BaseYearReferenceLineProps> = ({
  baseYear,
  isFirstYear = false,
}) => {
  const { t } = useTranslation();

  return (
    <ReferenceLine
      label={{
        value: t("companies.emissionsHistory.baseYear"),
        position: "top",
        dx: isFirstYear ? 15 : 0,
        fill: "white",
        fontSize: 12,
        fontWeight: "normal",
      }}
      x={baseYear}
      stroke="var(--grey)"
      strokeDasharray="4 4"
      ifOverflow="extendDomain"
    />
  );
};

interface CurrentYearReferenceLineProps {
  currentYear: number;
}

export const CurrentYearReferenceLine: React.FC<
  CurrentYearReferenceLineProps
> = ({ currentYear }) => {
  return (
    <ReferenceLine
      x={currentYear}
      stroke="var(--orange-3)"
      strokeWidth={1}
      label={{
        value: currentYear,
        position: "top",
        fill: "var(--orange-2)",
        fontSize: 12,
        fontWeight: "normal",
      }}
    />
  );
};

// Combined reference lines for different chart types
interface CompanyReferenceLinesProps {
  baseYear?: number;
  isFirstYear?: boolean;
}

export const CompanyReferenceLines: React.FC<CompanyReferenceLinesProps> = ({
  baseYear,
  isFirstYear = false,
}) => {
  if (!baseYear) return null;

  return (
    <BaseYearReferenceLine baseYear={baseYear} isFirstYear={isFirstYear} />
  );
};

interface MunicipalityReferenceLinesProps {
  currentYear: number;
}

export const MunicipalityReferenceLines: React.FC<
  MunicipalityReferenceLinesProps
> = ({ currentYear }) => {
  return <CurrentYearReferenceLine currentYear={currentYear} />;
};
