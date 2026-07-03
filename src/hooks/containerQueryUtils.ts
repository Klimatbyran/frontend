type Size = {
  width: number;
  height: number;
};

type QueryFunction = (size: Size) => boolean;

function getElementSize(element: HTMLElement): Size | null {
  if (typeof element.getBoundingClientRect !== "function") {
    return null;
  }

  try {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  } catch (error) {
    console.warn("Error getting bounding client rect:", error);
    return null;
  }
}

function evaluateQuery(
  element: HTMLElement,
  queryFn: QueryFunction,
  setMatches: (matches: boolean) => void,
) {
  const size = getElementSize(element);
  if (!size) {
    setMatches(false);
    return;
  }

  try {
    setMatches(queryFn(size));
  } catch (error) {
    console.warn("Error evaluating container query:", error);
    setMatches(false);
  }
}

function scheduleInitialCheck(checkFn: () => void) {
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(checkFn);
  } else {
    checkFn();
  }
}

function createWindowResizeFallback(
  element: HTMLElement,
  queryFn: QueryFunction,
  setMatches: (matches: boolean) => void,
) {
  const handleResize = () => evaluateQuery(element, queryFn, setMatches);

  scheduleInitialCheck(handleResize);
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}

function createResizeObserver(
  element: HTMLElement,
  queryFn: QueryFunction,
  setMatches: (matches: boolean) => void,
) {
  const observer = new ResizeObserver(([entry]) => {
    try {
      const { width, height } = entry.contentRect;
      setMatches(queryFn({ width, height }));
    } catch (error) {
      console.warn("Error in ResizeObserver callback:", error);
      setMatches(false);
    }
  });

  observer.observe(element);
  scheduleInitialCheck(() => evaluateQuery(element, queryFn, setMatches));

  return () => {
    try {
      observer.disconnect();
    } catch (error) {
      console.warn("Error disconnecting ResizeObserver:", error);
    }
  };
}

export function setupContainerQueryObserver(
  element: HTMLElement,
  queryFn: QueryFunction,
  setMatches: (matches: boolean) => void,
): () => void {
  if (typeof ResizeObserver === "undefined") {
    return createWindowResizeFallback(element, queryFn, setMatches);
  }

  try {
    return createResizeObserver(element, queryFn, setMatches);
  } catch (error) {
    console.warn("Error creating ResizeObserver:", error);
    return createWindowResizeFallback(element, queryFn, setMatches);
  }
}

export type { Size, QueryFunction };
