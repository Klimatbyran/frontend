import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { articleMetaData } from "../../lib/learn-more/articleList";

export function LearnMoreCard({
  article,
}: {
  article: (typeof articleMetaData)[number];
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <Link
      to={`/${currentLanguage}/learn-more/${article.id}`}
      className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={article.image}
          alt={t(article.titleKey)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-8 space-y-4">
        <Text
          variant="h4"
          className="group-hover:text-blue-2 transition-colors"
        >
          {t(article.titleKey)}
        </Text>
        <Text className="text-grey">{t(article.excerptKey)}</Text>
        <div className="flex items-center gap-2 text-blue-2 group-hover:gap-3 transition-all">
          <span aria-label="Click to read full article">
            {t("insightsPage.readMore")}
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
