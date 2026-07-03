import { Link } from "react-router-dom";
import { CalendarDays, Clock } from "lucide-react";
import { type Components } from "react-markdown";
import { Text } from "@/components/ui/text";
import { localizeUnit } from "@/utils/formatting/localization";
import { buildAbsoluteUrl } from "@/utils/seo";
interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}

export const blogMarkdownComponents: Components = {
  img: ({ node, ...props }) => (
    <img
      {...props}
      className="w-2/3 mx-auto shadow-lg !rounded-lg !overflow-hidden"
      loading="lazy"
    />
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-white"
    />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-8">
      <table {...props} className="w-full overflow-hidden" />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead {...props} className="bg-blue-5/20" />
  ),
  th: ({ node, ...props }) => (
    <th
      {...props}
      className="border border-blue-2/50 px-4 py-3 text-left font-semibold text-blue-2"
    />
  ),
  td: ({ node, ...props }) => (
    <td {...props} className="border border-slate-500/50 px-4 py-3" />
  ),
};

export function buildArticleStructuredData({
  blogPost,
  postCanonicalUrl,
}: {
  blogPost: {
    metadata: {
      title: string;
      excerpt: string;
      image?: string;
      date: string;
      author?: { name: string };
    };
  };
  postCanonicalUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blogPost.metadata.title,
    description: blogPost.metadata.excerpt,
    image: blogPost.metadata.image
      ? buildAbsoluteUrl(blogPost.metadata.image)
      : undefined,
    datePublished: blogPost.metadata.date,
    author: blogPost.metadata.author
      ? { "@type": "Person", name: blogPost.metadata.author.name }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Klimatkollen",
      logo: {
        "@type": "ImageObject",
        url: "https://klimatkollen.se/images/social-picture.png",
      },
    },
    url: postCanonicalUrl,
  };
}

interface BlogHeroSectionProps {
  blogPost: {
    metadata: {
      category: string;
      date: string;
      readTime: string;
      title: string;
      excerpt: string;
      image: string;
      author?: {
        name: string;
        avatar: string;
      };
    };
  };
  isMobile: boolean;
  currentLanguage: string;
  categoryLabel: string;
}

export function BlogHeroSection({
  blogPost,
  isMobile,
  currentLanguage,
  categoryLabel,
}: BlogHeroSectionProps) {
  return (
    <>
      <div className={`space-y-${isMobile ? "4" : "8"}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm">
            {categoryLabel}
          </span>
          <div className="flex items-center gap-2 text-grey text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>
              {localizeUnit(new Date(blogPost.metadata.date), currentLanguage)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-grey text-sm">
            <Clock className="w-4 h-4" />
            <span>{blogPost.metadata.readTime}</span>
          </div>
        </div>

        <Text
          variant={isMobile ? "h1" : "display"}
          className={isMobile ? "text-3xl" : ""}
        >
          {blogPost.metadata.title}
        </Text>

        <Text variant="body" className="text-grey max-w-3xl">
          {blogPost.metadata.excerpt}
        </Text>
      </div>

      <div
        className={`relative ${
          isMobile ? "h-[250px]" : "h-[500px]"
        } rounded-level-1 overflow-hidden`}
      >
        <img
          src={blogPost.metadata.image}
          alt={blogPost.metadata.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {blogPost.metadata.author && (
        <div className="flex items-center gap-4 p-8 bg-black-2 rounded-level-2">
          <img
            src={blogPost.metadata.author.avatar}
            alt={blogPost.metadata.author.name}
            className="w-16 h-16 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <Text variant="body">{blogPost.metadata.author.name}</Text>
          </div>
        </div>
      )}
    </>
  );
}

interface BlogRelatedPostsProps {
  relatedPosts: RelatedPost[];
  title: string;
}

export function BlogRelatedPosts({
  relatedPosts,
  title,
}: BlogRelatedPostsProps) {
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Text variant="h3">{title}</Text>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/insights/${post.id}`}
            className="group bg-black-2 rounded-level-2 overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm">
                  {post.category}
                </span>
                <div className="flex items-center gap-2 text-grey text-sm">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {new Date(post.date).toLocaleDateString("sv-SE")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-grey text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <Text
                variant="h4"
                className="group-hover:text-blue-2 transition-colors"
              >
                {post.title}
              </Text>
              <Text className="text-grey">{post.excerpt}</Text>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
