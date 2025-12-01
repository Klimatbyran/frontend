import { Building2, Landmark, TrendingUpDown } from "lucide-react";
import { Text } from "@/components/ui/text";

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
        <div className="flex flex-col bg-black-2 rounded-level-2 h-48 md:min-h-64 p-4 items-center justify-center">
          <span className="bg-[#5da4de] w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-4">
            <Building2 className="absolute h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4" />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="tracking-tight font-light text-2xl md:text-4xl text-center">
              Company Rankings
            </h2>
            <Text className="col-span-full text-md text-grey text-center">
              Compare emissions performance, reduction targets, and
              sustainability metrics across Swedish companies.
            </Text>
          </div>
        </div>
        <div className="flex flex-col bg-black-2 rounded-level-2 h-48 md:min-h-64 p-4 items-center justify-center">
          <span className="bg-[#a7e340] w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-4">
            <Landmark className="h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4" />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="tracking-tight font-light text-center text-2xl md:text-4xl">
              Municipality Rankings
            </h2>
            <Text className="col-span-full text-md text-grey text-center">
              Track climate progress and emissions data from municipalities and
              local governments.
            </Text>
          </div>
        </div>
        <div className="flex flex-col bg-black-2 rounded-level-2 h-48 md:min-h-64 p-4 items-center justify-center">
          <span className="bg-[#f28b3d] w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-4">
            <TrendingUpDown className="h-[15px] w-[15px] md:h-[60px] md:w-[60px] md:p-4" />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="tracking-tight font-light text-2xl md:text-4xl text-center">
              Progress Tracking
            </h2>
            <Text className="col-span-full text-md text-grey text-center">
              Monitor year-over-year changes and alignment with climate targets
              and science based goals.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteFeatures;
