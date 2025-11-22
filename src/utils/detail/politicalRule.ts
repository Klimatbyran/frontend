import { ReactElement } from "react";
import { PoliticalRuleLabel } from "@/components/detail/PoliticalRuleLabel";

/**
 * Gets all the political party labels depending on availability.
 * Returns a PoliticalRuleLabel component for the given political party.
 */
export function getPoliticalRuleLabels(
  politicalParty: string,
): ReactElement {
  const imgSrc = `/logos/politicalParties/${politicalParty}.png`;

  return (
    <PoliticalRuleLabel
      src={imgSrc}
      alt={politicalParty}
      fallback={politicalParty}
    />
  );
}

