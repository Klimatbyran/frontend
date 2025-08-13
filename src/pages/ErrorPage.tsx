import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useConfig } from "vike-react/useConfig";
import { Text } from "@/components/ui/text";
import { useEffect } from "react";

export function ErrorPage() {
  const { t } = useTranslation();
  const { code = "500" } = useParams<{ code?: string }>();
  const config = useConfig();

  const errorCode = code || "500";
  const isServerError = errorCode.startsWith("5");

  useEffect(() => {
    const canonicalUrl = `https://klimatkollen.se/error/${errorCode}`;
    const pageTitle = `${errorCode} - ${t("errorPage.title")} - Klimatkollen`;
    const pageDescription = t(
      isServerError ? "errorPage.serverDescription" : "errorPage.description",
    );

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("errorPage.title"),
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
  }, [errorCode, isServerError, t, config]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <Text variant="h1" className="text-6xl mb-4">
          {errorCode}
        </Text>
        <Text variant="h2" className="mb-8">
          {isServerError ? t("errorPage.serverTitle") : t("errorPage.title")}
        </Text>
        <Text className="mb-8 max-w-md">
          {isServerError
            ? t("errorPage.serverDescription")
            : t("errorPage.description")}
        </Text>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-5 text-white rounded-full hover:bg-blue-4 transition-colors"
          >
            {t("errorPage.backToHome")}
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-blue-5 text-blue-5 rounded-full hover:bg-blue-5/10 transition-colors"
          >
            {t("errorPage.tryAgain")}
          </button>
        </div>
      </div>
    </>
  );
}
