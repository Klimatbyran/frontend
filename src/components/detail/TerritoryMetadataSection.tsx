import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Text } from "@/components/ui/text";
import { PoliticalRuleLabel } from "./PoliticalRuleLabel";
import {
  DetailMetadataField,
  DetailMetadataPanel,
} from "./DetailMetadataPanel";

export interface TerritoryMetadataSectionProps {
  region?: string;
  regionLinkTo?: string;
  politicalRule?: string[];
  politicalKSO?: string;
  translateNamespace?: string;
}

function MetadataValue({
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

export function TerritoryMetadataSection({
  region,
  regionLinkTo,
  politicalRule,
  politicalKSO,
  translateNamespace = "municipalityDetailPage",
}: TerritoryMetadataSectionProps) {
  const { t } = useTranslation();
  const parties = politicalRule?.filter(Boolean) ?? [];
  const hasParties = parties.length > 0;

  if (!region && !hasParties && !politicalKSO) {
    return null;
  }

  return (
    <DetailMetadataPanel>
      {region && (
        <DetailMetadataField label={t(`${translateNamespace}.region`)}>
          <MetadataValue linkTo={regionLinkTo}>{region}</MetadataValue>
        </DetailMetadataField>
      )}
      {hasParties && (
        <DetailMetadataField
          label={t(`${translateNamespace}.politicalRule`)}
        >
          <Text>
            <PoliticalPartyLogos parties={parties} />
          </Text>
        </DetailMetadataField>
      )}
      {politicalKSO && (
        <DetailMetadataField
          label={t(`${translateNamespace}.politicalKSO`)}
        >
          <PoliticalRuleLabel
            src={`/logos/politicalParties/${politicalKSO}.png`}
            alt={politicalKSO}
            fallback={politicalKSO}
          />
        </DetailMetadataField>
      )}
    </DetailMetadataPanel>
  );
}
