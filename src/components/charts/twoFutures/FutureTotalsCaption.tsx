import { Trans, useTranslation } from "react-i18next";
import { captionFromPathTotals } from "@/components/territories/emissionsGraph/twoFuturesComparisonPhrase";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";

export type FutureTotalsCaptionProps = {
  year: number;
  totalTrend: number;
  totalParis: number;
  /** i18n prefix, e.g. `detailPage.graph` or `companies.emissionsHistory` */
  translationPrefix: string;
};

export function FutureTotalsCaption({
  year,
  totalTrend,
  totalParis,
  translationPrefix,
}: FutureTotalsCaptionProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const caption = captionFromPathTotals(totalTrend, totalParis);
  if (caption == null) return null;

  if (caption.kind === "aligned") {
    return (
      <p className="max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
        {t(`${translationPrefix}.twoFuturesAligned`, { year })}
      </p>
    );
  }

  const overshoot = caption.kind === "overshoot";
  const i18nKey = overshoot
    ? `${translationPrefix}.twoFuturesOvershoot`
    : `${translationPrefix}.twoFuturesUndershoot`;
  const accent = overshoot ? "text-pink-3" : "text-green-2";
  const factor = formatEmissionsAbsolute(caption.times, currentLanguage);

  return (
    <p className="max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
      <Trans
        i18nKey={i18nKey}
        values={{ year, factor }}
        components={[<span key="0" className={accent} />]}
      />
    </p>
  );
}
