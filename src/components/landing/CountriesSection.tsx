import { useTranslation } from "react-i18next";
import { NationStackedAreaChart } from "@/components/nation/NationStackedAreaChart";
import { useNationStoryData } from "@/hooks/nation/useNationStoryData";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LANDING_CHART_PANEL_HEIGHT_CLASS,
  LANDING_SECTION_BODY_CLASS,
  LANDING_SECTION_TITLE_CLASS,
  LANDING_TEXT_BLOCK_MAX_CLASS,
} from "@/lib/constants/landingPage";

export const CountriesSection = () => {
  const { t } = useTranslation();
  const { metrics, loading } = useNationStoryData();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52">
      <div className="w-full container max-w-7xl mx-auto px-4 items-center flex flex-col gap-8">
        <div
          className={cn(
            "flex flex-col gap-4 text-left md:self-center md:text-center",
            LANDING_TEXT_BLOCK_MAX_CLASS,
            "self-start",
          )}
        >
          <Text className={LANDING_SECTION_TITLE_CLASS}>
            {t("landingPage.countriesSection.title")}
          </Text>
          <Text className={LANDING_SECTION_BODY_CLASS}>
            {t("landingPage.countriesSection.description")}
          </Text>
        </div>
        <div className={LANDING_CHART_PANEL_HEIGHT_CLASS}>
          {loading ? (
            <div className="h-full w-full animate-pulse bg-black-2 rounded-level-2" />
          ) : !metrics?.stackData.length ? (
            <Text className="text-grey">{t("detailPage.graph.noData")}</Text>
          ) : (
            <NationStackedAreaChart data={metrics.stackData} />
          )}
        </div>

        <div className="w-full flex justify-start md:justify-end">
          <LocalizedLink to="/nation" className="w-fit md:pt-2">
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
      </div>
    </div>
  );
};
