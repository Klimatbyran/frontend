import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { PageSEO } from "@/components/SEO/PageSEO";
import { Text } from "@/components/ui/text";

export function ErrorPage() {
  const { t } = useTranslation();
  const { code = "500" } = useParams<{ code?: string }>();

  const errorCode = code || "500";
  const isServerError = errorCode.startsWith("5");

  // Prepare SEO data
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

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
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
