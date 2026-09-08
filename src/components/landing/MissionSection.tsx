import { useTranslation } from "react-i18next";
import KlimatkollenVideo from "@/components/ui/klimatkollenVideoPlayer";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LANDING_SECTION_BODY_CLASS,
  LANDING_SECTION_ROW_CLASS,
  LANDING_SECTION_TITLE_CLASS,
  LANDING_TEXT_BLOCK_MAX_CLASS,
  LANDING_TEXT_COLUMN_CLASS,
  LANDING_VISUAL_COLUMN_CLASS,
} from "@/lib/constants/landingPage";

export const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className={LANDING_SECTION_ROW_CLASS}>
          <div
            className={cn(
              "flex flex-col gap-24 lg:pt-4",
              LANDING_TEXT_COLUMN_CLASS,
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-4 text-left",
                LANDING_TEXT_BLOCK_MAX_CLASS,
              )}
            >
              <Text className={LANDING_SECTION_TITLE_CLASS}>
                {t("landingPage.missionSection.title")}
              </Text>
              <Text className={LANDING_SECTION_BODY_CLASS}>
                {t("landingPage.aboutUsContent")}
              </Text>
            </div>

            <div className="hidden w-full landing-laptop:flex lg:flex lg:justify-end">
              <LocalizedLink to="/about" className="w-fit md:pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative w-auto h-12 rounded-md overflow-hidden font-medium hover:opacity-100 active:opacity-100"
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

          <div className={LANDING_VISUAL_COLUMN_CLASS}>
            <KlimatkollenVideo />

            <div className="mt-8 flex w-full justify-start landing-laptop:hidden lg:hidden">
              <LocalizedLink to="/about" className="w-fit">
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative w-auto h-12 rounded-md overflow-hidden font-medium hover:opacity-100 active:opacity-100"
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
