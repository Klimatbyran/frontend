import { useTranslation } from "react-i18next";
import { NationIntroVisual } from "@/components/nation/story/NationIntroPunch";
import { useNationStoryData } from "@/hooks/nation/useNationStoryData";
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

export const CountriesSection = () => {
  const { t } = useTranslation();
  const { metrics, loading } = useNationStoryData();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className={LANDING_SECTION_ROW_CLASS}>
          <div
            className={cn(
              "order-1 flex flex-col gap-24 lg:pt-4",
              LANDING_TEXT_COLUMN_CLASS,
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-4 text-left md:text-center landing-laptop:text-left",
                LANDING_TEXT_BLOCK_MAX_CLASS,
              )}
            >
              <Text className={LANDING_SECTION_TITLE_CLASS}>
                {t("landingPage.countriesSection.title")}
              </Text>
              <Text className={LANDING_SECTION_BODY_CLASS}>
                {t("landingPage.countriesSection.description")}
              </Text>
            </div>

            <LocalizedLink
              to="/valet-2026"
              className="hidden landing-laptop:flex lg:flex self-end w-fit md:pt-2"
            >
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
                  {t("landingPage.countriesSection.exploreButton")}
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </span>
              </Button>
            </LocalizedLink>
          </div>

          <div
            className={cn(
              "order-2 flex min-h-[320px] items-center justify-center landing-laptop:min-h-[420px]",
              LANDING_VISUAL_COLUMN_CLASS,
            )}
          >
            {loading ? (
              <div className="h-[min(420px,60vh)] w-full animate-pulse rounded-level-2 bg-black-2" />
            ) : !metrics ? (
              <Text className="text-grey">{t("detailPage.graph.noData")}</Text>
            ) : (
              <NationIntroVisual metrics={metrics} />
            )}
          </div>

          <LocalizedLink
            to="/valet-2026"
            className="order-3 self-start w-fit landing-laptop:hidden lg:hidden"
          >
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
                {t("landingPage.countriesSection.exploreButton")}
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </span>
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};
