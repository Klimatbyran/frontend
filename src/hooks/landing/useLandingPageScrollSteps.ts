import { useTranslation } from "react-i18next";
import {
  Target,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  LucideIcon,
  Globe2,
  Activity,
  Shield,
  Zap,
  Sun,
  ArrowUpRight,
  Sparkles,
  FileText,
  Brain,
  Database,
  ArrowRight,
  MapPin,
} from "lucide-react";

export interface AnimatedIcon {
  icon: LucideIcon;
  color?: string;
  size?: "sm" | "md" | "lg";
  animation?: {
    type?: "fade" | "slide" | "scale" | "rotate" | "pulse";
    delay?: number;
    duration?: number;
  };
}

export interface ImageContent {
  // Legacy support - single icon with gradient
  icon?: LucideIcon;

  // New structure - animated icons
  animatedIcons?: {
    // Icons positioned on the left (input side)
    left?: AnimatedIcon[];
    // Central/main icon
    center?: AnimatedIcon;
    // Icons positioned on the right (output side)
    right?: AnimatedIcon[];
  };

  // Optional text content
  mainText?: string;
  subText?: string;

  // Background styling (used for both legacy and new structure)
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface ScrollStepData {
  id: string;
  badge: {
    text: string;
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
  };
  heading: string;
  paragraph: string;
  image: ImageContent;
  imagePosition?: "left" | "right";
}

export function useLandingPageScrollSteps(): ScrollStepData[] {
  const { t } = useTranslation();

  const stepData: ScrollStepData[] = [
    {
      id: "mission",
      badge: {
        text: t("landingPage.scrollSteps.mission.badge"),
        icon: Target,
        gradientFrom: "from-blue-3",
        gradientTo: "to-blue-4",
        borderColor: "border-blue-3/30",
      },
      heading: t("landingPage.scrollSteps.mission.heading"),
      paragraph: t("landingPage.scrollSteps.mission.paragraph"),
      image: {
        animatedIcons: {
          left: [
            {
              icon: BarChart3,
              size: "md",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.1, duration: 0.6 },
            },
            {
              icon: Globe2,
              size: "md",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.2, duration: 0.6 },
            },
            {
              icon: Activity,
              size: "md",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.3, duration: 0.6 },
            },
          ],
          center: {
            icon: Target,
            size: "lg",
            color: "text-gray-300",
            animation: { type: "scale", delay: 0.4, duration: 0.8 },
          },
          right: [
            {
              icon: Users,
              size: "md",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.5, duration: 0.6 },
            },
            {
              icon: Shield,
              size: "md",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.6, duration: 0.6 },
            },
            {
              icon: Zap,
              size: "md",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.7, duration: 0.6 },
            },
          ],
        },
        mainText: "Data → Action",
        subText: "Transforming Information",
        gradientFrom: "from-teal-800",
        gradientTo: "to-teal-900",
      },
      imagePosition: "right",
    },
    {
      id: "transparency",
      badge: {
        text: t("landingPage.scrollSteps.transparency.badge"),
        icon: Eye,
        gradientFrom: "from-green-3",
        gradientTo: "to-green-4",
        borderColor: "border-green-3/30",
      },
      heading: t("landingPage.scrollSteps.transparency.heading"),
      paragraph: t("landingPage.scrollSteps.transparency.paragraph"),
      image: {
        animatedIcons: {
          center: {
            icon: Sun,
            size: "lg",
            color: "text-yellow-400",
            animation: { type: "pulse", delay: 0.2, duration: 2 },
          },
        },
        mainText: "Sunlight Transparency",
        subText: "Illuminating Hidden Data",
        gradientFrom: "from-green-800",
        gradientTo: "to-green-900",
      },
      imagePosition: "left",
    },
    {
      id: "methodology",
      badge: {
        text: t("landingPage.scrollSteps.methodology.badge"),
        icon: BarChart3,
        gradientFrom: "from-blue-3",
        gradientTo: "to-green-3",
        borderColor: "border-blue-3/30",
      },
      heading: t("landingPage.scrollSteps.methodology.heading"),
      paragraph: t("landingPage.scrollSteps.methodology.paragraph"),
      image: {
        animatedIcons: {
          left: [
            {
              icon: FileText,
              size: "sm",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.1, duration: 0.6 },
            },
            {
              icon: Database,
              size: "sm",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.2, duration: 0.6 },
            },
            {
              icon: FileText,
              size: "sm",
              color: "text-blue-300",
              animation: { type: "fade", delay: 0.3, duration: 0.6 },
            },
          ],
          center: {
            icon: Brain,
            size: "lg",
            color: "text-white",
            animation: { type: "pulse", delay: 0.4, duration: 2 },
          },
          right: [
            {
              icon: BarChart3,
              size: "sm",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.5, duration: 0.6 },
            },
            {
              icon: TrendingUp,
              size: "sm",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.6, duration: 0.6 },
            },
            {
              icon: Target,
              size: "sm",
              color: "text-green-400",
              animation: { type: "fade", delay: 0.7, duration: 0.6 },
            },
          ],
        },
        mainText: "AI-Powered Processing",
        subText: "Raw Data → Smart Insights",
        gradientFrom: "from-blue-800",
        gradientTo: "to-green-800",
      },
      imagePosition: "right",
    },
    {
      id: "impact",
      badge: {
        text: t("landingPage.scrollSteps.impact.badge"),
        icon: TrendingUp,
        gradientFrom: "from-pink-3",
        gradientTo: "to-pink-4",
        borderColor: "border-pink-3/30",
      },
      heading: t("landingPage.scrollSteps.impact.heading"),
      paragraph: t("landingPage.scrollSteps.impact.paragraph"),
      image: {
        animatedIcons: {
          center: {
            icon: TrendingUp,
            size: "lg",
            color: "text-pink-300",
            animation: { type: "scale", delay: 0.2, duration: 0.8 },
          },
          left: [
            {
              icon: BarChart3,
              size: "sm",
              color: "text-pink-400/70",
              animation: { type: "fade", delay: 0.3, duration: 0.6 },
            },
            {
              icon: Activity,
              size: "sm",
              color: "text-pink-400/70",
              animation: { type: "fade", delay: 0.4, duration: 0.6 },
            },
          ],
          right: [
            {
              icon: Sparkles,
              size: "sm",
              color: "text-pink-400",
              animation: { type: "fade", delay: 0.5, duration: 0.6 },
            },
            {
              icon: ArrowUpRight,
              size: "sm",
              color: "text-pink-400",
              animation: { type: "fade", delay: 0.6, duration: 0.6 },
            },
          ],
        },
        mainText: "Accelerating Change",
        subText: "From Slow to Fast Action",
        gradientFrom: "from-pink-800",
        gradientTo: "to-pink-900",
      },
      imagePosition: "left",
    },
    {
      id: "engagement",
      badge: {
        text: t("landingPage.scrollSteps.engagement.badge"),
        icon: Users,
        gradientFrom: "from-orange-3",
        gradientTo: "to-orange-5",
        borderColor: "border-orange-3/30",
      },
      heading: t("landingPage.scrollSteps.engagement.heading"),
      paragraph: t("landingPage.scrollSteps.engagement.paragraph"),
      image: {
        animatedIcons: {
          center: {
            icon: Users,
            size: "lg",
            color: "text-white",
            animation: { type: "scale", delay: 0.2, duration: 0.8 },
          },
        },
        mainText: "Citizen Impact",
        subText: "Ripples of Change",
        gradientFrom: "from-orange-800",
        gradientTo: "to-orange-900",
      },
      imagePosition: "right",
    },
    {
      id: "path-forward",
      badge: {
        text: t("landingPage.scrollSteps.pathForward.badge"),
        icon: Compass,
        gradientFrom: "from-green-4",
        gradientTo: "to-blue-4",
        borderColor: "border-green-4/30",
      },
      heading: t("landingPage.scrollSteps.pathForward.heading"),
      paragraph: t("landingPage.scrollSteps.pathForward.paragraph"),
      image: {
        animatedIcons: {
          left: [
            {
              icon: MapPin,
              size: "sm",
              color: "text-green-300",
              animation: { type: "fade", delay: 0.1, duration: 0.6 },
            },
          ],
          center: {
            icon: Compass,
            size: "lg",
            color: "text-white",
            animation: { type: "rotate", delay: 0.3, duration: 1.2 },
          },
          right: [
            {
              icon: ArrowRight,
              size: "md",
              color: "text-blue-400",
              animation: { type: "slide", delay: 0.5, duration: 0.8 },
            },
            {
              icon: Target,
              size: "sm",
              color: "text-blue-400",
              animation: { type: "fade", delay: 0.6, duration: 0.6 },
            },
          ],
        },
        mainText: "Guiding Direction",
        subText: "Toward Sustainability",
        gradientFrom: "from-green-800",
        gradientTo: "to-blue-800",
      },
      imagePosition: "left",
    },
  ];

  return stepData;
}
