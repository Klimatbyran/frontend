import { Trans, useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";

export const ParisAgreementContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-4">
      <p>{t("methodsPage.accordion.parisAgreement.paragraph1")}</p>
      <p>
        <Trans
          i18nKey="methodsPage.accordion.parisAgreement.paragraph2"
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
      <p>{t("methodsPage.accordion.parisAgreement.paragraph3")}</p>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <LinkButton
            title={t("methodsPage.accordion.parisAgreement.link.title")}
            text={t("methodsPage.accordion.parisAgreement.link.text")}
            link="https://www.naturvardsverket.se/parisavtalet"
          />
        </div>
      </div>
    </div>
  );
};
