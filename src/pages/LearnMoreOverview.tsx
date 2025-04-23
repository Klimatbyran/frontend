import { useTranslation } from "react-i18next";
import { ContentGridPage } from "@/components/layout/ContentGridPage";
import { ContentCard } from "@/components/layout/ContentCard";
import { articleMetaData } from "@/lib/learn-more/articleList";

export function LearnMoreOverview() {
  const { t } = useTranslation();

  const canonicalUrl = "https://klimatkollen.se/insights/learn-more-overview";
  const pageTitle = t("learnMoreOverview.title");
  const pageDescription = t("learnMoreOverview.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
  };

  const items = articleMetaData.map((article) => ({
    id: article.id,
    title: t(article.titleKey),
    excerpt: t(article.excerptKey),
    image: article.image || "",
  }));

  return (
    <ContentGridPage
      title={pageTitle}
      description={pageDescription}
      canonicalUrl={canonicalUrl}
      items={items}
      renderCard={(item) => <ContentCard item={item} basePath="learn-more" />}
      structuredData={structuredData}
    />
  );
}
