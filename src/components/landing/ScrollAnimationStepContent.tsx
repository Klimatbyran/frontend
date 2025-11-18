import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ScrollAnimationStepContentProps {
  badge: {
    text: string;
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
  };
  heading: string | ReactNode;
  paragraph: string;
  image: {
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
  };
  imagePosition?: "left" | "right";
}

export function ScrollAnimationStepContent({
  badge,
  heading,
  paragraph,
  image,
  imagePosition = "right",
}: ScrollAnimationStepContentProps) {
  const BadgeIcon = badge.icon;
  const ImageIcon = image.icon;

  const textOrder = imagePosition === "left" ? "order-2 lg:order-1" : "";
  const imageOrder = imagePosition === "left" ? "order-1 lg:order-2" : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className={`space-y-6 ${textOrder}`}>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-gradient-to-r ${badge.gradientFrom} ${badge.gradientTo} ${badge.borderColor}`}
        >
          <BadgeIcon className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">{badge.text}</span>
        </div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
          {heading}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          {paragraph}
        </p>
      </div>
      <div className={`flex items-center justify-center ${imageOrder}`}>
        <div
          className={`w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br ${image.gradientFrom} ${image.gradientTo} flex items-center justify-center`}
        >
          {/* Image placeholder - will be replaced with actual imagery */}
          <ImageIcon className="w-32 h-32 text-white/20" />
        </div>
      </div>
    </div>
  );
}
