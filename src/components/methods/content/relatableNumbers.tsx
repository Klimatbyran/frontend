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

export const RelatableNumbersContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.company.relatableNumbers.paragraph")}</p>
      <Section
        title={t("methodsPage.company.relatableNumbers.forestFire.title")}
      >
        <p>{t("methodsPage.company.relatableNumbers.forestFire.paragraph1")}</p>
        <ul>
          <li>
            {t("methodsPage.company.relatableNumbers.forestFire.bullet1")}
          </li>
          <li>
            {t("methodsPage.company.relatableNumbers.forestFire.bullet2")}
          </li>
          <li>
            {t("methodsPage.company.relatableNumbers.forestFire.bullet3")}
          </li>
        </ul>
        <p>{t("methodsPage.company.relatableNumbers.forestFire.paragraph2")}</p>
      </Section>

      <Section title={t("methodsPage.company.relatableNumbers.citizens.title")}>
        <p>{t("methodsPage.company.relatableNumbers.citizens.paragraph1")}</p>
        <br></br>
        <p>{t("methodsPage.company.relatableNumbers.citizens.paragraph2")}</p>
      </Section>
    </div>
  );
};
