import { useState, useEffect, useCallback } from "react";

interface ResponsiveSize {
  innerRadius: number;
  outerRadius: number;
  showLabels?: boolean;
}

/** Room for cornerRadius / paddingAngle at SVG edges */
const PIE_EDGE_INSET = 8;
/** Slightly undersize vs container so the chart doesn't feel cramped */
const FILL_CONTAINER_SCALE = 0.88;

function resolvePieSize(
  containerWidth: number,
  containerHeight: number,
  includeLabels: boolean,
  maxOuterRadius?: number,
  fillContainer = false,
): ResponsiveSize {
  const width =
    containerWidth > 0 ? containerWidth : Math.min(window.innerWidth, 360);
  const height = containerHeight > 0 ? containerHeight : width;
  const viewportWidth = window.innerWidth;

  let innerRadius: number;
  let outerRadius: number;
  let showLabels = includeLabels;

  if (fillContainer) {
    outerRadius = Math.max(
      40,
      (Math.min(width, height) / 2 - PIE_EDGE_INSET) * FILL_CONTAINER_SCALE,
    );
    if (maxOuterRadius != null) {
      outerRadius = Math.min(outerRadius, maxOuterRadius);
    }
    innerRadius = Math.round(outerRadius * 0.55);
    return {
      innerRadius,
      outerRadius,
      ...(includeLabels ? { showLabels } : {}),
    };
  }

  // Viewport sets target size; container width caps so the pie fits its column
  if (viewportWidth < 640) {
    innerRadius = 50;
    outerRadius = 100;
    showLabels = false;
  } else if (viewportWidth < 768) {
    innerRadius = 75;
    outerRadius = 150;
  } else {
    innerRadius = 100;
    outerRadius = 200;
  }

  const maxOuter = Math.max(40, width / 2 - PIE_EDGE_INSET);
  outerRadius = Math.min(outerRadius, maxOuter);
  if (maxOuterRadius != null) {
    outerRadius = Math.min(outerRadius, maxOuterRadius);
  }
  innerRadius = Math.min(innerRadius, Math.round(outerRadius * 0.55));

  return {
    innerRadius,
    outerRadius,
    ...(includeLabels ? { showLabels } : {}),
  };
}

export function useResponsiveChartSize(
  includeLabels = false,
  maxOuterRadius?: number,
  fillContainer = false,
) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [size, setSize] = useState<ResponsiveSize>(() =>
    resolvePieSize(0, 0, includeLabels, maxOuterRadius, fillContainer),
  );

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        setContainerWidth(width);
        setContainerHeight(height);
        setSize(
          resolvePieSize(
            width,
            height,
            includeLabels,
            maxOuterRadius,
            fillContainer,
          ),
        );
        return;
      }

      setSize(
        resolvePieSize(0, 0, includeLabels, maxOuterRadius, fillContainer),
      );
    };

    updateSize();

    if (container) {
      const observer = new ResizeObserver(updateSize);
      observer.observe(container);
      window.addEventListener("resize", updateSize);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSize);
      };
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [container, includeLabels, maxOuterRadius, fillContainer]);

  return { size, containerRef, containerWidth, containerHeight };
}
