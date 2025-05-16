import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export const createTextHelpItem = (textKey: string) => () => {
  const { t } = useTranslation();

  return <p>{t(textKey)}</p>;
};

export const createMarkdownHelpItem = (textKey: string) => () => {
  const { t } = useTranslation();

  return (
    <Markdown
      remarkPlugins={[remarkBreaks]}
      components={{
        ol: ({ node, children, ...props }) => (
          <ol {...props} className="list-decimal list-inside mt-4">
            {children}
          </ol>
        ),
        ul: ({ node, children, ...props }) => (
          <ul {...props} className="list-disc list-inside mt-4">
            {children}
          </ul>
        ),
      }}
    >
      {t(textKey, { joinArrays: "\n" })}
    </Markdown>
  );
};

// Add type safety to defining and using help items.
export type HelpItemWithId<K> = {
  id: K;
  title: string;
  component: React.ComponentType<object>;
};

type HelpItems<T extends Record<string, object>> = {
  [K in keyof T]: T[K] & { id: K };
};

export function defineHelpItems<
  T extends { [K in keyof T]: HelpItemWithId<K> },
>(dict: T): HelpItems<T> {
  return dict as HelpItems<T>;
}
