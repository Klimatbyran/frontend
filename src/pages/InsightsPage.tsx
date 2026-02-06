import { CalendarDays, Clock, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { ContentGridPage } from "@/components/layout/ContentGridPage";
import { ContentCard } from "@/components/layout/ContentCard";
import { localizeUnit } from "@/utils/formatting/localization";

export function InsightsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { blogPosts } = useBlogPosts();

  const featuredPost = isMobile ? undefined : blogPosts[0];
  const otherPosts = isMobile ? blogPosts.slice(0) : blogPosts.slice(1);

  const canonicalUrl = "https://klimatkollen.se/insights/articles";
  const pageTitle = t("insightsPage.title");
  const pageDescription = t("insightsPage.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
  };

  const items = otherPosts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image || "/images/default-blog-image.jpg",
    category: t("insightCategories." + post.category),
    date: post.date,
    readTime: post.readTime,
    language: post.language,
  }));

  const featuredPostSection = featuredPost && (
    <div className="relative rounded-level-1">
      <Link
        to={`/${currentLanguage}/insights/${featuredPost.id}`}
        className="group block transition-all duration-300"
      >
        <div className="absolute inset-0 rounded-level-1 shadow-[0_0_40px_rgba(153,207,255,0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="relative h-[500px] overflow-hidden rounded-level-1">
          <img
            src={featuredPost.image}
            alt={featuredPost.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-16 space-y-4">
            <div className="flex items-center gap-4">
              <span
                aria-label="Category"
                className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm"
              >
                {t("insightCategories." + featuredPost.category)}
              </span>
              <div className="flex items-center gap-2 text-grey text-sm">
                <CalendarDays className="w-4 h-4" />
                <span aria-label="Date Published">
                  {localizeUnit(new Date(featuredPost.date), currentLanguage)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-grey text-sm">
                <Clock className="w-4 h-4" />
                <span aria-label="Read Time">{featuredPost.readTime}</span>
              </div>
              <div className="flex items-center gap-2 text-grey text-sm">
                <Globe2 className="w-4 h-4" />
                <span aria-label="Language">
                  {t("language." + featuredPost.language)}
                </span>
              </div>
            </div>
            <Text
              variant="h2"
              className="group-hover:text-blue-2 transition-colors"
            >
              {featuredPost.title}
            </Text>
            <Text className="text-grey max-w-2xl">{featuredPost.excerpt}</Text>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <ContentGridPage
      title={pageTitle}
      description={pageDescription}
      canonicalUrl={canonicalUrl}
      items={items}
      renderCard={(item) => <ContentCard item={item} basePath="insights" />}
      structuredData={structuredData}
      featuredPost={featuredPostSection}
    />
  );
}
