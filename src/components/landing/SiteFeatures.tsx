import {
  Building2,
  Landmark,
  TrendingUpDown,
  type LucideIcon,
} from "lucide-react";
import { Text } from "@/components/ui/text";

interface Feature {
  icon: LucideIcon;
  iconBgColor: string;
  iconSize: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Building2,
    iconBgColor: "bg-[#5da4de]",
    iconSize: "h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4",
    title: "Company Rankings",
    description:
      "Compare emissions performance, reduction targets, and sustainability metrics across Swedish companies.",
  },
  {
    icon: Landmark,
    iconBgColor: "bg-[#a7e340]",
    iconSize: "h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4",
    title: "Municipality Rankings",
    description:
      "Track climate progress and emissions data from municipalities and local governments.",
  },
  {
    icon: TrendingUpDown,
    iconBgColor: "bg-[#f28b3d]",
    iconSize: "h-[15px] w-[15px] md:h-[60px] md:w-[60px] md:p-4",
    title: "Progress Tracking",
    description:
      "Monitor year-over-year changes and alignment with climate targets and science based goals.",
  },
];

const SiteFeatures = () => {
  return (
    <div className="flex flex-col w-full mt-32">
      <div className="mb-8 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-2 md:mb-4">
          Comprehensive Climate Tracking
        </h2>
        <Text className="col-span-full text-md text-grey text-center">
          Monitor emissions data and climate commitments across Sweden.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 self-center mx-2 sm:mx-8 w-full">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex flex-col bg-black-2 rounded-level-2 h-48 md:min-h-64 p-4 items-center justify-center"
            >
              <span
                className={`${feature.iconBgColor} w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-4`}
              >
                <Icon className={`absolute ${feature.iconSize}`} />
              </span>
              <div className="flex flex-col items-center">
                <h2 className="tracking-tight font-light text-2xl md:text-4xl text-center">
                  {feature.title}
                </h2>
                <Text className="col-span-full text-md text-grey text-center">
                  {feature.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteFeatures;
