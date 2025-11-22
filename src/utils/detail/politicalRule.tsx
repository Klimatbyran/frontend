import { ReactElement } from "react";
import { PoliticalRuleLabel } from "@/components/detail/PoliticalRuleLabel";

export function getPoliticalRuleLabels(politicalParty: string): ReactElement {
  const imgSrc = `/logos/politicalParties/${politicalParty}.png`;

  return (
    <PoliticalRuleLabel
      src={imgSrc}
      alt={politicalParty}
      fallback={politicalParty}
    />
  );
}
