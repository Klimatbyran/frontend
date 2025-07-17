import { DataGuideItemId } from "@/data-guide/items";
import { ProgressiveDataGuide } from "./ProgressiveDataGuide";
import { cn } from "@/lib/utils";
import { dataGuideFeatureFlagEnabled } from "../utils/ui/featureFlags";

type SectionWithHelpProps = {
  children: React.ReactNode;
  helpItems: DataGuideItemId[];
};

export const SectionWithHelp = ({
  children,
  helpItems,
}: SectionWithHelpProps) => {
  const showDataGuide = dataGuideFeatureFlagEnabled() && helpItems.length > 0;

  return (
    <div className="bg-black-2 rounded-level-1 py-4 md:py-8">
      <div className={cn("px-4 md:px-16", !showDataGuide && "md:mb-8")}>
        {children}
      </div>
      {showDataGuide && (
        <div className="mt-8 pt-4 md:pt-8 px-4 md:px-16 border-t border-black-1">
          <ProgressiveDataGuide items={helpItems} style="sectionFooter" />
        </div>
      )}
    </div>
  );
};
