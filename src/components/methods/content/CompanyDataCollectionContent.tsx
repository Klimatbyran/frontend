import { useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";
import { Text } from "@/components/ui/text";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="space-y-4">
    <Text className="text-blue-2 font-bold text-2xl">{title}</Text>
    {children}
  </div>
);

export const CompanyDataCollectionContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
      <p>{t("methodsPage.accordion.companyDataCollection.paragraph1")}</p>
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          <LinkButton
            title={t("methodsPage.accordion.companyDataCollection.link1")}
            text={t("methodsPage.accordion.companyDataCollection.paragraph2")}
            link="/companies"
          />
        </div>
      </div>
      <p>{t("methodsPage.accordion.companyDataCollection.paragraph3")}</p>
      <p>{t("methodsPage.accordion.companyDataCollection.paragraph4")}</p>
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          <LinkButton
            title={t("methodsPage.accordion.companyDataCollection.link2")}
            text={t("methodsPage.accordion.companyDataCollection.paragraph5")}
            link="https://ghgprotocol.org/"
          />
        </div>
      </div>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.companiesIncluded.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.companiesIncluded.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.companiesIncluded.paragraph2",
          )}
        </p>
        <div className="flex justify-center">
          <div className="w-full space-y-6">
            <LinkButton
              title={t("methodsPage.accordion.companyDataCollection.link2")}
              text={t(
                "methodsPage.accordion.companyDataCollection.companiesIncluded.paragraph3",
              )}
              link="https://www.msci.com/our-solutions/indexes/gics"
            />
          </div>
        </div>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.companiesIncluded.paragraph4",
          )}
        </p>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.companiesIncluded.paragraph5",
          )}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.dataPresented.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.dataPresented.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.dataPresented.paragraph2",
          )}
        </p>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.dataPresented.paragraph3",
          )}
        </p>
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.dataPresented.paragraph4",
          )}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.fiscalYear.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.fiscalYear.paragraph1",
          )}
        </p>
      </Section>

      <Section
        title={t("methodsPage.accordion.companyDataCollection.scope2.title")}
      >
        <p>
          {t("methodsPage.accordion.companyDataCollection.scope2.paragraph1")}
        </p>
      </Section>

      <Section
        title={t("methodsPage.accordion.companyDataCollection.scope3.title")}
      >
        <p>
          {t("methodsPage.accordion.companyDataCollection.scope3.paragraph1")}
        </p>
        <p>
          {t("methodsPage.accordion.companyDataCollection.scope3.paragraph2")}
        </p>
        <div className="flex justify-center">
          <div className="w-full space-y-6">
            <LinkButton
              title={t(
                "methodsPage.accordion.companyDataCollection.scope3.link",
              )}
              text={t(
                "methodsPage.accordion.companyDataCollection.scope3.paragraph3",
              )}
              link="https://www.fastighetsagarna.se/globalassets/broschyrer-och-faktablad/riktlinjer/vagledning-rapportering-av-utslapp-i-scope-3-for-fastighetsagare.pdf?bustCache=1739437148312"
            />
          </div>
        </div>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.financedEmissions.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.financedEmissions.paragraph1",
          )}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.biogenicEmissions.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.biogenicEmissions.paragraph1",
          )}
        </p>
      </Section>

      <Section
        title={t("methodsPage.accordion.companyDataCollection.goals.title")}
      >
        <p>
          {t("methodsPage.accordion.companyDataCollection.goals.paragraph1")}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.historicEmissions.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.historicEmissions.paragraph1",
          )}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.accordion.companyDataCollection.emissionOffsets.title",
        )}
      >
        <p>
          {t(
            "methodsPage.accordion.companyDataCollection.emissionOffsets.paragraph1",
          )}
        </p>
      </Section>
    </div>
  );
};
