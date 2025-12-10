import { useState } from "react";
import { type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  icon: LucideIcon;
  teaser: string;
  headline: string;
  description: string;
  iconBgColor: string;
  borderColor: string;
  backBgColor: string;
}

export function FlipCard({
  icon: Icon,
  teaser,
  headline,
  description,
  iconBgColor,
  borderColor,
  backBgColor,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();

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
      aria-label={
        isFlipped
          ? t("landingPage.didYouKnow.ariaLabelHide")
          : t("landingPage.didYouKnow.ariaLabelShow")
      }
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 ease-in-out",
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
              {isMobile
                ? t("landingPage.didYouKnow.cardActionMobile")
                : t("landingPage.didYouKnow.cardActionDesktop")}
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
            backgroundColor: backBgColor,
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
