import { Text } from "@/components/ui/text";
import {
  emissionsToTshirts,
  emissionsToGasTank,
  emissionsComparedToSweden,
  emissionsToTrees,
} from "@/utils/calculations/relatableNumbersCalc";
import {
  formatEmissionsAbsolute,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useTranslation } from "react-i18next";
import { ReportingPeriod } from "@/types/company";

type RelatableNumbersProps = {
  selectedPeriod: ReportingPeriod;
  selectedYear: string;
  currentLanguage: "sv" | "en";
};

const RelatableNumbers = ({
  selectedPeriod,
  currentLanguage,
  selectedYear,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();

  const validTotalEmissions =
    selectedPeriod.emissions?.calculatedTotalEmissions || null;

  const numberOfTshirtsProduced = emissionsToTshirts(validTotalEmissions);
  const tshirtsProducedFormatted = localizeUnit(
    numberOfTshirtsProduced,
    currentLanguage,
  )?.slice(0, 4);

  const numbersOfGasTanks = emissionsToGasTank(validTotalEmissions);
  const numbersOfGasTanksFormatted = localizeUnit(
    numbersOfGasTanks,
    currentLanguage,
  )?.slice(0, 4);

  const swedenEmissionDifference = Math.round(
    emissionsComparedToSweden(validTotalEmissions),
  );

  const numberOfTreesAbsorbing = emissionsToTrees(validTotalEmissions);
  const numberOfTreesAbsorbingFormatted = localizeUnit(
    numberOfTreesAbsorbing,
    currentLanguage,
  )?.slice(0, 4);

  return (
    validTotalEmissions && (
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
                src="../icons/t-shirt.svg"
                alt="T-shirt icon"
                className="h-[50px] md:h-[70px]"
              />
              <Text
                variant="body"
                className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
              >
                <span className="text-blue-2">
                  {tshirtsProducedFormatted} {t("relatableNumbers.billion")}
                </span>{" "}
                {t("relatableNumbers.t-shirts")}
              </Text>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="../icons/gas-tank.svg"
                alt="T-shirt icon"
                className="h-[50px] md:h-[70px]"
              />
              <Text
                variant="body"
                className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
              >
                <span className="text-red-200">
                  {numbersOfGasTanksFormatted} {t("relatableNumbers.billion")}
                </span>{" "}
                {t("relatableNumbers.gas")}
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
                  {swedenEmissionDifference} {t("relatableNumbers.times")}
                </span>{" "}
                {t("relatableNumbers.power")}{" "}
                {selectedPeriod.endDate.slice(0, 4)}.
              </Text>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="../icons/tree.svg"
                alt="T-shirt icon"
                className="h-[50px] md:h-[70px]"
              />
              <Text
                variant="body"
                className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
              >
                <span className="text-green-100">
                  {numberOfTreesAbsorbingFormatted}{" "}
                  {t("relatableNumbers.billion")}
                </span>{" "}
                {t("relatableNumbers.trees")}
              </Text>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RelatableNumbers;
