import { useTranslation } from "react-i18next";
import { Heart, Code, Handshake, Building, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SupportMethod } from "@/components/support/SupportMethod";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";

type SupportReadMoreContent = {
  header: string;
  intro: string[];
  benefitsHeader: string;
  benefits: string[];
  cost: string;
};

export function SupportPage() {
  const { t } = useTranslation();

  // Prepare SEO data
  const pageTitle = `${t("supportPage.header.title")} - Klimatkollen`;
  const pageDescription = t("supportPage.header.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("supportPage.header.title"),
    description: pageDescription,
    url: buildAbsoluteUrl("/support"),
  };

  const seoMeta = {
    title: pageTitle,
    description: pageDescription,
    canonical: "/support",
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

  const partnerEmailLink = `mailto:hej@klimatkollen.se?subject=${encodeURIComponent(t("supportPage.partnerships.email.subject"))}&body=${encodeURIComponent(t("supportPage.partnerships.email.body"))}`;
  const donateEmailLink = `mailto:hej@klimatkollen.se?subject=${encodeURIComponent(t("supportPage.donations.email.subject"))}&body=${encodeURIComponent(t("supportPage.donations.email.body"))}`;
  const organizationEmailLink = `mailto:hej@klimatkollen.se?subject=${encodeURIComponent(t("supportPage.organizationSupport.email.subject"))}&body=${encodeURIComponent(t("supportPage.organizationSupport.email.body"))}`;

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-white">
        <PageHeader
          title={t("supportPage.header.title")}
          description={t("supportPage.header.description")}
        />

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <SupportMethod
            icon={<Heart className="w-6 h-6 text-pink-3" />}
            title={t("supportPage.donations.title")}
            description={t("supportPage.donations.description")}
            details={t("supportPage.donations.details", {
              returnObjects: true,
            })}
            action={{
              text: t("supportPage.donations.action.text"),
              link: donateEmailLink,
            }}
          />

          <SupportMethod
            icon={<Building className="w-6 h-6 text-orange-3" />}
            title={t("supportPage.organizationSupport.title")}
            description={t("supportPage.organizationSupport.description")}
            details={t("supportPage.organizationSupport.details", {
              returnObjects: true,
            })}
            action={{
              text: t("supportPage.organizationSupport.action.text"),
              link: organizationEmailLink,
            }}
            readMore={{
              text: t("supportPage.organizationSupport.readMore.text"),
              content: t("supportPage.organizationSupport.readMore.content", {
                returnObjects: true,
              }) as SupportReadMoreContent,
            }}
          />

          <SupportMethod
            icon={<Code className="w-6 h-6 text-green-3" />}
            title={t("supportPage.openSource.title")}
            description={t("supportPage.openSource.description")}
            details={t("supportPage.openSource.details", {
              returnObjects: true,
            })}
            action={{
              text: t("supportPage.openSource.action.text"),
              link: t("supportPage.openSource.action.link"),
            }}
          />

          <SupportMethod
            icon={<Users className="w-6 h-6 text-orange-1" />}
            title={t("supportPage.volunteer.title")}
            description={t("supportPage.volunteer.description")}
            details={t("supportPage.volunteer.details", {
              returnObjects: true,
            })}
            action={{
              text: t("supportPage.volunteer.action.text"),
              link: t("supportPage.volunteer.action.link"),
            }}
          />

          <SupportMethod
            icon={<Handshake className="w-6 h-6 text-blue-3" />}
            title={t("supportPage.partnerships.title")}
            description={t("supportPage.partnerships.description")}
            details={t("supportPage.partnerships.details", {
              returnObjects: true,
            })}
            action={{
              text: t("supportPage.partnerships.action.text"),
              link: partnerEmailLink,
            }}
          />
        </div>

        <div className="mt-12 card-dark text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("supportPage.contact.title")}
          </h2>
          <p className="text-grey mb-4">
            {t("supportPage.contact.description")}
          </p>
          <a
            href={t("supportPage.contact.action.link")}
            className="inline-block bg-black-1 hover:bg-black-2 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            {t("supportPage.contact.action.text")}
          </a>
        </div>
      </div>
    </>
  );
}
