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

export const ParisAlignmentMethodContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      {/* Intro */}
      <p>{t("methodsPage.general.parisAlignment.intro.paragraph1")}</p>
      <p>{t("methodsPage.general.parisAlignment.intro.paragraph2")}</p>

      {/* 3.1 – Carbon budgets and Paris alignment */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.carbonBudget.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.carbonBudget.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.carbonBudget.paragraph2",
          )}
        </p>
        <ul>
          <li>
            {t(
              "methodsPage.general.parisAlignment.carbonBudget.list1.item1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.parisAlignment.carbonBudget.list1.item2",
            )}
          </li>
        </ul>
      </Section>

      {/* 3.2 – Anchor year and data used */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.anchorYear.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.anchorYear.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.anchorYear.paragraph2",
          )}
        </p>
      </Section>

      {/* 3.3 – Paris Path (Carbon Law) */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.parisPath.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.parisPath.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.parisPath.paragraph2",
          )}
        </p>
        {/* Placeholder for a small visual: curve vs time */}
        {/* TODO: Add visual component showing a simple Paris Path curve (exponential decline) */}
      </Section>

      {/* 3.4 – Trendline projection (LAD) */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.trendline.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.trendline.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.trendline.paragraph2",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.trendline.paragraph3",
          )}
        </p>
        {/* TODO: Add visual comparing a noisy historical series and a straight LAD trendline */}
      </Section>

      {/* 3.5 – Comparing pathways & deciding “On Track” */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.comparison.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.comparison.paragraph1",
          )}
        </p>
        <ul>
          <li>
            {t(
              "methodsPage.general.parisAlignment.comparison.list1.item1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.parisAlignment.comparison.list1.item2",
            )}
          </li>
        </ul>
        <p>
          {t(
            "methodsPage.general.parisAlignment.comparison.paragraph2",
          )}
        </p>
      </Section>

      {/* 3.6 – Limitations and interpretation */}
      <Section
        title={t(
          "methodsPage.general.parisAlignment.limitations.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.parisAlignment.limitations.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.parisAlignment.limitations.paragraph2",
          )}
        </p>
        {/* TODO: Optional small visual: two different trendlines with same budget outcome but different shapes */}
      </Section>
    </div>
  );
};