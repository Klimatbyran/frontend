import { Text } from "@/components/ui/text";
import {
  emissionsToTshirts,
  emissionsToGasTank,
} from "@/utils/calculations/relatableNumbersCalc";
import {
  formatEmissionsAbsolute,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useTranslation } from "react-i18next";

type RelatableNumbersProps = {
  totalEmissions: number | null;
  currentLanguage: "sv" | "en";
};

const RelatableNumbers = ({
  totalEmissions,
  currentLanguage,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();
  const validTotalEmissions = totalEmissions || null;

  const numberOfTshirtsProduced = emissionsToTshirts(validTotalEmissions);
  const tshirtsProducedFormatted = localizeUnit(
    numberOfTshirtsProduced,
    currentLanguage,
  );

  const numbersOfGasTanks = emissionsToGasTank(validTotalEmissions);
  const numbersOfGasTanksFormatted = localizeUnit(
    numbersOfGasTanks,
    currentLanguage,
  );
  return (
    validTotalEmissions && (
      <div className="bg-black-2 rounded-level-1 p-16">
        <Text variant={"h3"}>From Tons to T-Shirts: Relatable Numbers</Text>
        <Text
          variant="body"
          className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
        >
          The current total emission of{" "}
          <span className="text-orange-2">
            {formatEmissionsAbsolute(validTotalEmissions, currentLanguage)}
          </span>
          <span className="text-sm md:text-base lg:text-lg ml-2 text-grey">
            {t(validTotalEmissions ? "emissionsUnit" : " ")}
          </span>{" "}
          compares to the following:
        </Text>
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
              Approximately{" "}
              <span className="text-blue-2">
                {tshirtsProducedFormatted} {t("companyDetailPage.billion")}
              </span>{" "}
              T-shirts produced.
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
              Approximately{" "}
              <span className="text-red-200">
                {numbersOfGasTanksFormatted} {t("companyDetailPage.billion")}
              </span>{" "}
              full tanks of gas.
            </Text>
          </div>
        </div>
      </div>
    )
  );
};

export default RelatableNumbers;
