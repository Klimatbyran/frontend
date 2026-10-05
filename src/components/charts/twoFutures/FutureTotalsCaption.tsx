import { Trans, useTranslation } from "react-i18next";
import { pickTrendVsParisPhraseKey } from "@/components/territories/emissionsGraph/twoFuturesComparisonPhrase";

export type FutureTotalsCaptionProps = {
  year: number;
  gapShareOfParis: number | null;
  /** i18n prefix, e.g. `detailPage.graph` or `companies.emissionsHistory` */
  translationPrefix: string;
};

export function FutureTotalsCaption({
  year,
  gapShareOfParis,
  translationPrefix,
}: FutureTotalsCaptionProps) {
  const { t } = useTranslation();
  if (gapShareOfParis == null) return null;

  const phraseKey = pickTrendVsParisPhraseKey(gapShareOfParis);
  if (phraseKey == null) {
    return (
      <p className="max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
        {t(`${translationPrefix}.twoFuturesAligned`, { year })}
      </p>
    );
  }

  const overshoot = gapShareOfParis > 0;
  const i18nKey = overshoot
    ? `${translationPrefix}.twoFuturesOvershoot`
    : `${translationPrefix}.twoFuturesUndershoot`;
  const accent = overshoot ? "text-pink-3" : "text-green-2";
  const comparison = t(`${translationPrefix}.comparison.${phraseKey}`);

  return (
    <p className="max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
      <Trans
        i18nKey={i18nKey}
        values={{ year, comparison }}
        components={[<span key="0" className={accent} />]}
      />
    </p>
  );
}
