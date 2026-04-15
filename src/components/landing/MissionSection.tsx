import { useTranslation } from "react-i18next";
import KlimatkollenVideo from "@/components/ui/klimatkollenVideoPlayer";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";

export const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-48">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <div className="w-full lg:w-2/5 flex flex-col gap-24 lg:pt-4">
            <div className="flex w-full max-w-[760px] flex-col gap-4 text-left">
              <Text className="text-3xl sm:text-4xl font-light">
                {t("landingPage.missionSection.title")}
              </Text>
              <Text className="text-grey font-regular text-[18px]">
                {t("landingPage.aboutUsContent")}
              </Text>
            </div>

            <div className="hidden w-full lg:flex lg:justify-end">
              <LocalizedLink to="/about" className="w-fit pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
                >
                  <span
                    className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                    {t("landingPage.missionSection.button")}
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </span>
                </Button>
              </LocalizedLink>
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <KlimatkollenVideo />

            <div className="mt-6 flex w-full justify-start lg:hidden">
              <LocalizedLink to="/about" className="w-fit pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
                >
                  <span
                    className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                    {t("landingPage.missionSection.button")}
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </span>
                </Button>
              </LocalizedLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
