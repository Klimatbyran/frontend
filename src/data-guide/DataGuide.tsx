import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { HelpItemId, ItemRefCount, itemsToShow } from "./items";

export interface DataGuideContext {
  pushGuideItems: (items: HelpItemId[]) => void;
  popGuideItems: (items: HelpItemId[]) => void;
}

const DataGuideContext = createContext<DataGuideContext>({
  pushGuideItems: () => {},
  popGuideItems: () => {},
});

export const useDataGuide = () => {
  const context = useContext(DataGuideContext);
  if (!context) {
    throw new Error("useDataGuide must be used within a DataGuideProvider");
  }
  return context;
};

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [itemRefCount, setItemRefCount] = useState({} as ItemRefCount);

  const showItems = useMemo(() => itemsToShow(itemRefCount), [itemRefCount]);
  const anyItems = showItems.length > 0;

  // This provides a way for
  const pushGuideItems = useCallback(
    (items: HelpItemId[]) => {
      setItemRefCount((oldRefCount) =>
        items.reduce(
          (acc, id) => ({
            ...acc,
            [id]: (acc[id] || 0) + 1,
          }),
          oldRefCount,
        ),
      );
    },
    [setItemRefCount],
  );

  const popGuideItems = useCallback(
    (items: HelpItemId[]) => {
      setItemRefCount((oldRefCount) =>
        items.reduce(
          (acc, id) => ({
            ...acc,
            [id]: Math.max(0, (acc[id] || 1) - 1),
          }),
          oldRefCount,
        ),
      );
    },
    [setItemRefCount],
  );

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <DataGuideContext.Provider value={{ pushGuideItems, popGuideItems }}>
      <div
        className={cn(
          "transition-all duration-300",
          open ? "mr-[calc(300px+1rem)]" : "mr-[1rem]",
        )}
      >
        {children}
      </div>
      {anyItems && (
        <Sidebar toggleOpen={toggleOpen} open={open} items={showItems} />
      )}
    </DataGuideContext.Provider>
  );
};

/**
 * The main way for components to indicate which help items are relevant when the component is used.
 *
 * @param items The help items relevant to the component using this hook
 */
export const useGuideItems = (items: HelpItemId[]) => {
  const { popGuideItems, pushGuideItems } = useDataGuide();

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
