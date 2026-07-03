import { RefObject, useRef, useState, useEffect } from "react";
import {
  setupContainerQueryObserver,
  type QueryFunction,
} from "./containerQueryUtils";

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
    if (!ref.current) return;
    if (typeof window === "undefined") return;

    return setupContainerQueryObserver(ref.current, queryFn, setMatches);
  }, [queryFn]);

  return [ref, matches];
}

export default useContainerQuery;
