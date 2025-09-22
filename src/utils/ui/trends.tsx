import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Get the appropriate CSS class for trend method badges
 */
export const getMethodColor = (method: string) => {
  const colorMap: Record<string, string> = {
    weightedLinear: "bg-blue-4 text-white",
    linear: "bg-green-4 text-white",
    exponential: "bg-pink-2 text-black",
    weightedExponential: "bg-orange-4 text-white",
    recentExponential: "bg-blue-2 text-black",
    simple: "bg-grey text-white",
    none: "bg-gray-400 text-white",
  };
  return colorMap[method] || "bg-grey text-white";
};

/**
 * Get the appropriate icon for trend direction
 */
export const getTrendIcon = (direction: string) => {
  const iconMap: Record<string, JSX.Element> = {
    increasing: <TrendingUp className="w-4 h-4 text-pink-3" />,
    decreasing: <TrendingDown className="w-4 h-4 text-green-3" />,
    stable: <Minus className="w-4 h-4 text-gray-500" />,
  };
  return iconMap[direction] || <Minus className="w-4 h-4 text-gray-500" />;
};
