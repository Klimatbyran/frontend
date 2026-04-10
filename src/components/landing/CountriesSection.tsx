import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";

export const CountriesSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black w-full flex flex-col items-center min-h-screen py-48">
      <div className="w-full container mx-auto px-4 items-center flex flex-col gap-8">
        <div className="flex flex-col gap-4 text-center max-w-[600px]">
          <Text className="text-4xl font-light">
            {t("landingPage.countriesSection.title")}
          </Text>
          <Text className="text-grey font-regular text-[18px]">
            {t("landingPage.countriesSection.description")}
          </Text>
        </div>
      </div>
    </div>
  );
};
