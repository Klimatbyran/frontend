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

export const TrendlineContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <Text className="text-blue-2 font-bold text-3xl">
        {t("methodsPage.general.trendline.title")}
      </Text>

      <p>{t("methodsPage.general.trendline.paragraph1")}</p>
      <p>{t("methodsPage.general.trendline.paragraph2")}</p>

      <Section
        title={t(
          "methodsPage.general.trendline.whenCalculated.title",
        )}
      >
        <p>{t("methodsPage.general.trendline.whenCalculated.paragraph1")}</p>

        <p className="font-semibold">
          {t("methodsPage.general.trendline.whenCalculated.companies.intro")}
        </p>
        <ul>
          <li>
            {t(
              "methodsPage.general.trendline.whenCalculated.companies.point1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.trendline.whenCalculated.companies.point2",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.trendline.whenCalculated.companies.point3",
            )}
          </li>
        </ul>

        <p className="font-semibold">
          {t(
            "methodsPage.general.trendline.whenCalculated.municipalities.intro",
          )}
        </p>
        <ul>
          <li>
            {t(
              "methodsPage.general.trendline.whenCalculated.municipalities.point1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.trendline.whenCalculated.municipalities.point2",
            )}
          </li>
        </ul>

        <p>{t("methodsPage.general.trendline.whenCalculated.paragraph2")}</p>
      </Section>

      <Section title={t("methodsPage.general.trendline.whyLad.title")}>
        <p>{t("methodsPage.general.trendline.whyLad.paragraph1")}</p>
        <ul>
          <li>
            {t("methodsPage.general.trendline.whyLad.point1")}
          </li>
          <li>
            {t("methodsPage.general.trendline.whyLad.point2")}
          </li>
          <li>
            {t("methodsPage.general.trendline.whyLad.point3")}
          </li>
          <li>
            {t("methodsPage.general.trendline.whyLad.point4")}
          </li>
        </ul>
        <p>{t("methodsPage.general.trendline.whyLad.paragraph2")}</p>
      </Section>

      <Section title={t("methodsPage.general.trendline.howComputed.title")}>
        <p>{t("methodsPage.general.trendline.howComputed.paragraph1")}</p>
        <ol className="list-decimal list-outside ml-6 space-y-1">
          <li>
            {t("methodsPage.general.trendline.howComputed.step1")}
          </li>
          <li>
            {t("methodsPage.general.trendline.howComputed.step2")}
          </li>
          <li>
            {t("methodsPage.general.trendline.howComputed.step3")}
          </li>
          <li>
            {t("methodsPage.general.trendline.howComputed.step4")}
          </li>
          <li>
            {t("methodsPage.general.trendline.howComputed.step5")}
          </li>
        </ol>
        <p>{t("methodsPage.general.trendline.howComputed.paragraph2")}</p>
        <p>{t("methodsPage.general.trendline.howComputed.paragraph3")}</p>

        {/* TODO: Add small visual showing historical points, fitted line, zero floor */}
      </Section>

      <Section title={t("methodsPage.general.trendline.represents.title")}>
        <p>{t("methodsPage.general.trendline.represents.paragraph1")}</p>
        <ul>
          <li>
            {t("methodsPage.general.trendline.represents.point1")}
          </li>
          <li>
            {t("methodsPage.general.trendline.represents.point2")}
          </li>
          <li>
            {t("methodsPage.general.trendline.represents.point3")}
          </li>
          <li>
            {t("methodsPage.general.trendline.represents.point4")}
          </li>
        </ul>

        <p>{t("methodsPage.general.trendline.represents.paragraph2")}</p>
        <ul>
          <li>
            {t("methodsPage.general.trendline.represents.notPoint1")}
          </li>
          <li>
            {t("methodsPage.general.trendline.represents.notPoint2")}
          </li>
          <li>
            {t("methodsPage.general.trendline.represents.notPoint3")}
          </li>
        </ul>

        <p>{t("methodsPage.general.trendline.represents.paragraph3")}</p>
      </Section>

      <Section title={t("methodsPage.general.trendline.whyWorks.title")}>
        <p>{t("methodsPage.general.trendline.whyWorks.paragraph1")}</p>
        <ul>
          <li>
            {t("methodsPage.general.trendline.whyWorks.point1")}
          </li>
          <li>
            {t("methodsPage.general.trendline.whyWorks.point2")}
          </li>
          <li>
            {t("methodsPage.general.trendline.whyWorks.point3")}
          </li>
        </ul>
        <p>{t("methodsPage.general.trendline.whyWorks.paragraph2")}</p>
      </Section>
    </div>
  );
};