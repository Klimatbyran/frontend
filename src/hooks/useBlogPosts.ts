import { useLanguage } from "@/components/LanguageProvider";
import { blogMetadataByLanguage, blogMetadata } from "@/lib/blog/blogPostsList";

const markdownFiles = import.meta.glob("/src/lib/blog/posts/*.md", {
  as: "raw",
  eager: true,
});

export function useBlogPosts() {
  const { currentLanguage } = useLanguage();
  return blogMetadataByLanguage[currentLanguage] || [];
}

export function useBlogPost(id: string) {
  const { currentLanguage } = useLanguage();
  const blogPosts = useBlogPosts();

  // First try to find a post with the current language
  let metadata = blogPosts.find(
    (post) => post.id === id && post.language === currentLanguage,
  );

  // If not found, fall back to any post with the same id that should be displayed in current language
  if (!metadata) {
    metadata = blogMetadata.find(
      (post) =>
        post.id === id &&
        (post.displayLanguages.includes(currentLanguage) ||
          post.displayLanguages.includes("all")),
    );
  }

  if (!metadata) {
    return { blogPost: null, loading: false, error: "Post not found" };
  }

  // Try current language first
  let filePath = `/src/lib/blog/posts/${id}-${currentLanguage}.md`;
  let rawMarkdown = markdownFiles[filePath];

  // Fallback to original language
  if (!rawMarkdown) {
    filePath = `/src/lib/blog/posts/${id}-${metadata.language}.md`;
    rawMarkdown = markdownFiles[filePath];
  }

  // Final fallback if no language indicated in filename
  if (!rawMarkdown) {
    filePath = `/src/lib/blog/posts/${id}.md`;
    rawMarkdown = markdownFiles[filePath];
  }

  if (!rawMarkdown) {
    return { blogPost: null, loading: false, error: "Content not found" };
  }

  const extractMetadata = (rawMarkdown: string) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    return rawMarkdown.replace(frontmatterRegex, "").trim();
  };

  const content = extractMetadata(rawMarkdown);
  return { blogPost: { metadata, content }, loading: false, error: null };
}
