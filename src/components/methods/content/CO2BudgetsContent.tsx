import { Trans, useTranslation } from "react-i18next";

export const CO2BudgetsContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.general.co2Budgets.paragraph1")}</p>
      <p>
        <Trans
          i18nKey="methodsPage.general.co2Budgets.paragraph2"
          components={[
            <a
              title="Uppsala universitet"
              className="underline hover:text-white transition-colors"
              href="https://www.cemus.uu.se/wp-content/uploads/2023/12/Paris-compliant-carbon-budgets-for-Swedens-counties-.pdf"
              target="_blank"
              rel="noopener noreferrer"
            />,
          ]}
        />
      </p>
      <p>{t("methodsPage.general.co2Budgets.paragraph3")}</p>
      <p>{t("methodsPage.general.co2Budgets.paragraph4")}</p>
      <p>{t("methodsPage.general.co2Budgets.paragraph5")}</p>
      <p>{t("methodsPage.general.co2Budgets.paragraph6")}</p>
      <p>{t("methodsPage.general.co2Budgets.paragraph7")}</p>
      <p>
        <Trans
          i18nKey="methodsPage.general.co2Budgets.paragraph8"
          components={[
            <a
              title="Chalmers"
              className="underline hover:text-white transition-colors"
              href="https://research.chalmers.se/publication/530543/file/530543_Fulltext.pdf"
              target="_blank"
              rel="noopener noreferrer"
            />,
          ]}
        />
      </p>
    </div>
  );
};
