import { Line } from "recharts";
import { isMobile } from "react-device-detect";

interface ScopeLineProps {
  scope: "scope1" | "scope2" | "scope3";
  isHidden: boolean;
  onToggle: (scope: "scope1" | "scope2" | "scope3") => void;
}

const scopeConfig = {
  scope1: {
    dataKey: "scope1.value",
    stroke: "var(--pink-3)",
    name: "Scope 1",
  },
  scope2: {
    dataKey: "scope2.value",
    stroke: "var(--green-2)",
    name: "Scope 2",
  },
  scope3: {
    dataKey: "scope3.value",
    stroke: "var(--blue-2)",
    name: "Scope 3",
  },
} as const;

export function ScopeLine({ scope, isHidden, onToggle }: ScopeLineProps) {
  if (isHidden) {
    return null;
  }

  const config = scopeConfig[scope];

  return (
    <Line
      type="monotone"
      dataKey={config.dataKey}
      stroke={config.stroke}
      strokeWidth={2}
      dot={
        isMobile
          ? false
          : {
              r: 4,
              fill: config.stroke,
              cursor: "pointer",
              onClick: () => onToggle(scope),
            }
      }
      activeDot={
        isMobile
          ? false
          : {
              r: 6,
              fill: config.stroke,
              cursor: "pointer",
            }
      }
      name={config.name}
    />
  );
}
