import { Text } from "@/components/ui/text";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useTranslation } from "react-i18next";

type RelatableNumbersProps = {
  totalEmissions: number;
  currentLanguage: "sv" | "en";
};

const RelatableNumbers = ({
  totalEmissions,
  currentLanguage,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-black-2 rounded-level-1 p-16">
      <Text variant={"h3"}>From Tons to T-Shirts: Relatable Numbers</Text>
      <Text
        variant="body"
        className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
      >
        The current total emission of{" "}
        <span className="text-orange-2">
          
          {formatEmissionsAbsolute(totalEmissions, currentLanguage)}
        </span>
        <span className="text-sm md:text-base lg:text-lg ml-2 text-grey">
          {t(totalEmissions ? "emissionsUnit" : " ")}
        </span>{" "}
        compares to the following:
      </Text>
    </div>
  );
};

export default RelatableNumbers;
