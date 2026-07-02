import { BarChart3 } from "lucide-react";
import { NavLink, NavSubLink } from "./types";

/**
 * To hide a nav item until it's ready for prod (only show on localhost/stage):
 * - Add onlyShowOnStaging: true to the link or sublink.
 * - The item will be filtered out when stagingFeatureFlagEnabled() is false (production).
 * - When ready for prod, remove onlyShowOnStaging and ensure the route is not wrapped in StagingProtectedRoute (see routes.tsx).
 */
export const NAV_LINKS: NavLink[] = [
  {
    label: "header.data",
    icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
    path: `/explore`,
    sublinks: [
      {
        label: "header.explore",
        path: `/explore/municipalities`,
      },
      {
        label: "header.territorialEmissions",
        items: [
          {
            label: "header.nation",
            path: `/nation`,
          },
          {
            label: "header.regions",
            path: `/regions`,
          },
          {
            label: "header.municipalities",
            path: `/municipalities`,
          },
        ],
      },
      {
        label: "header.companies",
        items: [
          {
            label: "header.allCompanies",
            path: `/companies`,
          },
          {
            label: "header.sectors",
            path: `/sectors`,
          },
        ],
      },
    ],
  },
  {
    path: `/articles`,
    label: "header.insights",
    sublinks: [
      { label: "header.reports", path: `/reports` },
      { label: "header.articles", path: `/articles` },
      { label: "header.learnMore", path: `/learn-more` },
    ],
  },
  {
    label: "header.about",
    path: `/about`,
    sublinks: [
      { label: "header.aboutUs", path: `/about` },
      {
        label: "header.methodology",
        path: `/methodology?view=general`,
      },
      {
        label: "header.newsletterArchive",
        path: `/newsletter-archive`,
      },
      {
        label: "header.press",
        path: "https://www.mynewsdesk.com/se/klimatbyraan/latest_news",
      },
      { label: "header.support", path: `/support` },
      { label: "header.dataDownload", path: `/data-download` },
    ],
  },
];

export const INTERNAL_LINKS: NavSubLink[] = [
  {
    label: "Validation Dashboard",
    path: "/internal-pages/validation-dashboard",
  },
  { label: "Requests Dashboard", path: "/internal-pages/requests-dashboard" },
  { label: "Internal Dashboard", path: "/internal-pages/internal-dashboard" },
  {
    label: "Trend Analysis Dashboard",
    path: "/internal-pages/trend-analysis-dashboard",
  },
  { label: "Add Company", path: "/internal-pages/add-company" },
];
