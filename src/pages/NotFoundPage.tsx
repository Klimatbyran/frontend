import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useConfig } from "vike-react/useConfig";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { useEffect } from "react";

export function NotFoundPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const config = useConfig();

  // Use the current language for any links on the 404 page
  const homePath = `/${currentLanguage}/`;

  useEffect(() => {
    const canonicalUrl = "https://klimatkollen.se/404";
    const pageTitle = `404 - ${t("notFoundPage.title")} - Klimatkollen`;
    const pageDescription = t("notFoundPage.description");

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("notFoundPage.title"),
      description: pageDescription,
      url: canonicalUrl,
    };

    config({
      title: pageTitle,
      description: pageDescription,
      Head: () => (
        <>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content="/images/social-picture.png" />
          <link rel="canonical" href={canonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </>
      ),
    });
  }, [t, config]);

  return (
    <>
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
