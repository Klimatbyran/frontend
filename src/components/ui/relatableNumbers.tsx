import { Text } from "@/components/ui/text";
import {
  emissionsToForestFire,
  emissionsComparedToSweden,
} from "@/utils/calculations/relatableNumbersCalc";
import {
  formatEmissionsAbsolute,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useTranslation } from "react-i18next";
import { ReportingPeriod } from "@/types/company";

type RelatableNumbersProps = {
  selectedPeriod: ReportingPeriod;
  currentLanguage: "sv" | "en";
};

const RelatableNumbers = ({
  selectedPeriod,
  currentLanguage,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();

  const validTotalEmissions =
    selectedPeriod.emissions?.calculatedTotalEmissions || null;

  const areaTreesBurnt = emissionsToForestFire(validTotalEmissions);
  const areaTreesBurntFormatted = localizeUnit(areaTreesBurnt, currentLanguage);

  const swedenEmissionDifference = Math.round(
    emissionsComparedToSweden(validTotalEmissions),
  );

  return (
    validTotalEmissions !== null && (
      <div className="bg-black-2 rounded-level-1 p-16">
        <Text variant={"h3"}>{t("relatableNumbers.title")}</Text>
        <Text
          variant="body"
          className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
        >
          {t("relatableNumbers.descriptionPartOne")}{" "}
          <span className="text-orange-2">
            {formatEmissionsAbsolute(validTotalEmissions, currentLanguage)}
          </span>
          <span className="text-sm md:text-base lg:text-lg ml-2 text-grey">
            {t(validTotalEmissions ? "emissionsUnit" : " ")}
          </span>{" "}
          {t("relatableNumbers.descriptionPartTwo")}
        </Text>
        <div className="justify-between flex flex-col md:flex-row md:gap-6">
          <div className="mt-6 gap-4 flex flex-col">
            <div className="flex items-center gap-4">
              <img
                src="../icons/fire-icon.svg"
                alt="fire icon"
                className="h-[50px] md:h-[70px]"
              />
              <Text
                variant="body"
                className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
              >
                {" "}
                {t("relatableNumbers.forestFirePartOne")}{" "}
                <span className="text-red-300">
                  {areaTreesBurntFormatted?.slice(
                    0,
                    areaTreesBurntFormatted.length - 2,
                  )}{" "}
                </span>
                {t("relatableNumbers.forestFirePartTwo")}
              </Text>
            </div>
          </div>
          <div className="mt-6 gap-4 flex flex-col">
            <div className="flex items-center gap-4">
              <img
                src="../icons/power.svg"
                alt="T-shirt icon"
                className="h-[50px] md:h-[70px]"
              />
              <Text
                variant="body"
                className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
              >
                <span className="text-yellow-100">
                  {swedenEmissionDifference}{" "}
                  {t("relatableNumbers.timesPartOne")}
                </span>{" "}
                {t("relatableNumbers.timesPartTwo")}
                {"  "}
                {selectedPeriod.endDate.slice(0, 4)}.
              </Text>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RelatableNumbers;
