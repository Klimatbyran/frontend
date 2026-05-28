import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";

type EntityType = "municipalities" | "regions";

interface EntityListBoxProps {
  items: string[];
  entityType: EntityType;
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function EntityListBox({
  items,
  entityType,
  helpItems = [],
  translateNamespace = "detailPage",
}: EntityListBoxProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  const translationKey = `${translateNamespace}.${entityType}`;
  const basePath = `/${entityType}`;

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(translationKey)}
      </Text>
      <div className="flex flex-wrap gap-2 md:gap-4">
        {items.map((item) => (
          <span key={item}>
            <LocalizedLink
              to={`${basePath}/${item}`}
              className="text-orange-2 hover:text-orange-1 underline text-sm md:text-base"
            >
              {item}
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
