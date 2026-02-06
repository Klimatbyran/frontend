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

interface NavLink {
  label: string;
  icon?: React.ReactElement;
  path: string;
  sublinks?: NavSubLink[];
  onlyShowOnStaging?: boolean;
}

const NAV_LINKS: NavLink[] = [
  {
    label: "header.data",
    icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
    path: `/explore`,
    sublinks: [
      {
        label: "header.companies",
        path: `/companies`,
        onlyShowOnStaging: true,
      },
      {
        label: "header.municipalities",
        path: `/municipalities`,
      },
      {
        label: "header.regionsRanked",
        path: `/regions`,
        onlyShowOnStaging: true,
      },
      {
        label: "header.companiesSectors",
        path: `/sectors`,
      },
      {
        label: "header.explore",
        path: `/explore/companies`,
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
    ],
  },
  {
    label: "header.products",
    path: `/products`,
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
];

const SubLinksMenu = ({ sublinks }: { sublinks: NavSubLink[] }) => {
  const { t } = useTranslation();

  return (
    <ul>
      {sublinks.map((sublink) => (
        <li key={sublink.path} className="hover:bg-black-1 px-2 py-1.5 text-sm">
          {sublink.path.startsWith("https://") ? (
            <a
              href={sublink.path}
              className="flex justify-between w-full"
              target="_blank"
              key={sublink.path}
            >
              {t(sublink.label)}
            </a>
          ) : (
            <LocalizedLink
              to={sublink.path}
              className="flex justify-between w-full"
            >
              {t(sublink.label)}
            </LocalizedLink>
          )}
        </li>
      ))}
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
        sublinks: link.sublinks.filter(
          (sublink) => !sublink.onlyShowOnStaging || isStaging,
        ),
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
        "h-10 lg:h-12",
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

        <button
          className="lg:hidden text-white"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        {menuOpen && (
          <div className="overflow-y-auto fixed inset-0 top-10 w-full z-100 bg-black-2">
            <div className="p-8">
              <div className="flex flex-col gap-6 text-lg w-full">
                <HeaderSearchButton
                  className="w-full"
                  onSearchResultClick={toggleMenu}
                />
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
                        {link.sublinks.map((sublink) =>
                          sublink.path.startsWith("https://") ? (
                            <a
                              href={sublink.path}
                              className="flex items-center gap-2 text-sm text-gray-400"
                              target="_blank"
                              key={sublink.path}
                              onClick={toggleMenu}
                            >
                              {t(sublink.label)}
                            </a>
                          ) : (
                            <LocalizedLink
                              key={sublink.path}
                              to={sublink.path}
                              onClick={toggleMenu}
                              className="flex items-center gap-2 text-sm text-gray-400"
                            >
                              {t(sublink.label)}
                            </LocalizedLink>
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
