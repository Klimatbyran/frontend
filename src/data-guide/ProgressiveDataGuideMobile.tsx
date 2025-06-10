import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { DataGuideItemId, dataGuideHelpItems } from "./items";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { DataGuideMarkdown } from "./DataGuideMarkdown";

interface ProgressiveDataGuideMobileProps {
  items: DataGuideItemId[];
}

export function ProgressiveDataGuideMobile({
  items,
}: ProgressiveDataGuideMobileProps) {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<DataGuideItemId>>(new Set());

  const handleItemToggle = (itemId: DataGuideItemId, isOpen: boolean) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-3 space-y-1 mt-2">
      {items.map((itemId) => {
        const item = dataGuideHelpItems[itemId];
        return (
          <Collapsible
            key={itemId}
            open={openItems.has(itemId)}
            onOpenChange={(isOpen) => handleItemToggle(itemId, isOpen)}
          >
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex justify-between w-full py-1.5 px-2 items-center text-sm hover:bg-black-1/70 rounded transition-colors text-white font-bold",
                )}
              >
                <span className="text-left">{t(item.titleKey)}</span>
                <ChevronDownIcon
                  className={cn(
                    "w-3 h-3 transition-transform",
                    openItems.has(itemId) && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent
              className={cn(
                "transition-all duration-200 ease-out overflow-hidden",
                "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
              )}
            >
              <div className="px-2 mb-2 pt-2 pb-4 text-sm font-light text-gray-300 leading-relaxed border-b border-black-1">
                <DataGuideMarkdown
                  item={item}
                  className="max-w-prose px-0 sm:px-4"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
