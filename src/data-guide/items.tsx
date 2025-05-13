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
      {t(textKey)}
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
    component:
      createTextHelpItem(`tCO2e stands for "tonnes of carbon dioxide equivalent". It's a
    standardized measure that converts the impact of various greenhouse gases
    into the equivalent amount of CO2.`),
  },
  companySector: {
    id: "companySector",
    title: "Company Sectors",
    component: createMarkdownHelpItem(
      `
We have diveded companies into different sectors to make it easier to compare companies against each other.

The available sectors are:

- Industrials
- Energy
- Consumer Discretionary
- ...
      `,
    ),
  },
  scopes: {
    id: "scopes",
    title: "Scopes",
    component: createMarkdownHelpItem(
      `
GHG-protokollet, i EU-direktivet Corporate Sustainability Reporting Directive, är den etablerade standarden för rapportering av växthusgasutsläpp.

Dessa utsläpp delas upp i tre scope:
1. **Scope 1** – direkta utsläpp från den egna verksamheten
2. **Scope 2** – indirekta utsläpp från inköpt energi
3. **Scope 3** – alla utsläpp i värdekedjan, som i sin tur delas upp i 15 kategorier`,
    ),
  },
  baseYear: {
    id: "baseYear",
    title: "Base year",
    component: createTextHelpItem(
      `The base year is a specific year used as a reference point to compare future emissions`,
    ),
  },
  changeRates: {
    id: "changeRates",
    title: "Change rate",
    component: createTextHelpItem(
      `The emission change rate compared to previous year`,
    ),
  },
  companyTurnover: {
    id: "companyTurnover",
    title: "Turnover",
    component: createTextHelpItem(
      `The company turnover is their total revenue or sales. It is important not to confuse this with the profit.`,
    ),
  },
});

export type HelpItemId = keyof typeof helpItems;
export type HelpItem = HelpItemWithId<HelpItemId>;
