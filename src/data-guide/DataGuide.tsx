import { Button } from "@/components/ui/button";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { GuideSheet } from "./GuideSheet";
import { GuideSidebar } from "./GuideSidebar";
import { DataGuideContext, useTrackGuideItems } from "./internal";

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isMobile } = useScreenSize();

  const dataGuideEnabled = new URLSearchParams(location.search).has(
    "enableDataGuide",
  );

  const [open, setOpen] = useState(false);
  const { items, pushItems, popItems } = useTrackGuideItems();

  const showDataGuide = dataGuideEnabled && items.length > 0;
  const openAndShow = open && showDataGuide;

  const toggleOpen = useCallback(() => {
    setOpen((isOpen) => !isOpen);
  }, [setOpen]);

  const showMobile = showDataGuide && isMobile;
  const showSidebar = showDataGuide && !isMobile;

  return (
    <DataGuideContext.Provider
      value={{ pushGuideItems: pushItems, popGuideItems: popItems }}
    >
      <div
        className={cn(
          "transition-all duration-300",
          openAndShow && showSidebar ? "mr-[calc(300px+1rem)]" : "mr-[1rem]",
        )}
      >
        {children}
      </div>
      {showDataGuide && (
        <Button
          size="sm"
          className={cn(
            "fixed top-1/2 transform -rotate-90 origin-bottom-right right-0 bg-blue-5 rounded-none transition-all duration-300 z-[30]",
            open ? "mr-[300px]" : "",
          )}
          onClick={() => toggleOpen()}
        >
          {t("dataGuide.buttonTitle")}
        </Button>
      )}
      {showMobile && <GuideSheet setOpen={setOpen} open={open} items={items} />}
      {showSidebar && (
        <GuideSidebar toggleOpen={toggleOpen} open={open} items={items} />
      )}
    </DataGuideContext.Provider>
  );
};
