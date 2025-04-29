import { useState, useEffect, useRef } from "react";

interface ResponsiveSize {
  innerRadius: number;
  outerRadius: number;
  showLabels?: boolean;
}

export function useResponsiveChartSize(includeLabels = false) {
  const [size, setSize] = useState<ResponsiveSize>({
    innerRadius: 100,
    outerRadius: 200,
    ...(includeLabels && { showLabels: true }),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      if (width < 640) {
        setSize({
          innerRadius: 50,
          outerRadius: 100,
          ...(includeLabels && { showLabels: false }),
        });
      } else if (width < 768) {
        setSize({
          innerRadius: 75,
          outerRadius: 150,
          ...(includeLabels && { showLabels: true }),
        });
      } else {
        setSize({
          innerRadius: 100,
          outerRadius: 200,
          ...(includeLabels && { showLabels: true }),
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [includeLabels]);

  return { size, containerRef };
}
