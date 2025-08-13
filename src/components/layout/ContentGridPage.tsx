import { PageHeader } from "@/components/layout/PageHeader";
import { useConfig } from "vike-react/useConfig";
import { useEffect } from "react";

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
  const config = useConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const pageTitle = `${title} - Klimatkollen`;
    
    config({
      title: pageTitle,
      description,
      Head: () => (
        <>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content="/images/social-picture.png" />
          <link rel="canonical" href={canonicalUrl} />
          {structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </>
      ),
    });
  }, [title, description, canonicalUrl, structuredData, config]);

  return (
    <>
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
