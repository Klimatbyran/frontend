import { Trans, useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";

export const ParisAgreementContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-4">
      <p>{t("methodsPage.general.parisAgreement.paragraph1")}</p>
      <p>
        <Trans
          i18nKey="methodsPage.general.parisAgreement.paragraph2"
          components={[
            <a
              title="IEA"
              className="underline hover:text-white transition-colors"
              href="https://www.iea.org/reports/co2-emissions-in-2023"
              target="_blank"
              rel="noopener noreferrer"
            />,
          ]}
        />
      </p>
      <p>{t("methodsPage.general.parisAgreement.paragraph3")}</p>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <LinkButton
            title={t("methodsPage.general.parisAgreement.link.title")}
            text={t("methodsPage.general.parisAgreement.link.text")}
            link="https://www.naturvardsverket.se/parisavtalet"
          />
        </div>
      </div>
    </div>
  );
};
