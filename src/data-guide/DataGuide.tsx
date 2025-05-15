import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Sidebar } from "./Sidebar";
import { DataGuideContext, useTrackGuideItems } from "./internal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const dataGuideEnabled = new URLSearchParams(location.search).has(
    "enableDataGuide",
  );

  const [open, setOpen] = useState(false);
  const { items, pushItems, popItems } = useTrackGuideItems();

  const showSidebar = dataGuideEnabled && items.length > 0;
  const openAndShow = open && showSidebar;

  const toggleOpen = useCallback(() => {
    setOpen((isOpen) => !isOpen);
  }, [setOpen]);

  return (
    <DataGuideContext.Provider
      value={{ pushGuideItems: pushItems, popGuideItems: popItems }}
    >
      <div
        className={cn(
          "transition-all duration-300",
          openAndShow ? "mr-[calc(300px+1rem)]" : "mr-[1rem]",
        )}
      >
        {children}
      </div>
      {showSidebar && (
        <>
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
          <Sidebar toggleOpen={toggleOpen} open={open} items={items} />
        </>
      )}
    </DataGuideContext.Provider>
  );
};
