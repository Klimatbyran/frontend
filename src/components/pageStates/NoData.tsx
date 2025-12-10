import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";

type PageNoDataProps = {
  titleKey?: string;
  descriptionKey?: string;
};

export const PageNoData = ({
  titleKey = "components.noData.title",
  descriptionKey = "components.noData.description",
}: PageNoDataProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-24">
      <Text variant="h3" className="text-red-500 mb-4">
        {t(titleKey)}
      </Text>
      <Text variant="body">{t(descriptionKey)}</Text>
    </div>
  );
};
