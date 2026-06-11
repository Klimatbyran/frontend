import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Text } from "@/components/ui/text";
import { PoliticalRuleLabel } from "./PoliticalRuleLabel";
import {
  SupplementalDataField,
  SupplementalDataPanel,
} from "./SupplementalDataPanel";

export interface TerritorySupplementalDataProps {
  region?: string;
  regionLinkTo?: string;
  politicalRule?: string[];
  politicalKSO?: string;
  translateNamespace?: string;
}

function SupplementalDataValue({
  linkTo,
  children,
}: {
  linkTo?: string;
  children: ReactNode;
}) {
  if (linkTo) {
    return (
      <LocalizedLink
        to={linkTo}
        className="text-blue-2 hover:text-blue-1 transition-colors"
      >
        {children}
      </LocalizedLink>
    );
  }

  return <Text>{children}</Text>;
}

function PoliticalPartyLogos({ parties }: { parties: string[] }) {
  return (
    <>
      {parties.map((party, index) => (
        <span key={party}>
          {index ? ", " : ""}
          <PoliticalRuleLabel
            src={`/logos/politicalParties/${party}.png`}
            alt={party}
            fallback={party}
          />
        </span>
      ))}
    </>
  );
}

export function TerritorySupplementalData({
  region,
  regionLinkTo,
  politicalRule,
  politicalKSO,
  translateNamespace = "municipalityDetailPage",
}: TerritorySupplementalDataProps) {
  const { t } = useTranslation();
  const parties = politicalRule?.filter(Boolean) ?? [];
  const hasParties = parties.length > 0;

  if (!region && !hasParties && !politicalKSO) {
    return null;
  }

  return (
    <SupplementalDataPanel>
      {region && (
        <SupplementalDataField label={t(`${translateNamespace}.region`)}>
          <SupplementalDataValue linkTo={regionLinkTo}>
            {region}
          </SupplementalDataValue>
        </SupplementalDataField>
      )}
      {hasParties && (
        <SupplementalDataField label={t(`${translateNamespace}.politicalRule`)}>
          <Text>
            <PoliticalPartyLogos parties={parties} />
          </Text>
        </SupplementalDataField>
      )}
      {politicalKSO && (
        <SupplementalDataField label={t(`${translateNamespace}.politicalKSO`)}>
          <PoliticalRuleLabel
            src={`/logos/politicalParties/${politicalKSO}.png`}
            alt={politicalKSO}
            fallback={politicalKSO}
          />
        </SupplementalDataField>
      )}
    </SupplementalDataPanel>
  );
}
