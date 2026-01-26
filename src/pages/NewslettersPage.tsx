import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import { NewsletterNavigation } from "@/components/newsletters/NewsletterNavigation";
import { NewsletterType } from "@/lib/newsletterArchive/newsletterData";
import { useNewsletters } from "@/hooks/useNewsletters";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";
import { Text } from "@/components/ui/text";
import { NewsletterPopover } from "@/components/newsletters/NewsletterPopover";

export function NewsLetterArchivePage() {
  const { t } = useTranslation();
  const pageTitle = t("newsletterArchivePage.title");
  const pageDescription = t("newsletterArchivePage.description");
  const { isMobile } = useScreenSize();
  const [displayedNewsletter, setDisplayedNewsletter] =
    useState<NewsletterType | null>(null);
  const { data, isLoading, isError } = useNewsletters();

  useEffect(() => {
    if (data) {
      if (data && data.length > 0) {
        setDisplayedNewsletter(data[0]);
      }
    }
  }, [data]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: buildAbsoluteUrl("/newsletter-archive"),
  };

  const seoMeta = {
    title: `${pageTitle} - Klimatkollen`,
    description: pageDescription,
    canonical: "/newsletter-archive",
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

  if (isLoading) return <Text>{t("newsletterArchivePage.loading")}</Text>;
  if (isError) return <Text>{t("newsletterArchivePage.error")}</Text>;

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-white gap-4">
        <PageHeader title={pageTitle} description={pageDescription} />
        <div
          className={`${isMobile ? "flex flex-col" : "flex"} mt-6 relative md:flex-col lg:flex-row gap-8`}
        >
          {isMobile && (
            <NewsletterPopover buttonText={t("header.newsletter")} />
          )}
          <NewsletterNavigation
            newsletterList={data}
            setDisplayedNewsletter={setDisplayedNewsletter}
            displayedNewsLetter={displayedNewsletter}
          />

          {displayedNewsletter && (
            <iframe
              className="rounded-md min-h-screen w-full bg-black-2"
              src={`${displayedNewsletter.long_archive_url}#view=FitH`}
              height={800}
              width={1000}
            />
          )}
        </div>
      </div>
    </>
  );
}
