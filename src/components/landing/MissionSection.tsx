import { useTranslation } from "react-i18next";
import KlimatkollenVideo from "@/components/ui/klimatkollenVideoPlayer";
import { Text } from "../ui/text";

export const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-24 md:pt-32">
      <div className="w-full container mx-auto px-4 items-center flex flex-col gap-8">
        <div className="flex flex-col gap-4 text-center max-w-[760px]">
          <Text className="text-4xl font-light">
            {t("landingPage.missionSection.title")}
          </Text>
          <Text className="text-grey font-regular text-[18px]">
            {t("landingPage.aboutUsContent")}
          </Text>
        </div>

        <div className="w-full max-w-5xl">
          <KlimatkollenVideo />
        </div>
      </div>
    </div>
  );
};
