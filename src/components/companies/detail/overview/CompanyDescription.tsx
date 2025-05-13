import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useState } from "react";

interface CompanyDescriptionProps {
  description: string | null;
}

export function CompanyDescription({ description }: CompanyDescriptionProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const [showMore, setShowMore] = useState(false);

  if (isMobile) {
    return (
      <div>
        <button
          className="bg-black-1 text-white px-3 py-1 rounded-md mt-1 text-sm"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore
            ? t("companies.overview.readLess")
            : t("companies.overview.readMore")}
        </button>
        {showMore && (
          <Text
            variant="body"
            className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
          >
            {description}
          </Text>
        )}
      </div>
    );
  }

  return (
    <Text variant="body" className="text-sm md:text-base lg:text-lg max-w-3xl">
      {description}
    </Text>
  );
}
