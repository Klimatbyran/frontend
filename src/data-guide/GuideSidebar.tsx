import { cn } from "@/lib/utils";
import { PanelRightCloseIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGuideContent } from "./DataGuideContent";
import { HelpItemId } from "./guide-items";

type GuideSidebarProps = {
  toggleOpen: () => void;
  open: boolean;
  items: HelpItemId[];
};

export const GuideSidebar = ({
  open,
  toggleOpen,
  items,
}: GuideSidebarProps) => {
  const { t } = useTranslation();
  const [inTransition, setInTransition] = useState(false);

  useEffect(() => {
    setInTransition(true);
  }, [open]);

  const transitionEnd = () => {
    setInTransition(false);
  };

  return (
    <div
      className={cn(
        "p-4 bg-black-2 w-[300px] border-l border-blue-5/70",
        "fixed right-0 top-10 lg:top-12 h-[calc(100%-2.5rem)] lg:h-[calc(100%-3rem)]",
        "transition-all duration-300  z-[30]",
        open ? "" : "translate-x-full",
      )}
      onTransitionEnd={transitionEnd}
    >
      <div
        className={cn(
          "h-full",
          "flex flex-col min-h-0",
          !open && !inTransition && "hidden",
        )}
      >
        <div className="flex align-center">
          <h2 className="text-2xl">{t("dataGuide.title")}</h2>
          <button
            onClick={toggleOpen}
            className="ml-auto focus-visible:ring-white disabled:pointer-events-none hover:bg-blue-5 active:ring-1 active:ring-white disabled:opacity-50 p-1 rounded-md mr-px mt-px"
          >
            <PanelRightCloseIcon />
          </button>
        </div>
        <DataGuideContent items={items} />
      </div>
    </div>
  );
};
