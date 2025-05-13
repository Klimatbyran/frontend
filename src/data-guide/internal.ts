import { useState, useMemo, useCallback, createContext } from "react";
import { HelpItemId } from "./items";

export type ItemRefCount = Record<HelpItemId, number>;

interface DataGuideContext {
  pushGuideItems: (items: HelpItemId[]) => void;
  popGuideItems: (items: HelpItemId[]) => void;
}

export const DataGuideContext = createContext<DataGuideContext>({
  pushGuideItems: () => {},
  popGuideItems: () => {},
});

export const itemsToShow = (itemRefCount: ItemRefCount) =>
  Object.entries(itemRefCount)
    .filter(([_id, refCount]) => refCount > 0)
    .map(([id, _refCount]) => id as HelpItemId);

export const useTrackGuideItems = () => {
  const [itemRefCount, setItemRefCount] = useState({} as ItemRefCount);

  const items = useMemo(() => itemsToShow(itemRefCount), [itemRefCount]);

  // This provides a way for
  const pushItems = useCallback(
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

  const popItems = useCallback(
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

  return { items, pushItems, popItems };
};
