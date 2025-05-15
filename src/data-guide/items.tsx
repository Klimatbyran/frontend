import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";

const createTextHelpItem = (textKey: string) => () => {
  const { t } = useTranslation();

  return <p>{t(textKey)}</p>;
};

const createMarkdownHelpItem = (textKey: string) => () => {
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

type HelpItemWithId<K> = {
  id: K;
  title: string;
  component: React.ComponentType<{}>;
};

type HelpItems<T extends Record<string, {}>> = {
  [K in keyof T]: T[K] & { id: K };
};

function defineHelpItems<T extends { [K in keyof T]: HelpItemWithId<K> }>(
  dict: T,
): HelpItems<T> {
  return dict as HelpItems<T>;
}

/*
 * All available help items are defined here.
 */
export const helpItems = defineHelpItems({
  tco2e: {
    id: "tco2e",
    title: "tCO2e",
    component: createMarkdownHelpItem("dataGuide.items.tco2eMarkdown"),
  },
  companySector: {
    id: "companySector",
    title: "Company Sectors",
    component: createMarkdownHelpItem("dataGuide.items.companySectorsMarkdown"),
  },
  scopes: {
    id: "scopes",
    title: "Scopes",
    component: createMarkdownHelpItem("dataGuide.items.scopesMarkdown"),
  },
  baseYear: {
    id: "baseYear",
    title: "Base year",
    component: createTextHelpItem("dataGuide.items.baseYear"),
  },
  changeRate: {
    id: "changeRate",
    title: "Change rate",
    component: createTextHelpItem("dataGuide.items.changeRate"),
  },
  companyTurnover: {
    id: "companyTurnover",
    title: "Turnover",
    component: createTextHelpItem("dataGuide.items.companyTurnover"),
  },
});

export type HelpItemId = keyof typeof helpItems;
export type HelpItem = HelpItemWithId<HelpItemId>;
