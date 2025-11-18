// TODO: Consider breaking this out into types, and hooks rather than combine here 
import React from "react";
import {
  Target,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  LucideIcon,
} from "lucide-react";
import { ScrollAnimationStepContent } from "./ScrollAnimationStepContent";

interface ScrollStepData {
  id: string;
  badge: {
    text: string;
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
  };
  heading: string | React.ReactNode;
  paragraph: string;
  image: {
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
  };
  imagePosition?: "left" | "right";
}

const stepData: ScrollStepData[] = [
  {
    id: "mission",
    badge: {
      text: "Transparency for Climate Action",
      icon: Target,
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
      borderColor: "border-blue-500/30",
    },
    heading: "Our Mission",
    paragraph:
      "Klimatkollen exists to make climate data accessible to everyone. We believe that transparency drives accountability, and accountability drives real climate action. By putting emissions data in the hands of citizens, we empower communities to hold organizations accountable for their environmental commitments.",
    image: {
      icon: Target,
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
    },
    imagePosition: "right",
  },
  {
    id: "transparency",
    badge: {
      text: "Sunlight is the Best Disinfectant",
      icon: Eye,
      gradientFrom: "from-green-600",
      gradientTo: "to-green-800",
      borderColor: "border-green-500/30",
    },
    heading: (
      <>
        Why Data
        <br />
        Transparency Matters
      </>
    ),
    paragraph:
      "When emissions data is hidden behind corporate reports and government databases, progress stagnates. Transparent, accessible climate data creates market pressure for better performance. Companies and municipalities that know their data is public work harder to improve their rankings and meet their climate commitments.",
    image: {
      icon: Eye,
      gradientFrom: "from-green-600",
      gradientTo: "to-green-800",
    },
    imagePosition: "left",
  },
  {
    id: "methodology",
    badge: {
      text: "Science-Based Rankings",
      icon: BarChart3,
      gradientFrom: "from-teal-600",
      gradientTo: "to-green-600",
      borderColor: "border-teal-500/30",
    },
    heading: "Our Methodology",
    paragraph:
      "We use verified emissions data from official reporting sources to create fair, comparable rankings. Our metrics focus on actual emissions reductions, not just promises or targets. Every ranking is based on real performance data, ensuring that climate leaders are recognized and climate laggards are held accountable.",
    image: {
      icon: BarChart3,
      gradientFrom: "from-teal-600",
      gradientTo: "to-green-600",
    },
    imagePosition: "right",
  },
  {
    id: "impact",
    badge: {
      text: "From Data to Action",
      icon: TrendingUp,
      gradientFrom: "from-gray-600",
      gradientTo: "to-gray-800",
      borderColor: "border-gray-500/30",
    },
    heading: "Driving Real Impact",
    paragraph:
      "Our platform has already helped identify climate leaders and laggards across Sweden. By ranking organizations on their actual emissions performance, we create healthy competition that accelerates climate progress. The data doesn't lie—and neither should climate commitments.",
    image: {
      icon: TrendingUp,
      gradientFrom: "from-gray-600",
      gradientTo: "to-gray-800",
    },
    imagePosition: "left",
  },
  {
    id: "engagement",
    badge: {
      text: "Every Voice Counts",
      icon: Users,
      gradientFrom: "from-orange-600",
      gradientTo: "to-orange-800",
      borderColor: "border-orange-500/30",
    },
    heading: (
      <>
        Citizen Action &
        <br />
        Engagement
      </>
    ),
    paragraph:
      "Climate action isn't just for governments and corporations—it starts with informed citizens. When you can see how your local municipality or favorite company performs on climate metrics, you can make better choices as a consumer, voter, and community member. Your engagement drives the demand for better climate performance.",
    image: {
      icon: Users,
      gradientFrom: "from-orange-600",
      gradientTo: "to-orange-800",
    },
    imagePosition: "right",
  },
  {
    id: "path-forward",
    badge: {
      text: "Building a Climate-Conscious Society",
      icon: Compass,
      gradientFrom: "from-green-600",
      gradientTo: "to-blue-600",
      borderColor: "border-green-500/30",
    },
    heading: "The Path Forward",
    paragraph:
      "Imagine a world where every organization's climate performance is as visible as their financial results. Where citizens can easily compare the environmental impact of their choices. Where transparency drives a race to the top in climate action. That's the future we're building, one data point at a time.",
    image: {
      icon: Compass,
      gradientFrom: "from-green-600",
      gradientTo: "to-blue-600",
    },
    imagePosition: "left",
  },
];

export function getLandingPageScrollSteps() {
  return stepData.map((step) => ({
    id: step.id,
    content: (
      <ScrollAnimationStepContent
        badge={step.badge}
        heading={step.heading}
        paragraph={step.paragraph}
        image={step.image}
        imagePosition={step.imagePosition}
      />
    ),
  }));
}
