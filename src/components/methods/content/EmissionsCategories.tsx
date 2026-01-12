import { useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";
import { MethodSection } from "@/components/layout/MethodSection";

export const EmissionsAndCategoriesContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <MethodSection
        title={t("methodsPage.company.emissionCategories.scope2.title")}
      >
        <p>{t("methodsPage.company.emissionCategories.scope2.paragraph1")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.company.emissionCategories.scope3.title")}
      >
        <p>{t("methodsPage.company.emissionCategories.scope3.paragraph1")}</p>
        <p>{t("methodsPage.company.emissionCategories.scope3.paragraph2")}</p>
        <p>{t("methodsPage.company.emissionCategories.scope3.paragraph3")}</p>
        <div className="flex justify-center">
          <div className="w-full space-y-6">
            <LinkButton
              title={t(
                "methodsPage.company.emissionCategories.scope3.link.title",
              )}
              text={t(
                "methodsPage.company.emissionCategories.scope3.link.text",
              )}
              link="https://www.fastighetsagarna.se/globalassets/broschyrer-och-faktablad/riktlinjer/vagledning-rapportering-av-utslapp-i-scope-3-for-fastighetsagare.pdf?bustCache=1739437148312"
            />
          </div>
        </div>
      </MethodSection>

      <MethodSection
        title={t(
          "methodsPage.company.emissionCategories.financedEmissions.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.emissionCategories.financedEmissions.paragraph1",
          )}
        </p>
      </MethodSection>

      <MethodSection
        title={t(
          "methodsPage.company.emissionCategories.biogenicEmissions.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.emissionCategories.biogenicEmissions.paragraph1",
          )}
        </p>
      </MethodSection>
      <MethodSection
        title={t(
          "methodsPage.company.emissionCategories.emissionOffsets.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.emissionCategories.emissionOffsets.paragraph1",
          )}
        </p>
      </MethodSection>
    </div>
  );
};
