export type ArticleMeta = {
  id: string;
  titleKey: string;
  excerptKey: string;
  image?: string;
  link?: string;
  nextArticle?: string[];
};

export const articleMetaData: ArticleMeta[] = [
  {
    id: "reporting",
    titleKey: "learnMoreOverview.reporting.title",
    excerptKey: "learnMoreOverview.reporting.excerpt",
    image: "/images/learnMoreImages/reporting.png",
  },
];
