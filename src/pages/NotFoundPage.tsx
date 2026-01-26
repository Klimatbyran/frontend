import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";

export function NotFoundPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Prepare SEO data
  const pageTitle = `404 - ${t("notFoundPage.title")} - Klimatkollen`;
  const pageDescription = t("notFoundPage.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("notFoundPage.title"),
    description: pageDescription,
    url: buildAbsoluteUrl("/404"),
  };

  const seoMeta = {
    title: pageTitle,
    description: pageDescription,
    canonical: "/404",
    noindex: true, // Don't index 404 pages
    og: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: pageTitle,
      description: pageDescription,
    },
    structuredData,
  };

  // Use the current language for any links on the 404 page
  const homePath = `/${currentLanguage}/`;

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <Text variant="h1" className="text-6xl mb-4">
          404
        </Text>
        <Text variant="h2" className="mb-8">
          {t("notFoundPage.title")}
        </Text>
        <Text className="mb-8 max-w-md">{t("notFoundPage.description")}</Text>
        <Link
          to={homePath}
          className="px-6 py-3 bg-blue-5 text-white rounded-full hover:bg-blue-4 transition-colors"
        >
          {t("notFoundPage.backToHome")}
        </Link>
      </div>
    </>
  );
}
