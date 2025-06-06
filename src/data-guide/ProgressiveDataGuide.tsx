import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataGuideItemId, dataGuideHelpItems } from "./items";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { DataGuideMarkdown } from "./DataGuideMarkdown";

interface ProgressiveDataGuideProps {
  titleKey?: string;
  items: DataGuideItemId[];
  className?: string;
}

export function ProgressiveDataGuide({
  titleKey,
  items,
  className,
}: ProgressiveDataGuideProps) {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const title = titleKey ? t(titleKey) : t("dataGuide.buttonFallbackTitle");

  const handleItemToggle = (itemId: string, isOpen: boolean) => {
    if (isOpen) {
      // Check if the item trigger button will be visible after opening
      setTimeout(() => {
        const triggerButton = document.querySelector(
          `[data-item-id="${itemId}"]`,
        );
        if (triggerButton) {
          const rect = triggerButton.getBoundingClientRect();
          const isVisible =
            rect.top >= 60 && rect.top <= window.innerHeight * 0.8;

          if (!isVisible) {
            const rect = triggerButton.getBoundingClientRect();
            const headerOffset = 80; // Adjust this value based on your header height
            const targetPosition = window.pageYOffset + rect.top - headerOffset;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });
          }
        }
      }, 200);
    }
    setActiveItem(isOpen ? itemId : null);
  };

  const dataGuideEnabled = ["localhost", "stage"].some((enabledHost) =>
    window.location.hostname.includes(enabledHost),
  );

  if (!dataGuideEnabled) {
    return null;
  }

  return (
    <div className={cn(className, "space-y-2 mt-8")}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 w-full",
              "bg-blue-5/40 text-gray-300 hover:bg-blue-5/70",
              "data-[state=open]:bg-blue-5/60 data-[state=open]:text-blue-1 data-[state=open]:hover:bg-blue-5/70",
            )}
          >
            <GraduationCap className="w-4 h-4 text-blue-1" />
            <span>{title}</span>
            <ChevronDownIcon
              className={cn(
                "w-4 h-4 transition-transform ml-auto",
                "data-[state=open]:rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent
          className={cn(
            "transition-all duration-300 ease-out overflow-hidden",
            "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          )}
        >
          <div className="bg-black-1/60 rounded-md p-3 space-y-1 mt-2">
            {items.map((itemId) => {
              const item = dataGuideHelpItems[itemId];
              return (
                <Collapsible
                  key={itemId}
                  open={activeItem === itemId}
                  onOpenChange={(isOpen) => handleItemToggle(itemId, isOpen)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      data-item-id={itemId}
                      className="flex justify-between w-full py-1.5 px-2 items-center text-sm hover:bg-black-1/70 rounded transition-colors text-blue-2/80"
                    >
                      <span className="text-left">{t(item.titleKey)}</span>
                      <ChevronDownIcon
                        className={cn(
                          "w-3 h-3 transition-transform",
                          "data-[state=open]:rotate-180",
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
                    <div className="px-2 py-2 text-sm text-gray-300 leading-relaxed border-b border-t border-black-1/80">
                      <DataGuideMarkdown item={item} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
