import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Sidebar } from "./Sidebar";
import { DataGuideContext, useTrackGuideItems } from "./internal";

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { items, pushItems, popItems } = useTrackGuideItems();

  const showSidebar = items.length > 0;
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
        <Sidebar toggleOpen={toggleOpen} open={open} items={items} />
      )}
    </DataGuideContext.Provider>
  );
};
