import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { RelatedTerritoriesSection } from "@/components/detail/RelatedTerritoriesSection";
import { useRelatedTerritoriesSection } from "@/hooks/territories/useRelatedTerritoriesSection";
import { useScreenSize } from "@/hooks/useScreenSize";
import { MapEntityType } from "@/types/rankings";

interface EntityListBoxProps {
  items: string[];
  entityType: MapEntityType;
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function EntityListBox(props: EntityListBoxProps) {
  if (props.items.length === 0) {
    return null;
  }

  return <EntityListBoxContent {...props} />;
}

function EntityListBoxContent({
  items,
  entityType,
  helpItems = [],
  translateNamespace = "detailPage",
}: EntityListBoxProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const section = useRelatedTerritoriesSection(items, entityType, !isMobile);
  const { selectedKPI, loading } = section;

  const translationKey = `${translateNamespace}.${entityType}`;

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(translationKey)}
      </Text>
      {selectedKPI?.detailedDescription && (
        <div className="mb-4 md:mb-6">
          <p className="text-sm font-medium text-white">{selectedKPI.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-grey">
            {selectedKPI.detailedDescription}
          </p>
        </div>
      )}
      {!loading && !selectedKPI && (
        <p className="text-sm text-grey">{t("noData")}</p>
      )}
      {(loading || selectedKPI) && (
        <RelatedTerritoriesSection entityType={entityType} state={section} />
      )}
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}
