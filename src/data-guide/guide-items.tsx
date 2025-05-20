import {
  createMarkdownHelpItem,
  defineHelpItems,
  HelpItemWithId,
} from "./guide-item-helpers";

// All available help items are defined here.
export const dataGuideHelpItems = defineHelpItems({
  tco2e: {
    id: "tco2e",
    title: "tCO2e",
    component: createMarkdownHelpItem("dataGuide.items.tco2e"),
  },
  companySector: {
    id: "companySector",
    title: "Company Sectors",
    component: createMarkdownHelpItem("dataGuide.items.companySectors"),
  },
  scopes: {
    id: "scopes",
    title: "Scopes",
    component: createMarkdownHelpItem("dataGuide.items.scopes"),
  },
  baseYear: {
    id: "baseYear",
    title: "Base year",
    component: createMarkdownHelpItem("dataGuide.items.baseYear"),
  },
  changeRate: {
    id: "changeRate",
    title: "Change rate",
    component: createMarkdownHelpItem("dataGuide.items.changeRate"),
  },
  companyTurnover: {
    id: "companyTurnover",
    title: "Turnover",
    component: createMarkdownHelpItem("dataGuide.items.companyTurnover"),
  },
});

// Provide type safety for `useDataGudie`
export type HelpItemId = keyof typeof dataGuideHelpItems;
export type HelpItem = HelpItemWithId<HelpItemId>;
