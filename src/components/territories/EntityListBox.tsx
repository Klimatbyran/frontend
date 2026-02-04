import { EntityListBox } from "@/components/detail/EntityListBox";
import { DataGuideItemId } from "@/data-guide/items";
import { EntityType } from "@/lib/constants/entities";

interface ListBoxProps {
  territories: string[];
  entityType: EntityType;
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function EntityListBox({
  territories,
  entityType,
  helpItems = [],
  translateNamespace = "detailPage",
}: ListBoxProps) {
  return (
    <EntityListBox
      territories={territories}
      entityType={entityType}
      helpItems={helpItems}
      translateNamespace={translateNamespace}
    />
  );
}
