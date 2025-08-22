import { ArrowUpRight, CalendarDays, Clock, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeUnit } from "@/utils/formatting/localization";

interface ContentCardProps {
  item: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    category?: string;
    date?: string;
    readTime?: string;
    link?: string;
    language?: string;
  };
  basePath: string;
}

export function ContentCard({ item, basePath }: ContentCardProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const link = item.link || `/${currentLanguage}/${basePath}/${item.id}`;
  const isExternalLink = !!item.link;

  const cardContent = (
    <>
      <div className="relative h-36 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-8 space-y-4">
        {(item.category || item.date || item.readTime || item.language) && (
          <div className="flex items-center gap-4">
            {item.category && (
              <span
                aria-label="Category"
                className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm"
              >
                {item.category}
              </span>
            )}
            {item.date && (
              <div className="flex items-center gap-2 text-grey text-sm">
                <CalendarDays className="w-4 h-4" />
                <span aria-label="Date Published">
                  {localizeUnit(new Date(item.date), currentLanguage)}
                </span>
              </div>
            )}
            {item.readTime && (
              <div className="flex items-center gap-2 text-grey text-sm">
                <Clock className="w-4 h-4" />
                <span aria-label="Read Time">{item.readTime}</span>
              </div>
            )}
            {item.language && (
              <div className="flex items-center gap-2 text-grey text-sm">
                <Globe2 className="w-4 h-4" />
                <span aria-label="Language">{t("language." + item.language)}</span>
              </div>
            )}
          </div>
        )}
        <Text
          variant="h4"
          className="group-hover:text-blue-2 transition-colors"
        >
          {item.title}
        </Text>
        <Text className="text-grey">{item.excerpt}</Text>
        <div className="flex items-center gap-2 text-blue-2 group-hover:gap-3 transition-all">
          <span aria-label="Click to read full article">
            {t("insightsPage.readMore")}
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </>
  );

  if (isExternalLink) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link
      to={link}
      className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
    >
      {cardContent}
    </Link>
  );
}
