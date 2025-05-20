import { useContext, useMemo, useEffect } from "react";
import { DataGuideContext } from "./internal";
import { HelpItemId } from "./guide-items";

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
