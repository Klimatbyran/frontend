import { load } from "js-yaml";
import { ContentMeta } from "@/types/content";
import { useLanguage } from "@/components/LanguageProvider";
import { blogMetadataByLanguage } from "@/lib/blog/blogPostsList";
import { SUPPORTED_LANGUAGES } from "@/lib/languageDetection";

const markdownFiles = import.meta.glob("/src/lib/blog/posts/*.md", {
  as: "raw",
  eager: true,
});

export function useBlogPosts() {
  const { currentLanguage } = useLanguage();

  const blogPostsLoading = false;
  let blogPostsError = null;
  let blogPosts: ContentMeta[] = [];

  try {
    blogPosts =
      blogMetadataByLanguage[currentLanguage]
        .map((b) => getBlogPost(b, currentLanguage).blogPost?.metadata)
        .filter((b) => b != null) || [];
  } catch (e) {
    blogPostsError = e;
  }

  return { blogPosts, blogPostsLoading, blogPostsError };
}

export function useBlogPost(id: string) {
  const { currentLanguage } = useLanguage();
  const blogPostsMetadata = blogMetadataByLanguage[currentLanguage];

  const metadata = blogPostsMetadata.find((m) => m.id === id);

  return getBlogPost(metadata, currentLanguage);
}

export function getBlogPost(
  metadata: { id: string; displayLanguages: string[] } | undefined,
  currentLanguage: string,
) {
  if (!metadata) {
    return { blogPost: null, loading: false, error: "Post not found" };
  }

  // Try current language first
  let filePath = `/src/lib/blog/posts/${metadata.id}-${currentLanguage}.md`;
  let rawMarkdown = markdownFiles[filePath];

  // Fallback to any of the other display languages
  if (!rawMarkdown) {
    for (const l of metadata.displayLanguages.includes("all")
      ? SUPPORTED_LANGUAGES
      : metadata.displayLanguages) {
      if (l !== currentLanguage) {
        filePath = `/src/lib/blog/posts/${metadata.id}-${l}.md`;
        rawMarkdown = markdownFiles[filePath];

        if (rawMarkdown) {
          break;
        }
      }
    }
  }
  // Final fallback if no language indicated in filename
  if (!rawMarkdown) {
    filePath = `/src/lib/blog/posts/${metadata.id}.md`;
    rawMarkdown = markdownFiles[filePath];
  }

  if (!rawMarkdown) {
    return {
      blogPost: null,
      blogPostsLoading: false,
      blogPostsError: "Content not found",
    };
  }

  const normalizedMarkdown = rawMarkdown.replace(/\r\n/g, "\n");
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const frontmatter = normalizedMarkdown.match(frontmatterRegex);

  if (!frontmatter) {
    return {
      blogPost: null,
      blogPostsLoading: false,
      blogPostsError: "No frontmatter found.",
    };
  }

  const parsedMarkdown = load(frontmatter[1]) as ContentMeta;
  parsedMarkdown.displayLanguages = metadata.displayLanguages;

  return {
    blogPost: {
      metadata: parsedMarkdown,
      content: normalizedMarkdown.replace(frontmatter[0], "").trim(),
    },
    blogPostsLoading: false,
    blogPostsError: null,
  };
}
