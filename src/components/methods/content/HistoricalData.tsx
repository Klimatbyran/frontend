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

export const HistoricalDataContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
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
    </div>
  );
};
