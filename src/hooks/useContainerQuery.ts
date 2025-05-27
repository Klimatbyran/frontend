import { RefObject, useRef, useState, useEffect } from "react";

type Size = {
  width: number;
  height: number;
};

type QueryFunction = (size: Size) => boolean;

/**
 * useContainerQuery
 * Observes the size of a container element and returns whether it matches the given query function.
 *
 * @param queryFn - A function that receives the container size and returns true if the condition matches.
 * @returns A tuple with a ref to assign to the container element and a boolean indicating if the query matches.
 */
function useContainerQuery<T extends HTMLElement>(
  queryFn: QueryFunction,
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const doesMatch = queryFn({ width, height });
      setMatches(doesMatch);
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [queryFn]);

  return [ref, matches];
}

export default useContainerQuery;
