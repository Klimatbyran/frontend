import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LinkCard } from "@/components/ui/link-card";
import { LocalizedLink } from "@/components/LocalizedLink";
import { FinancialsTooltip } from "@/components/companies/detail/overview/FinancialsTooltip";
import { CardInfo } from "@/components/layout/CardInfo";

interface ListCardProps {
  // Basic info
  name: string;
  description: string;
  linkTo: string;
  logoUrl?: string | null;

  // Meets Paris
  meetsParis: boolean | null; // true = Yes, false = No, null = Unknown
  meetsParisTranslationKey: string;

  // Emissions data
  emissionsValue: string | null;
  emissionsYear?: string;
  emissionsUnit?: string;
  emissionsIsAIGenerated?: boolean;

  // Change rate data
  changeRateValue: string | null;
  changeRateIsAIGenerated?: boolean;
  changeRateColor?: string;
  changeRateTooltip?: string;

  // Bottom link card
  linkCardLink?: string;
  linkCardTitle: string;
  linkCardDescription: string;
  linkCardDescriptionColor: string;

  // Optional features
  isFinancialsSector?: boolean;
}

export function ListCard({
  name,
  description,
  logoUrl,
  linkTo,
  meetsParis,
  meetsParisTranslationKey,
  emissionsValue,
  emissionsYear,
  emissionsUnit,
  emissionsIsAIGenerated,
  changeRateValue,
  changeRateIsAIGenerated,
  changeRateColor,
  changeRateTooltip,
  linkCardLink,
  linkCardTitle,
  linkCardDescription,
  linkCardDescriptionColor,
  isFinancialsSector = false,
}: ListCardProps) {
  const { t } = useTranslation();
  console.log(logoUrl);
  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink
        to={linkTo}
        className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        {/* Header section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-light">{name}</h2>
            {logoUrl && <img src={logoUrl} alt="logo" className="h-[35px]" />}
          </div>
          <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
            {description}
          </p>

          {/* Meets Paris section */}
          <div className="flex items-center gap-2 text-grey mb-2 text-lg">
            {t(meetsParisTranslationKey, { name })}
          </div>
          <div
            className={cn(
              "text-3xl font-light",
              meetsParis === true
                ? "text-green-3"
                : meetsParis === false
                  ? "text-pink-3"
                  : "text-grey",
            )}
          >
            {meetsParis === true
              ? t("yes")
              : meetsParis === false
                ? t("no")
                : t("unknown")}
          </div>
        </div>

        {/* Emissions and change rate section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-black-1">
          {/* Emissions */}
          <CardInfo
            title={
              emissionsYear
                ? `${t("companies.card.emissions")} ${emissionsYear}`
                : t("companies.card.emissions")
            }
            value={emissionsValue}
            textColor="text-orange-2"
            unit={emissionsUnit}
            isAIGenerated={emissionsIsAIGenerated}
            suffix={isFinancialsSector ? <FinancialsTooltip /> : undefined}
          />

          {/* Change Rate */}
          <CardInfo
            title={t("companies.card.emissionsChangeRate")}
            value={changeRateValue}
            textColor={changeRateColor || "text-orange-2"}
            isAIGenerated={changeRateIsAIGenerated}
            tooltip={changeRateTooltip}
          />
        </div>

        {/* Bottom link card */}
        <LinkCard
          link={linkCardLink}
          title={linkCardTitle}
          description={linkCardDescription}
          descriptionColor={linkCardDescriptionColor}
        />
      </LocalizedLink>
    </div>
  );
}
