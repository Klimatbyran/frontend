import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { PoliticalRuleLabel } from "./PoliticalRuleLabel";

export interface PoliticalRuleSectionProps {
  politicalRule: string[];
  translateNamespace: string;
  politicalRuleLabelKey?: string;
}

export function PoliticalRuleSection({
  politicalRule,
  translateNamespace,
  politicalRuleLabelKey = "politicalRule",
}: PoliticalRuleSectionProps) {
  const { t } = useTranslation();

  const politicalRuleLabels = politicalRule.map((p, index) => (
    <span key={index}>
      {index ? ", " : ""}
      <PoliticalRuleLabel
        src={`/logos/politicalParties/${p}.png`}
        alt={p}
        fallback={p}
      />
    </span>
  ));

  return (
    <div className="flex flex-row items-center gap-2 my-4">
      <Text
        variant="body"
        className="text-grey text-sm md:text-base lg:text-lg"
      >
        {t(`${translateNamespace}.${politicalRuleLabelKey}`)}:
      </Text>
      <Text variant="body" className="text-sm md:text-base lg:text-lg">
        {politicalRuleLabels}
      </Text>
    </div>
  );
}
