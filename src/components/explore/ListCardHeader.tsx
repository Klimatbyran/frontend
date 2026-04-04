import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { meetsParisAnswerLabel } from "./listCardHelpers";

export function ListCardHeader({
  name,
  description,
  meetsParis,
  meetsParisTranslationKey,
  logoUrl,
  isMunicipality,
  isRegion,
}: {
  name: string;
  description: string;
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;
  logoUrl?: string | null;
  isMunicipality: boolean;
  isRegion: boolean;
}) {
  const { t } = useTranslation();
  const meetsParisAnswer = meetsParisAnswerLabel(meetsParis, t);
  const logo =
    isMunicipality || isRegion
      ? logoUrl && <img src={logoUrl} alt="logo" className="h-[50px]" />
      : logoUrl && (
          <CompanyLogo
            src={logoUrl}
            className="shrink-0 rounded-xl max-w-[90px] max-h-[90px] object-contain inline-block"
          />
        );

  return (
    <div className="w-full">
      <div className="flex justify-between gap-1 items-start">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-light">{name}</h2>
          <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
            {description}
          </p>
        </div>
        {logo}
      </div>
      <div className="w-full">
        <div className="flex items-center gap-2 text-grey text-lg">
          {t(meetsParisTranslationKey)}
        </div>
        <div
          className={cn(
            "w-full text-xl font-light border-b border-black-1 pb-6",
            meetsParis === true ? "text-green-3" : "text-pink-3",
          )}
        >
          {meetsParisAnswer}
        </div>
      </div>
    </div>
  );
}
