import { useTranslation } from "react-i18next";
import {
  Target,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  LucideIcon,
} from "lucide-react";

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
  image: {
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
  };
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
        icon: Target,
        gradientFrom: "from-blue-2",
        gradientTo: "to-blue-4",
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
        icon: Eye,
        gradientFrom: "from-green-2",
        gradientTo: "to-green-4",
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
        icon: BarChart3,
        gradientFrom: "from-blue-3",
        gradientTo: "to-green-3",
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
        icon: TrendingUp,
        gradientFrom: "from-pink-2",
        gradientTo: "to-pink-4",
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
        icon: Users,
        gradientFrom: "from-orange-3",
        gradientTo: "to-orange-5",
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
        icon: Compass,
        gradientFrom: "from-green-4",
        gradientTo: "to-blue-4",
      },
      imagePosition: "left",
    },
  ];

  return stepData;
}
