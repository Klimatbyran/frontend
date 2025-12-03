import { useState } from "react";
import { type LucideIcon } from "lucide-react";
import { Text } from "@/components/ui/text";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";

// Helper function to get muted background color from border color
function getMutedBackgroundColor(borderColor: string): string {
  // Extract color name and shade from borderColor (e.g., "border-green-3" -> "green", "3")
  const colorMatch = borderColor.match(/border-(green|blue|orange|pink)-(\d)/);
  if (colorMatch) {
    const [, colorName, shade] = colorMatch;
    const colorMap: Record<string, Record<string, string>> = {
      green: {
        "3": "rgba(170, 229, 6, 0.2)", // green-3 with 10% opacity
      },
      blue: {
        "3": "rgba(89, 160, 225, 0.2)",
      },
      orange: {
        "3": "rgba(244, 143, 42, 0.2)",
      },
      pink: {
        "3": "rgba(240, 117, 154, 0.2)",
      },
    };
    return colorMap[colorName]?.[shade] || "rgba(0, 0, 0, 0.2)";
  }
  return "rgba(0, 0, 0, 0.1)";
}

interface FlipCardProps {
  icon: LucideIcon;
  teaser: string;
  headline: string;
  description: string;
  iconBgColor: string;
  borderColor: string;
}

export function FlipCard({
  icon: Icon,
  teaser,
  headline,
  description,
  iconBgColor,
  borderColor,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isMobile } = useScreenSize();

  const handleInteraction = () => {
    if (isMobile) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className="perspective-[1000px] min-h-[180px] md:min-h-[200px]"
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      onClick={handleInteraction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleInteraction();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? "Hide details" : "Show details"}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 ease-in-out",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 bg-black-2 rounded-level-2 p-4 md:p-6 border-2 flex flex-col",
            borderColor,
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div
              className={cn(
                iconBgColor,
                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4",
              )}
            >
              <Icon
                className="h-4 w-4 md:h-6 md:w-6 text-black"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight mb-2 md:mb-3">
              {headline}
            </h3>
            <Text className="text-sm md:text-base text-grey mb-auto">
              {teaser}
            </Text>
          </div>
          <div className="flex justify-end">
            <Text className="text-xs md:text-sm text-grey opacity-70">
              {isMobile ? "Tap to learn more →" : "Hover to learn more →"}
            </Text>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 rounded-level-2 p-4 md:p-6 border-2",
            borderColor,
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: getMutedBackgroundColor(borderColor),
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon
              className="h-8 w-8 md:h-12 md:w-12 text-white mb-4 md:mb-6"
              strokeWidth={1.5}
            />
            <Text className="text-sm md:text-base text-white leading-relaxed max-w-md">
              {description}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
