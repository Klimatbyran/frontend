import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";

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

/** Same message as the overview pages already show: a compact title, not the detail-page heading. */
export function OverviewPageError({
  titleKey,
  descriptionKey,
}: Required<ErrorProps>) {
  const { t } = useTranslation();

  return (
    <div className="py-24 text-center">
      <h3 className="mb-4 text-xl text-red-500">{t(titleKey)}</h3>
      <p className="text-grey">{t(descriptionKey)}</p>
    </div>
  );
}
