import { Trans, useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";

function Paragraph({ i18nKey }: { i18nKey: string }) {
  return (
    <p>
      <Trans i18nKey={i18nKey} />
    </p>
  );
}

function SourceList({
  items,
}: {
  items: { labelKey: string; href?: string }[];
}) {
  const { t } = useTranslation();
  return (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item) => (
        <li key={item.labelKey}>
          {item.href ? (
            <a
              href={item.href}
              className="underline hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(item.labelKey)}
            </a>
          ) : (
            t(item.labelKey)
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Methodology for Sweden’s full national emissions picture
 * (production, consumption abroad, biogenic) used in the nation story.
 */
export const NationEmissionsLayersContent = () => {
  const { t } = useTranslation();
  const base = "methodsPage.nation.nationEmissionsLayers";

  return (
    <div className="prose prose-invert mx-auto space-y-10">
      <MethodSection title={t(`${base}.intro.title`)}>
        <Paragraph i18nKey={`${base}.intro.paragraph1`} />
        <Paragraph i18nKey={`${base}.intro.paragraph2`} />
        <Paragraph i18nKey={`${base}.intro.paragraph3`} />
      </MethodSection>

      <MethodSection title={t(`${base}.perspectives.title`)}>
        <Paragraph i18nKey={`${base}.perspectives.paragraph1`} />
        <ul className="list-disc pl-5 space-y-2">
          <li>{t(`${base}.perspectives.production`)}</li>
          <li>{t(`${base}.perspectives.consumption`)}</li>
          <li>{t(`${base}.perspectives.biogenic`)}</li>
        </ul>
        <Paragraph i18nKey={`${base}.perspectives.paragraph2`} />
      </MethodSection>

      <MethodSection title={t(`${base}.territorial.title`)}>
        <Paragraph i18nKey={`${base}.territorial.paragraph1`} />
        <Paragraph i18nKey={`${base}.territorial.paragraph2`} />
        <SourceList
          items={[
            {
              labelKey: `${base}.territorial.sources.nv`,
              href: "https://www.naturvardsverket.se/data-och-statistik/klimat/sveriges-utslapp-och-upptag-av-vaxthusgaser",
            },
          ]}
        />
      </MethodSection>

      <MethodSection title={t(`${base}.production.title`)}>
        <Paragraph i18nKey={`${base}.production.paragraph1`} />
        <Paragraph i18nKey={`${base}.production.paragraph2`} />
        <Paragraph i18nKey={`${base}.production.paragraph3`} />
        <SourceList
          items={[
            {
              labelKey: `${base}.production.sources.scbBunker`,
              href: "https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__MI__MI0107/TotaltUtslappN",
            },
            {
              labelKey: `${base}.production.sources.scbAccounts`,
              href: "https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__MI__MI1301__MI1301B/MiljoUtslappAmneSNIK",
            },
            {
              labelKey: `${base}.production.sources.scbQuality`,
              href: "https://www.scb.se/contentassets/f0d9c7eda5be4b8a96c5827e4bebf513/mi1301_kd_2024_fk_20260326.pdf",
            },
          ]}
        />
      </MethodSection>

      <MethodSection title={t(`${base}.consumption.title`)}>
        <Paragraph i18nKey={`${base}.consumption.paragraph1`} />
        <Paragraph i18nKey={`${base}.consumption.paragraph2`} />
        <Paragraph i18nKey={`${base}.consumption.paragraph3`} />
        <Paragraph i18nKey={`${base}.consumption.paragraph4`} />
        <Paragraph i18nKey={`${base}.consumption.paragraph5`} />
        <Paragraph i18nKey={`${base}.consumption.paragraph6`} />
        <SourceList
          items={[
            {
              labelKey: `${base}.consumption.sources.gcp`,
              href: "https://www.icos-cp.eu/science-and-impact/global-carbon-budget/2025",
            },
            {
              labelKey: `${base}.consumption.sources.edgar`,
              href: "https://edgar.jrc.ec.europa.eu/report_2025",
            },
            {
              labelKey: `${base}.consumption.sources.scb`,
              href: "https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__MI__MI1301__MI1301F/MI1301MPSPINN",
            },
            {
              labelKey: `${base}.consumption.sources.chalmers`,
              href: "https://research.chalmers.se/publication/506746",
            },
            {
              labelKey: `${base}.consumption.sources.trafa`,
              href: "https://www.trafa.se/luftfart2/luftfart",
            },
            {
              labelKey: `${base}.consumption.sources.svenskHandel`,
              href: "https://www.svenskhandel.se/rapporter/e-handelsindikatorn/e-handelsindikatorn-helar-2025",
            },
          ]}
        />
      </MethodSection>

      <MethodSection title={t(`${base}.biogenic.title`)}>
        <Paragraph i18nKey={`${base}.biogenic.paragraph1`} />
        <Paragraph i18nKey={`${base}.biogenic.paragraph2`} />
        <Paragraph i18nKey={`${base}.biogenic.paragraph3`} />
        <SourceList
          items={[
            {
              labelKey: `${base}.biogenic.sources.nv`,
              href: "https://www.naturvardsverket.se/data-och-statistik/klimat/utslapp-av-biogen-koldioxid-fran-forbranning-av-biomassa-i-sverige",
            },
            {
              labelKey: `${base}.biogenic.sources.scb`,
              href: "https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__MI__MI1301__MI1301B/MiljoUtslappAmneSNIK",
            },
          ]}
        />
      </MethodSection>

      <MethodSection title={t(`${base}.total.title`)}>
        <Paragraph i18nKey={`${base}.total.paragraph1`} />
        <Paragraph i18nKey={`${base}.total.paragraph2`} />
        <Paragraph i18nKey={`${base}.total.paragraph3`} />
      </MethodSection>

      <MethodSection title={t(`${base}.limitations.title`)}>
        <Paragraph i18nKey={`${base}.limitations.paragraph1`} />
        <ul className="list-disc pl-5 space-y-2">
          <li>{t(`${base}.limitations.item1`)}</li>
          <li>{t(`${base}.limitations.item2`)}</li>
          <li>{t(`${base}.limitations.item3`)}</li>
          <li>{t(`${base}.limitations.item4`)}</li>
        </ul>
      </MethodSection>
    </div>
  );
};
