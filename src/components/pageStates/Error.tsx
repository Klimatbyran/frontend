import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";

type ErrorProps = {
  titleKey?: string;
  descriptionKey?: string;
};

export const PageError = ({
  titleKey = "components.error.title",
  descriptionKey = "components.error.description",
}: ErrorProps) => {
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
