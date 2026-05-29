import { EntityListBox } from "@/components/detail/EntityListBox";
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
  return (
    <EntityListBox
      items={municipalities}
      entityType="municipalities"
      helpItems={helpItems}
      translateNamespace={translateNamespace}
    />
  );
}
