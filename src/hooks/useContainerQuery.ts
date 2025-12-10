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
    if (!ref.current) return;

    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return;

    // Initial check
    const initialCheck = () => {
      if (
        ref.current &&
        typeof ref.current.getBoundingClientRect === "function"
      ) {
        try {
          const { width, height } = ref.current.getBoundingClientRect();
          const doesMatch = queryFn({ width, height });
          setMatches(doesMatch);
        } catch (error) {
          console.warn("Error getting bounding client rect:", error);
          setMatches(false);
        }
      }
    };

    // Check if ResizeObserver is available
    if (typeof ResizeObserver === "undefined") {
      // Fallback for browsers without ResizeObserver
      const handleResize = () => {
        if (
          ref.current &&
          typeof ref.current.getBoundingClientRect === "function"
        ) {
          try {
            const { width, height } = ref.current.getBoundingClientRect();
            const doesMatch = queryFn({ width, height });
            setMatches(doesMatch);
          } catch (error) {
            console.warn("Error getting bounding client rect:", error);
            setMatches(false);
          }
        }
      };

      // Initial check
      // Use requestAnimationFrame to ensure the element is properly rendered
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(initialCheck);
      } else {
        initialCheck();
      }

      // Listen for window resize as fallback
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    let observer: ResizeObserver;
    try {
      observer = new ResizeObserver(([entry]) => {
        try {
          const { width, height } = entry.contentRect;
          const doesMatch = queryFn({ width, height });
          setMatches(doesMatch);
        } catch (error) {
          console.warn("Error in ResizeObserver callback:", error);
          setMatches(false);
        }
      });

      try {
        observer.observe(ref.current);
        
        // Initial check for ResizeObserver case
        if (typeof requestAnimationFrame !== "undefined") {
          requestAnimationFrame(initialCheck);
        } else {
          initialCheck();
        }
      } catch (error) {
        console.warn("Error observing element with ResizeObserver:", error);
        // Fallback to window resize
        const handleResize = () => {
          if (
            ref.current &&
            typeof ref.current.getBoundingClientRect === "function"
          ) {
            try {
              const { width, height } = ref.current.getBoundingClientRect();
              const doesMatch = queryFn({ width, height });
              setMatches(doesMatch);
            } catch (error) {
              console.warn("Error getting bounding client rect:", error);
              setMatches(false);
            }
          }
        };

        // Initial check
        if (typeof requestAnimationFrame !== "undefined") {
          requestAnimationFrame(handleResize);
        } else {
          handleResize();
        }

        // Listen for window resize as fallback
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
    } catch (error) {
      console.warn("Error creating ResizeObserver:", error);
      // Fallback to window resize
      const handleResize = () => {
        if (
          ref.current &&
          typeof ref.current.getBoundingClientRect === "function"
        ) {
          try {
            const { width, height } = ref.current.getBoundingClientRect();
            const doesMatch = queryFn({ width, height });
            setMatches(doesMatch);
          } catch (error) {
            console.warn("Error getting bounding client rect:", error);
            setMatches(false);
          }
        }
      };

      // Initial check
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(handleResize);
      } else {
        handleResize();
      }

      // Listen for window resize as fallback
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    return () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn("Error disconnecting ResizeObserver:", error);
      }
    };
  }, [queryFn]);

  return [ref, matches];
}

export default useContainerQuery;
