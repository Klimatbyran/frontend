import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category?: string;
  date?: string;
  readTime?: string;
  link?: string;
}

interface ContentGridPageProps {
  title: string;
  description: string;
  canonicalUrl: string;
  items: ContentItem[];
  renderCard: (item: ContentItem) => React.ReactNode;
  structuredData?: any;
  featuredPost?: React.ReactNode;
}

export function ContentGridPage({
  title,
  description,
  canonicalUrl,
  items,
  renderCard,
  structuredData,
  featuredPost,
}: ContentGridPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageTitle = `${title} - Klimatkollen`;

  // Extract canonical path from URL (remove origin if present)
  const canonicalPath = canonicalUrl.startsWith("http")
    ? new URL(canonicalUrl).pathname
    : canonicalUrl;

  const seoMeta = {
    title: pageTitle,
    description: description,
    canonical: canonicalPath,
    og: {
      title: pageTitle,
      description: description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: pageTitle,
      description: description,
    },
    structuredData,
  };

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        <PageHeader title={title} description={description} />
        {featuredPost && (
          <div className="max-w-[1150px] mx-auto">{featuredPost}</div>
        )}
        <div className="max-w-[1150px] mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item) => renderCard(item))}
          </div>
        </div>
      </div>
    </>
  );
}
