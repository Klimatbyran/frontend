import { useParams } from "react-router-dom";
import { articleMetaData } from "@/lib/learn-more/articleList";
import { LearnMoreReporting } from "./LearnMoreReporting";

export function LearnMoreArticle() {
  const { id } = useParams();

  const currentArticle = articleMetaData.find((article) => article.id === id);

  if (!currentArticle) {
    return null;
  }
  switch (id) {
    case "reporting":
      return <LearnMoreReporting />;
    // Add more cases here as you create new article components
    default:
      return null;
  }
}
