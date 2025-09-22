import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { DataGuideItemId } from "./items";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

type DataGuideMarkdownProps = {
  item: DataGuideItemId;
  className?: string;
};
export const DataGuideMarkdown = ({
  className,
  item,
}: DataGuideMarkdownProps) => {
  const { t } = useTranslation("dataguideItems");
  return (
    <Markdown
      className={cn(className)}
      remarkPlugins={[remarkBreaks]}
      components={{
        ol: ({ node, children, ...props }) => (
          <ol {...props} className="list-decimal list-outside mt-2">
            {children}
          </ol>
        ),
        ul: ({ node, children, ...props }) => (
          <ul {...props} className="list-disc list-outside ml-6 my-4">
            {children}
          </ul>
        ),
        li: ({ node, children, ...props }) => (
          <li {...props} className="my-1">
            {children}
          </li>
        ),
        p: ({ node, children, ...props }) => (
          <p
            {...props}
            className="my-4 first:mt-0 md:first:mt-4 last:mb-0 whitespace-pre-wrap leading-relaxed"
          >
            {children}
          </p>
        ),
        a: ({ node, children, ...props }) => (
          <a
            {...props}
            className="inline-flex items-center gap-2 text-blue-2 hover:text-blue-1"
            target="_blank"
          >
            {children}
            <ArrowUpRight className="w-4 h-4 sm:w-3 sm:h-3" />
          </a>
        ),
      }}
    >
      {t(`${item}.content`, { joinArrays: " " })}
    </Markdown>
  );
};
