import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataGuideItemId } from "./items";

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
        h1: ({ node, children, ...props }) => (
          <h1 {...props} className="text-xl font-semibold mt-6 mb-3">
            {children}
          </h1>
        ),
        h2: ({ node, children, ...props }) => (
          <h2 {...props} className="text-lg font-semibold mt-6 mb-2">
            {children}
          </h2>
        ),
        h3: ({ node, children, ...props }) => (
          <h3 {...props} className="text-base font-semibold mt-4 mb-2">
            {children}
          </h3>
        ),
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
