import { Text } from "@/components/ui/text";
import {
  calculateStockholmsBurnt,
  calculateBurntFootballFields,
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
    selectedPeriod.emissions?.calculatedTotalEmissions;

  if (!validTotalEmissions) return;

  const stockholmsBurnt = calculateStockholmsBurnt(validTotalEmissions);
  const stockholmsBurntFormatted =
    stockholmsBurnt !== null
      ? localizeUnit(stockholmsBurnt, currentLanguage)
      : null;

  const footballFieldsBurnt = calculateBurntFootballFields(validTotalEmissions);
  const footballFieldsBurntFormatted = localizeUnit(
    footballFieldsBurnt,
    currentLanguage,
  );

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
              {stockholmsBurntFormatted ? (
                <Text>
                  {t("relatableNumbers.forestFireStockholm")}{" "}
                  <span className="text-red-300">
                    {stockholmsBurntFormatted.slice(
                      0,
                      stockholmsBurntFormatted.length - 2,
                    )}{" "}
                    {t("relatableNumbers.times")}
                  </span>{" "}
                  {t("relatableNumbers.forestFireStockholmExtension")}
                </Text>
              ) : (
                <Text>
                  {t("relatableNumbers.forestFireFootball")}
                  <span className="text-red-300">
                    {footballFieldsBurntFormatted?.slice(
                      0,
                      footballFieldsBurntFormatted.length - 2,
                    )}
                  </span>
                  {t("relatableNumbers.forestFireFootballExtension")}
                </Text>
              )}
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
