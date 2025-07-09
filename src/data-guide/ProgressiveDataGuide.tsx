import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataGuideItemId } from "./items";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  NonEmptyArray,
  ProgressiveDataGuideDesktop,
} from "./ProgressiveDataGuideDesktop";
import { ProgressiveDataGuideMobile } from "./ProgressiveDataGuideMobile";
import { useState } from "react";
import { dataGuideFeatureFlagEnabled } from "../utils/feature-flag";

interface ProgressiveDataGuideProps {
  titleKey?: string;
  items: DataGuideItemId[];
  className?: string;
  style?: "button" | "sectionFooter";
}

export function ProgressiveDataGuide({
  titleKey,
  items,
  className,
  style = "button",
}: ProgressiveDataGuideProps) {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useScreenSize();
  const isDesktop = !isMobile && !isTablet;
  const [open, setOpen] = useState(false);

  const title = titleKey ? t(titleKey) : t("dataGuide.buttonFallbackTitle");

  if (!dataGuideFeatureFlagEnabled() || items.length < 1) {
    return null;
  }

  const nonEmptyItems = items as NonEmptyArray<DataGuideItemId>;

  return (
    <div className={cn(className, "space-y-2")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 w-full",
              "text-gray-300 hover:bg-black-1/60",
              style === "button"
                ? "data-[state=open]:hover:bg-black-1/60 bg-black-1/40 py-4 text-sm"
                : "text-base",
            )}
          >
            <GraduationCap className="w-4 h-4 text-blue-1" />
            <span>{title}</span>
            <ChevronDownIcon
              className={cn(
                "w-4 h-4 transition-transform ml-auto",
                open && "rotate-180",
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
          {isDesktop ? (
            <ProgressiveDataGuideDesktop items={nonEmptyItems} />
          ) : (
            <ProgressiveDataGuideMobile items={items} />
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
