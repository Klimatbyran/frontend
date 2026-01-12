import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";

interface MunicipalityListBoxProps {
  municipalities: string[];
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function MunicipalityListBox({
  municipalities,
  helpItems = [],
  translateNamespace = "detailPage",
}: MunicipalityListBoxProps) {
  const { t } = useTranslation();

  if (municipalities.length === 0) {
    return null;
  }

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(`${translateNamespace}.municipalities`)}
      </Text>
      <div className="flex flex-wrap gap-2 md:gap-4">
        {municipalities.map((municipality) => (
          <span key={municipality}>
            <LocalizedLink
              to={`/municipalities/${municipality}`}
              className="text-orange-2 hover:text-orange-1 underline text-sm md:text-base"
            >
              {municipality}
            </LocalizedLink>
          </span>
        ))}
      </div>
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}
