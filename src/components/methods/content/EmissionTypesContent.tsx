import { useTranslation } from "react-i18next";

export const EmissionTypesContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      {[...Array(6).keys()].map((i) => (
        <p key={i}>
          {t(`methodsPage.general.emissionTypes.paragraph${i + 1}`)}
        </p>
      ))}
    </div>
  );
};
