import { useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";

export const RelatableNumbersContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.company.relatableNumbers.paragraph1")}</p>
      <p>{t("methodsPage.company.relatableNumbers.paragraph2")}</p>
      <MethodSection
        title={t("methodsPage.company.relatableNumbers.flights.title")}
      >
        <p>{t("methodsPage.company.relatableNumbers.forestFire.paragraph1")}</p>
        <ul>
          <li>
            {t("methodsPage.company.relatableNumbers.forestFire.bullet1")}
          </li>
          <li>
            {t("methodsPage.company.relatableNumbers.forestFire.bullet2")}
          </li>
        </ul>
        <p>{t("methodsPage.company.relatableNumbers.forestFire.paragraph2")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.company.relatableNumbers.citizens.title")}
      >
        <p>{t("methodsPage.company.relatableNumbers.citizens.paragraph")}</p>
      </MethodSection>
      <section className="flex flex-col text-sm italic gap-2">
        <a
          href={t("methodsPage.company.relatableNumbers.forestFire.source")}
          target="_blank"
          rel="noopener noreferrer"
        >
          1. {t("methodsPage.company.relatableNumbers.forestFire.source")}
        </a>
        <a
          href={t("methodsPage.company.relatableNumbers.citizens.source")}
          target="_blank"
          rel="noopener noreferrer"
        >
          2. {t("methodsPage.company.relatableNumbers.citizens.source")}
        </a>
      </section>
    </div>
  );
};
