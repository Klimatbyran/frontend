import { isMobile } from "react-device-detect";
import { ChartLine, CommonLineStyles } from "@/components/charts";

interface ScopeLineProps {
  scope: "scope1" | "scope2" | "scope3";
  isHidden: boolean;
  onToggle: (scope: "scope1" | "scope2" | "scope3") => void;
}

const scopeConfig = {
  scope1: {
    dataKey: "scope1.value",
    name: "Scope 1",
  },
  scope2: {
    dataKey: "scope2.value",
    name: "Scope 2",
  },
  scope3: {
    dataKey: "scope3.value",
    name: "Scope 3",
  },
} as const;

export function ScopeLineNew({ scope, isHidden, onToggle }: ScopeLineProps) {
  if (isHidden) {
    return null;
  }

  const config = scopeConfig[scope];

  // Use the appropriate CommonLineStyles based on scope
  const lineStyle =
    scope === "scope1"
      ? CommonLineStyles.scope1(config.dataKey, config.name)
      : scope === "scope2"
        ? CommonLineStyles.scope2(config.dataKey, config.name)
        : CommonLineStyles.scope3(config.dataKey, config.name);

  return (
    <ChartLine
      {...lineStyle}
      isHidden={isHidden}
      onToggle={() => onToggle(scope)}
      dot={
        isMobile
          ? false
          : {
              r: 4,
              fill: lineStyle.color,
              cursor: "pointer",
              onClick: () => onToggle(scope),
            }
      }
      activeDot={
        isMobile
          ? false
          : {
              r: 6,
              fill: lineStyle.color,
              cursor: "pointer",
            }
      }
    />
  );
}

