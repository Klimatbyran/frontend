import { useState, useEffect, useCallback } from "react";

interface ResponsiveSize {
  innerRadius: number;
  outerRadius: number;
  showLabels?: boolean;
}

function resolvePieSize(
  containerWidth: number,
  includeLabels: boolean,
  maxOuterRadius?: number,
): ResponsiveSize {
  const width =
    containerWidth > 0 ? containerWidth : window.innerWidth || 360;

  let innerRadius: number;
  let outerRadius: number;
  let showLabels = includeLabels;

  if (width < 640) {
    innerRadius = 50;
    outerRadius = 100;
    showLabels = false;
  } else if (width < 768) {
    innerRadius = 75;
    outerRadius = 150;
  } else {
    innerRadius = 100;
    outerRadius = 200;
  }

  const maxOuter = Math.max(40, width / 2 - 12);
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
) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ResponsiveSize>(() =>
    resolvePieSize(0, includeLabels, maxOuterRadius),
  );

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container) {
      setSize(resolvePieSize(window.innerWidth, includeLabels, maxOuterRadius));
      return;
    }

    const updateSize = () => {
      setSize(
        resolvePieSize(container.clientWidth, includeLabels, maxOuterRadius),
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [container, includeLabels, maxOuterRadius]);

  return { size, containerRef };
}
