import { isMobile } from "react-device-detect";
import { ChartLine } from "@/components/charts";

interface CategoryLineProps {
  categoryKey: string;
  categoryId: number;
  isHidden: boolean;
  strokeDasharray: string;
  getCategoryColor: (id: number) => string;
  getCategoryName: (id: number) => string;
  onToggle: (categoryId: number) => void;
}

export function CategoryLineNew({
  categoryKey,
  categoryId,
  isHidden,
  strokeDasharray,
  getCategoryColor,
  getCategoryName,
  onToggle,
}: CategoryLineProps) {
  if (isHidden) {
    return null;
  }

  const categoryColor = getCategoryColor(categoryId);
  const isDashed = strokeDasharray === "4 4";

  const renderDot = (props: { cx?: number; cy?: number; payload?: any }) => {
    const { cx, cy, payload } = props;

    if (!payload) {
      return (
        <circle cx={cx} cy={cy} r={0} className="stroke-2 cursor-pointer" />
      );
    }

    const value = payload.originalValues?.[categoryKey];

    if (value === null || value === undefined || isNaN(value)) {
      return (
        <circle cx={cx} cy={cy} r={0} className="stroke-2 cursor-pointer" />
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        className="stroke-2 cursor-pointer"
        style={{
          fill: categoryColor,
          stroke: categoryColor,
        }}
        cursor="pointer"
        onClick={() => onToggle(categoryId)}
      />
    );
  };

  const renderActiveDot = (props: {
    cx?: number;
    cy?: number;
    payload?: any;
  }) => {
    const { cx, cy, payload } = props;

    if (!payload) {
      return (
        <circle cx={cx} cy={cy} r={0} className="stroke-2 cursor-pointer" />
      );
    }

    const value = payload.originalValues?.[categoryKey];

    if (value === null || value === undefined || isNaN(value)) {
      return (
        <circle cx={cx} cy={cy} r={0} className="stroke-2 cursor-pointer" />
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        className="stroke-2 cursor-pointer"
        style={{
          fill: categoryColor,
          stroke: categoryColor,
        }}
        cursor="pointer"
        onClick={() => onToggle(categoryId)}
      />
    );
  };

  return (
    <ChartLine
      dataKey={categoryKey}
      color={categoryColor}
      name={getCategoryName(categoryId)}
      isHidden={isHidden}
      isDashed={isDashed}
      strokeWidth={2}
      dot={isMobile ? false : renderDot}
      activeDot={isMobile ? false : renderActiveDot}
    />
  );
}

