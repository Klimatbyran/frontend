import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { PoliticalRuleLabel } from "./PoliticalRuleLabel";

export interface PoliticalRuleSectionProps {
  politicalRule: string[];
  translateNamespace: string;
  politicalRuleLabelKey?: string;
  politicalKSO?: string;
  politicalXSOLabelKey?: string;
}

export function PoliticalRuleSection({
  politicalRule,
  translateNamespace,
  politicalRuleLabelKey = "politicalRule",
  politicalKSO,
  politicalXSOLabelKey,
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
    <div className="flex flex-col gap-2 my-4">
      <div className="flex gap-2">
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
      {politicalKSO && (
        <div className="flex gap-2">
          <Text
            variant="body"
            className="text-grey text-sm md:text-base lg:text-lg"
          >
            {t(`${translateNamespace}.${politicalXSOLabelKey}`)}:
          </Text>
          <PoliticalRuleLabel
            src={`/logos/politicalParties/${politicalKSO}.png`}
            alt={politicalKSO}
            fallback={politicalKSO}
          />
        </div>
      )}
    </div>
  );
}
