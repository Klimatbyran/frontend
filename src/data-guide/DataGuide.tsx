import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { HelpItemId, useTrackGuideItems } from "./items";

interface DataGuideContext {
  pushGuideItems: (items: HelpItemId[]) => void;
  popGuideItems: (items: HelpItemId[]) => void;
}

const DataGuideContext = createContext<DataGuideContext>({
  pushGuideItems: () => {},
  popGuideItems: () => {},
});

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { items, pushItems, popItems } = useTrackGuideItems();

  const showSidebar = items.length > 0;

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <DataGuideContext.Provider
      value={{ pushGuideItems: pushItems, popGuideItems: popItems }}
    >
      <div
        className={cn(
          "transition-all duration-300",
          open ? "mr-[calc(300px+1rem)]" : "mr-[1rem]",
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

/**
 * The main way for components to indicate which help items are relevant when the component is used.
 *
 * @param items The help items relevant to the component using this hook
 */
export const useDataGuide = (items: HelpItemId[]) => {
  const context = useContext(DataGuideContext);
  if (!context) {
    throw new Error("useDataGuide must be used within a DataGuideProvider");
  }

  const { pushGuideItems, popGuideItems } = context;

  // Only use the initial values and ignore any changes to it
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setupItems = useMemo(() => items, []);

  useEffect(() => {
    pushGuideItems(setupItems);
    return () => {
      popGuideItems(setupItems);
    };
  }, [setupItems, pushGuideItems, popGuideItems]);
};
