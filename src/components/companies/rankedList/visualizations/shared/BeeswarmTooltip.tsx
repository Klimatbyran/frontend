import { useRef, useEffect } from "react";

interface BeeswarmTooltipProps {
  companyName: string;
  value: number;
  unit: string;
  position: { x: number; y: number } | null;
  formatValue?: (value: number, unit: string) => string;
  rawValue?: number;
  isCapped?: boolean;
  capThreshold?: number;
}

export function BeeswarmTooltip({
  companyName,
  value,
  unit,
  position,
  formatValue,
  rawValue,
  isCapped,
  capThreshold,
}: BeeswarmTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position tooltip near cursor, but keep it within viewport
    let left = position.x + 10;
    let top = position.y + 10;

    // Adjust if tooltip would go off right edge
    if (left + rect.width > viewportWidth) {
      left = position.x - rect.width - 10;
    }

    // Adjust if tooltip would go off bottom edge
    if (top + rect.height > viewportHeight) {
      top = position.y - rect.height - 10;
    }

    // Ensure tooltip doesn't go off left or top edges
    left = Math.max(10, left);
    top = Math.max(10, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [position]);

  if (!position) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-none"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        padding: "8px",
        color: "#fff",
        fontSize: "13px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        {companyName}
      </div>
      <div>
        {isCapped && rawValue !== undefined && capThreshold !== undefined ? (
          <div>
            <div>
              Actual: {formatValue ? formatValue(rawValue, unit) : `${rawValue < 0 ? "-" : "+"}${Math.abs(rawValue).toFixed(1)}${unit}`}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)", marginTop: "2px" }}>
              Capped at {formatValue ? formatValue(capThreshold, unit) : `${capThreshold.toFixed(1)}${unit}`} for chart visibility
            </div>
          </div>
        ) : (
          formatValue
            ? formatValue(value, unit)
            : `${value < 0 ? "Reduction" : "Increase"}: ${Math.abs(value).toFixed(1)}${unit}`
        )}
      </div>
    </div>
  );
}
