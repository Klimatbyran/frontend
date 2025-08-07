import { Line } from "recharts";

interface CategoryLineProps {
  categoryKey: string;
  categoryId: number;
  isHidden: boolean;
  strokeDasharray: string;
  getCategoryColor: (id: number) => string;
  getCategoryName: (id: number) => string;
  onToggle: (categoryId: number) => void;
}

export function CategoryLine({
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

  // Shared dot rendering logic
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

  // Shared active dot rendering logic
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
    <Line
      type="monotone"
      dataKey={categoryKey}
      stroke={categoryColor}
      strokeWidth={2}
      strokeDasharray={strokeDasharray}
      dot={renderDot}
      activeDot={renderActiveDot}
      name={getCategoryName(categoryId)}
    />
  );
}
