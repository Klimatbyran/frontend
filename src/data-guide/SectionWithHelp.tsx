import { DataGuideItemId } from "@/data-guide/items";
import { cn } from "@/lib/utils";
import { dataGuideFeatureFlagEnabled } from "../utils/ui/featureFlags";
import { ProgressiveDataGuide } from "./ProgressiveDataGuide";

type SectionWithHelpProps = {
  children: React.ReactNode;
  helpItems: DataGuideItemId[];
  className?: string;
  compactLayout?: boolean;
};

export const SectionWithHelp = ({
  children,
  helpItems,
  className,
  compactLayout = false,
}: SectionWithHelpProps) => {
  const showDataGuide = dataGuideFeatureFlagEnabled() && helpItems.length > 0;

  return (
    <div
      className={cn(
        "bg-black-2",
        "rounded-level-3 md:rounded-level-1",
        !compactLayout && "py-4 md:py-8",
        !compactLayout && "px-4 md:px-8",
        className,
      )}
    >
      <div className={cn(!showDataGuide && !compactLayout && "md:mb-8 pb-8")}>
        {children}
      </div>
      {showDataGuide && (
        <div className="mt-4 md:mt-8 pt-2 md:pt-8 px-2 md:px-0 border-t border-black-1">
          <ProgressiveDataGuide items={helpItems} style="sectionFooter" />
        </div>
      )}
    </div>
  );
};
