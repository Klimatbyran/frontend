import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactElement } from "react";

/**
 * Get the appropriate icon for trend direction
 */
export const getTrendIcon = (direction: string) => {
  const iconMap: Record<string, ReactElement> = {
    increasing: <TrendingUp className="w-4 h-4 text-pink-3" />,
    decreasing: <TrendingDown className="w-4 h-4 text-green-3" />,
    stable: <Minus className="w-4 h-4 text-gray-500" />,
  };
  return iconMap[direction] || <Minus className="w-4 h-4 text-gray-500" />;
};
