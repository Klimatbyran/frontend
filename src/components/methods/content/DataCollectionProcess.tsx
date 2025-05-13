import { useTranslation } from "react-i18next";
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

export const DataCollectionProcessContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <Section
        title={t(
          "methodsPage.company.companyDataCollection.dataPresented.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.companyDataCollection.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.company.companyDataCollection.paragraph2",
          )}
        </p>
        <p>
          {t(
            "methodsPage.company.companyDataCollection.paragraph3",
          )}
        </p>
        <p>
          {t(
            "methodsPage.company.companyDataCollection.paragraph4",
          )}
        </p>
        <p>
          {t(
            "methodsPage.company.companyDataCollection.paragraph5",
          )}
        </p>
      </Section>

      <Section
        title={t(
          "methodsPage.company.companyDataCollection.fiscalYear.title",
        )}
      >
        <p>
          {t(
            "methodsPage.company.companyDataCollection.fiscalYear.paragraph1",
          )}
        </p>
      </Section>
    </div>
  );
};
