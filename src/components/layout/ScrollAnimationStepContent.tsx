import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  AnimatedIcon,
  ImageContent,
} from "@/hooks/landing/useLandingPageScrollSteps";

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
  image: ImageContent;
  imagePosition?: "left" | "right";
}

// Animation variants for icons
const getAnimationVariants = (animation?: AnimatedIcon["animation"]) => {
  const type = animation?.type || "fade";
  const delay = animation?.delay || 0;
  const duration = animation?.duration || 0.5;

  const baseVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration, delay },
    },
  };

  switch (type) {
    case "slide":
      return {
        initial: { opacity: 0, x: -20 },
        animate: {
          opacity: 1,
          x: 0,
          transition: { duration, delay },
        },
      };
    case "scale":
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { duration, delay },
        },
      };
    case "rotate":
      return {
        initial: { opacity: 0, rotate: -15 },
        animate: {
          opacity: 1,
          rotate: [0, 15, -15, 0],
          transition: {
            duration: duration * 2,
            delay,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          },
        },
      };
    case "pulse":
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: {
          opacity: 1,
          scale: [0.8, 1.1, 1],
          transition: {
            duration,
            delay,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 1.5,
          },
        },
      };
    default: // fade
      return baseVariants;
  }
};

// Component to render a single animated icon
function AnimatedIconComponent({ iconData }: { iconData: AnimatedIcon }) {
  const Icon = iconData.icon;
  const size = iconData.size || "md";
  const color = iconData.color || "text-white";
  const variants = getAnimationVariants(iconData.animation);

  const sizeClasses = {
    sm: "w-8 h-8 md:w-10 md:h-10",
    md: "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20",
    lg: "w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32",
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className="flex items-center justify-center"
    >
      <Icon className={`${sizeClasses[size]} ${color}`} />
    </motion.div>
  );
}

// Component to render the image content
function ImageContentRenderer({ image }: { image: ImageContent }) {
  // Legacy support: single icon with gradient
  if (image.icon && !image.animatedIcons) {
    const ImageIcon = image.icon;
    const gradientFrom = image.gradientFrom || "from-gray-800";
    const gradientTo = image.gradientTo || "to-gray-900";

    return (
      <div
        className={`w-full max-w-[200px] md:max-w-sm lg:max-w-md aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}
      >
        <ImageIcon className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 text-white/20" />
      </div>
    );
  }

  // New structure: animated icons with optional text
  if (image.animatedIcons) {
    const { left, center, right } = image.animatedIcons;
    const gradientFrom = image.gradientFrom || "from-gray-800";
    const gradientTo = image.gradientTo || "to-gray-900";
    const backgroundColor = image.backgroundColor || "";
    const hasLeftRight =
      (left && left.length > 0) || (right && right.length > 0);
    const isCenterOnly = center && !hasLeftRight;

    return (
      <div
        className={`w-full max-w-[300px] md:max-w-md lg:max-w-lg aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} ${backgroundColor} flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden`}
      >
        {/* Connecting lines from left to center to right */}
        {hasLeftRight && center && (
          <>
            {/* Lines from left icons to center */}
            {left && left.length > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center pointer-events-none">
                <div className="w-full h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
              </div>
            )}
            {/* Lines from center to right icons */}
            {right && right.length > 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center justify-end pointer-events-none">
                <div className="w-full h-px bg-gradient-to-l from-white/30 via-white/10 to-transparent" />
              </div>
            )}
          </>
        )}

        {/* Left side icons */}
        {left && left.length > 0 && (
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 md:gap-4 z-10">
            {left.map((iconData, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: iconData.animation?.delay || 0,
                  duration: iconData.animation?.duration || 0.5,
                }}
                className="bg-white/10 rounded-lg p-2 md:p-3 backdrop-blur-sm border border-white/20"
              >
                <AnimatedIconComponent iconData={iconData} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Center icon */}
        {center && (
          <div
            className={`flex items-center justify-center ${isCenterOnly ? "mb-4 md:mb-6" : "z-10"} relative`}
          >
            {/* Ripple effect for center-only icons (like citizen engagement) */}
            {isCenterOnly && (
              <>
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.4, 1.8],
                    }}
                    transition={{
                      duration: 3,
                      delay: index * 0.8,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  >
                    <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-2 border-white/20" />
                  </motion.div>
                ))}
              </>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: center.animation?.delay || 0,
                duration: center.animation?.duration || 0.8,
              }}
              className={`${hasLeftRight ? "bg-white/20" : "bg-white/20"} rounded-full p-4 md:p-6 lg:p-8 backdrop-blur-sm ${hasLeftRight ? "border-2 border-white/30" : ""} relative z-10`}
            >
              <AnimatedIconComponent iconData={center} />
            </motion.div>
          </div>
        )}

        {/* Right side icons */}
        {right && right.length > 0 && (
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 md:gap-4 z-10">
            {right.map((iconData, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: iconData.animation?.delay || 0,
                  duration: iconData.animation?.duration || 0.5,
                }}
                className="bg-white/10 rounded-lg p-2 md:p-3 backdrop-blur-sm border border-white/20"
              >
                <AnimatedIconComponent iconData={iconData} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Optional text content */}
        {(image.mainText || image.subText) && (
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center space-y-1 md:space-y-2 z-10">
            {image.mainText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white text-lg md:text-xl lg:text-2xl font-bold"
              >
                {image.mainText}
              </motion.div>
            )}
            {image.subText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/80 text-xs md:text-sm lg:text-base font-light"
              >
                {image.subText}
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback: empty container
  return (
    <div className="w-full max-w-[200px] md:max-w-sm lg:max-w-md aspect-square rounded-xl md:rounded-2xl bg-gray-800 flex items-center justify-center">
      <div className="text-white/20 text-sm">Image placeholder</div>
    </div>
  );
}

export function ScrollAnimationStepContent({
  badge,
  heading,
  paragraph,
  image,
  imagePosition = "right",
}: ScrollAnimationStepContentProps) {
  const BadgeIcon = badge.icon;

  const textOrder = imagePosition === "left" ? "order-2 lg:order-1" : "";
  const imageOrder = imagePosition === "left" ? "order-1 lg:order-2" : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-center">
      <div className={`space-y-3 md:space-y-4 lg:space-y-6 ${textOrder}`}>
        <div
          className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border bg-gradient-to-r ${badge.gradientFrom} ${badge.gradientTo} ${badge.borderColor}`}
        >
          <BadgeIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
          <span className="text-xs md:text-sm font-medium text-white">
            {badge.text}
          </span>
        </div>
        <h2 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light text-white leading-tight">
          {heading}
        </h2>
        <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 leading-relaxed">
          {paragraph}
        </p>
      </div>
      <div className={`flex items-center justify-center ${imageOrder}`}>
        <ImageContentRenderer image={image} />
      </div>
    </div>
  );
}
