import { BarChart3, Menu, X, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import useHeaderTitle from "@/hooks/useHeaderTitle";
import { useAuth } from "@/contexts/AuthContext";
import { localizedPath } from "@/utils/routing";
import { stagingFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { NewsletterPopover } from "../newsletters/NewsletterPopover";
import { useLanguage } from "../LanguageProvider";
import { HeaderSearchButton } from "../search/HeaderSearchButton";
import { LocalizedLink } from "../LocalizedLink";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

interface NavSubLink {
  label: string;
  path: string;
  shortcut?: string;
  onlyShowOnStaging?: boolean;
}

interface NavSubGroup {
  label: string;
  path?: string;
  items: NavSubLink[];
}

type NavSubItem = NavSubLink | NavSubGroup;

interface NavLink {
  label: string;
  icon?: React.ReactElement;
  path: string;
  sublinks?: NavSubItem[];
  onlyShowOnStaging?: boolean;
}

function isNavSubGroup(item: NavSubItem): item is NavSubGroup {
  return "items" in item;
}

/**
 * To hide a nav item until it's ready for prod (only show on localhost/stage):
 * - Add onlyShowOnStaging: true to the link or sublink.
 * - The item will be filtered out when stagingFeatureFlagEnabled() is false (production).
 * - When ready for prod, remove onlyShowOnStaging and ensure the route is not wrapped in StagingProtectedRoute (see routes.tsx).
 */
const NAV_LINKS: NavLink[] = [
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
        label: "header.sweden",
        path: `/nation`,
        items: [
          {
            label: "header.municipalities",
            path: `/municipalities`,
          },
          {
            label: "header.regions",
            path: `/regions`,
          },
        ],
      },
      {
        label: "header.companies",
        path: `/companies`,
        items: [
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

// Internal links for signed-in users
const INTERNAL_LINKS = [
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

function filterNavSubItem(
  item: NavSubItem,
  isStaging: boolean,
): NavSubItem | null {
  if (isNavSubGroup(item)) {
    const items = item.items.filter(
      (sublink) => !sublink.onlyShowOnStaging || isStaging,
    );
    return items.length > 0 ? { ...item, items } : null;
  }

  if (item.onlyShowOnStaging && !isStaging) {
    return null;
  }

  return item;
}

function filterNavSublinks(
  sublinks: NavSubItem[],
  isStaging: boolean,
): NavSubItem[] {
  return sublinks
    .map((item) => filterNavSubItem(item, isStaging))
    .filter((item): item is NavSubItem => item !== null);
}

const NAV_TITLE_CLASS =
  "block rounded-md px-2 py-1.5 text-sm font-medium text-white hover:bg-black-1 transition-colors";
const NAV_SUB_ITEM_CLASS =
  "block rounded-md py-1 text-sm text-grey hover:bg-black-1 hover:text-white transition-colors";

const NavSubLinkItem = ({
  sublink,
  className,
  onNavigate,
}: {
  sublink: NavSubLink;
  className?: string;
  onNavigate?: () => void;
}) => {
  const { t } = useTranslation();

  if (sublink.path.startsWith("https://")) {
    return (
      <a
        href={sublink.path}
        className={cn("w-full", className)}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        {t(sublink.label)}
      </a>
    );
  }

  return (
    <LocalizedLink
      to={sublink.path}
      className={cn("w-full", className)}
      onClick={onNavigate}
    >
      {t(sublink.label)}
    </LocalizedLink>
  );
};

const NavSubGroupSection = ({
  group,
  onNavigate,
}: {
  group: NavSubGroup;
  onNavigate?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {group.path ? (
        <NavSubLinkItem
          sublink={{ label: group.label, path: group.path }}
          className={NAV_TITLE_CLASS}
          onNavigate={onNavigate}
        />
      ) : (
        <span className={cn(NAV_TITLE_CLASS, "hover:bg-transparent")}>
          {t(group.label)}
        </span>
      )}
      <ul className="flex flex-col pl-3">
        {group.items.map((sublink) => (
          <li
            key={sublink.path}
            className="group/sub flex items-center gap-2 rounded-md pl-1 hover:bg-black-1"
          >
            <span
              className="text-grey group-hover/sub:text-white select-none transition-colors"
              aria-hidden="true"
            >
              –
            </span>
            <NavSubLinkItem
              sublink={sublink}
              className={cn(
                NAV_SUB_ITEM_CLASS,
                "hover:bg-transparent group-hover/sub:text-white",
              )}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const SubLinksMenu = ({
  sublinks,
  onNavigate,
}: {
  sublinks: NavSubItem[];
  onNavigate?: () => void;
}) => {
  return (
    <ul className="flex flex-col gap-2">
      {sublinks.map((item) =>
        isNavSubGroup(item) ? (
          <li key={item.label}>
            <NavSubGroupSection group={item} onNavigate={onNavigate} />
          </li>
        ) : (
          <li key={item.path}>
            <NavSubLinkItem
              sublink={item}
              className={NAV_TITLE_CLASS}
              onNavigate={onNavigate}
            />
          </li>
        ),
      )}
    </ul>
  );
};

export function Header() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMobileNav = useCallback(() => setMenuOpen(false), []);
  const { user } = useAuth();
  const { headerTitle, showTitle, setShowTitle } = useHeaderTitle();
  const isStaging = stagingFeatureFlagEnabled();

  // Radix menu for React doesn't have a way to turn this off, simulate it by a really long delay
  const disableOpenOnHoverDelay = 999999;

  // Filter nav links and sublinks based on feature flags
  const filteredNavLinks = NAV_LINKS.filter(
    (link) => !link.onlyShowOnStaging || isStaging,
  ).map((link) => {
    if (link.sublinks) {
      return {
        ...link,
        sublinks: filterNavSublinks(link.sublinks, isStaging),
      };
    }
    return link;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("newsletter") === "open") {
      setIsSignUpOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= 125) {
        setShowTitle(true);
      } else {
        setShowTitle(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [headerTitle, showTitle, setShowTitle]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  const LanguageButtons = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => changeLanguage("en")}
        className={cn(
          currentLanguage === "en" && "bg-black-1 rounded-full px-1",
        )}
      >
        🇬🇧
      </button>
      <span className="text-grey">|</span>
      <button
        onClick={() => changeLanguage("sv")}
        className={cn(
          currentLanguage === "sv" && "bg-black-1 rounded-full px-1",
        )}
      >
        🇸🇪
      </button>
    </div>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-screen flex items-center justify-between bg-black-2 z-50",
        "h-12",
      )}
    >
      <div className="container lg:mx-auto px-4 flex justify-between">
        <LocalizedLink
          to="/"
          className="flex items-center gap-2 text-base font-medium"
        >
          Klimatkollen
        </LocalizedLink>

        {/* Desktop Navigation */}
        <NavigationMenu
          className="hidden lg:flex items-center ml-auto"
          delayDuration={disableOpenOnHoverDelay}
        >
          <NavigationMenuList>
            {filteredNavLinks.map((item) =>
              item.sublinks ? (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuTrigger
                    className={cn(
                      "flex gap-2 p-3",
                      "data-[state=open]:bg-black-1 data-[state=closed]:bg-transparent",
                      location.pathname.startsWith(
                        localizedPath(currentLanguage, item.path),
                      )
                        ? "text-white"
                        : "text-grey hover:text-white",
                    )}
                  >
                    {item.icon}
                    {t(item.label)}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-56 w-full p-3 top-12 bg-black-2">
                    <SubLinksMenu sublinks={item.sublinks} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem
                  key={item.path}
                  className={cn(
                    "h-10 lg:h12 flex items-center",
                    location.pathname.startsWith(
                      localizedPath(currentLanguage, item.path),
                    )
                      ? "text-white"
                      : "text-grey hover:text-white",
                  )}
                >
                  <NavigationMenuLink asChild>
                    <LocalizedLink
                      to={item.path}
                      className="flex gap-2 p-3 items-center"
                    >
                      {item.icon}
                      {t(item.label)}
                    </LocalizedLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
            {user && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 px-3 py-3 h-full transition-all text-sm cursor-pointer text-grey hover:text-white">
                  <span>Internal</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <SubLinksMenu sublinks={INTERNAL_LINKS} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
          <div className="ml-4 h-full flex items-center">
            <HeaderSearchButton className="mx-2" />
            <LanguageButtons className={"hidden md:flex mx-4 "} />
            <NewsletterPopover
              isOpen={isSignUpOpen}
              onOpenChange={setIsSignUpOpen}
              buttonText={t("header.newsletter")}
            />
          </div>
        </NavigationMenu>

        {/* Mobile Fullscreen Menu */}
        {showTitle && (
          <span className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
            {headerTitle}
          </span>
        )}
        <div className="flex gap-6">
          <HeaderSearchButton
            className="w-full lg:hidden"
            closeMobileNav={closeMobileNav}
          />

          <button
            className="lg:hidden text-white"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="overflow-y-auto fixed inset-0 top-10 w-full z-100 bg-black-2">
            <div className="p-8">
              <div className="flex flex-col gap-6 text-lg w-full">
                <LanguageButtons />
                {filteredNavLinks.map((link) => (
                  <div key={link.path} className="flex flex-col">
                    <LocalizedLink
                      to={link.path}
                      onClick={toggleMenu}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {link.icon}
                      {t(link.label)}
                    </LocalizedLink>
                    {link.sublinks && (
                      <div className="flex flex-col gap-2 pl-4 mt-2">
                        {link.sublinks.map((item) =>
                          isNavSubGroup(item) ? (
                            <NavSubGroupSection
                              key={item.label}
                              group={item}
                              onNavigate={toggleMenu}
                            />
                          ) : (
                            <NavSubLinkItem
                              key={item.path}
                              sublink={item}
                              className={NAV_TITLE_CLASS}
                              onNavigate={toggleMenu}
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Newsletter button in mobile menu */}
                <button
                  onClick={() => {
                    setMenuOpen(false); // Close the menu
                    setIsSignUpOpen(true); // Open the newsletter popover
                  }}
                  className="flex items-center gap-2 text-blue-3"
                >
                  <Mail className="w-4 h-4" />
                  {t("header.newsletter")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
