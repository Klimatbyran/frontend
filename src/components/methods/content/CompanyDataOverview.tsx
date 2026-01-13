import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { LinkButton } from "@/components/layout/LinkButton";
import { MethodSection } from "@/components/layout/MethodSection";

export const CompanyDataOverviewContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.company.companyDataOverview.paragraph1")}</p>
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          <LinkButton
            title={t("methodsPage.company.companyDataOverview.link1.title")}
            text={t("methodsPage.company.companyDataOverview.link1.text")}
            link={`${i18next.resolvedLanguage}/companies`}
          />
        </div>
      </div>
      <p>{t("methodsPage.company.companyDataOverview.paragraph2")}</p>
      <p>{t("methodsPage.company.companyDataOverview.paragraph3")}</p>
      <p>{t("methodsPage.company.companyDataOverview.paragraph4")}</p>
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          <LinkButton
            title={t("methodsPage.company.companyDataOverview.link2.title")}
            text={t("methodsPage.company.companyDataOverview.link2.text")}
            link="https://ghgprotocol.org/"
          />
        </div>
      </div>

      <MethodSection
        title={t(
          "methodsPage.company.companyDataOverview.companiesIncluded.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.companyDataOverview.companiesIncluded.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.company.companyDataOverview.companiesIncluded.paragraph2",
          )}
        </p>
        <div className="flex justify-center">
          <div className="w-full space-y-6">
            <LinkButton
              title={t(
                "methodsPage.company.companyDataOverview.companiesIncluded.link.title",
              )}
              text={t(
                "methodsPage.company.companyDataOverview.companiesIncluded.link.text",
              )}
              link="https://www.msci.com/our-solutions/indexes/gics"
            />
          </div>
        </div>
      </MethodSection>
      <p>{t("methodsPage.company.companyDataOverview.paragraph5")}</p>
    </div>
  );
};
